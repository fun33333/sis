"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Mail, Phone, MapPin, GraduationCap, Calendar, BookOpen, Eye, Edit, User } from "lucide-react"
import { getAllStudents, getAllCampuses, apiPatch } from "@/lib/api"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getCurrentUserRole } from "@/lib/permissions"

export default function StudentListPage() {
  useEffect(() => {
    document.title = "Student List | IAK SMS";
  }, []);

  const router = useRouter()
  const [search, setSearch] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [campusFilter, setCampusFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const pageSize = 30

  // Edit form states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [campuses, setCampuses] = useState<any[]>([])
  
  // Role-based access control
  const [userRole, setUserRole] = useState<string>("")
  const canEdit = userRole !== "superadmin"

  useEffect(() => {
    // Get user role
    setUserRole(getCurrentUserRole())
    
    async function fetchStudents() {
      setLoading(true)
      setError(null)
      try {
        const [studentsData, campusesData] = await Promise.all([
          getAllStudents(),
          getAllCampuses().catch(err => {
            console.error('Campus API Error:', err)
            return []
          })
        ])
        
        // Handle different response structures for campuses
        let actualCampusData = campusesData
        if (campusesData && typeof campusesData === 'object' && 'results' in campusesData && Array.isArray((campusesData as any).results)) {
          actualCampusData = (campusesData as any).results
        } else if (Array.isArray(campusesData)) {
          actualCampusData = campusesData
        }
        setCampuses(Array.isArray(actualCampusData) ? actualCampusData : [])

        // Create campus mapping
        const campusMap = new Map()
        if (Array.isArray(actualCampusData)) {
          actualCampusData.forEach((campus: any) => {
            campusMap.set(campus.id, campus.campus_name || campus.name)
          })
        }

        // Map student data to the expected format
        const mappedStudents = Array.isArray(studentsData) ? studentsData.map((student: any) => ({
          id: student.id,
          name: student.name || 'Unknown',
          gr_no: student.gr_no || 'Not Assigned',
          campus: student.campus ? 
            (typeof student.campus === 'object' ? 
              student.campus.campus_name || student.campus.name : 
              campusMap.get(student.campus)
            ) : 'Unknown Campus',
          current_grade: student.current_grade || 'Not Assigned',
          section: student.section || 'Not Assigned',
          shift: student.shift || 'Not Assigned',
          current_state: student.current_state || 'Not Active',
          father_contact: student.father_contact || 'Not provided',
          mother_contact: student.mother_contact || 'Not provided',
          emergency_contact: student.emergency_contact || 'Not provided',
          father_name: student.father_name || 'Not provided',
          mother_name: student.mother_name || 'Not provided',
          dob: student.dob || null,
          gender: student.gender || 'Not specified',
          address: student.address || 'Not provided',
          enrollment_year: student.enrollment_year || 'Not provided',
          created_at: student.created_at || 'Not provided',
          updated_at: student.updated_at || 'Not provided'
        })) : []

        setStudents(mappedStudents)
      } catch (err: any) {
        console.error("Error fetching students:", err)
        setError(err.message || "Failed to load students")
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filteredStudents = students.filter(student => {
    const searchTerm = search.toLowerCase()
    const matchesSearch = (
      student.name.toLowerCase().includes(searchTerm) ||
      student.gr_no.toLowerCase().includes(searchTerm) ||
      student.campus.toLowerCase().includes(searchTerm) ||
      student.current_grade.toLowerCase().includes(searchTerm) ||
      student.father_contact.toLowerCase().includes(searchTerm) ||
      student.father_name.toLowerCase().includes(searchTerm)
    )

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && student.current_state.toLowerCase() === "active") ||
      (statusFilter === "inactive" && student.current_state.toLowerCase() !== "active")

    const matchesCampus = campusFilter === "all" || 
      student.campus.toLowerCase().includes(campusFilter.toLowerCase())

    const matchesGrade = gradeFilter === "all" || 
      student.current_grade.toLowerCase().includes(gradeFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesCampus && matchesGrade
  })

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, campusFilter, gradeFilter])

  const totalRecords = filteredStudents.length
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalRecords / pageSize)), [totalRecords])
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(totalRecords, startIndex + pageSize)

  // Clamp current page if total pages shrink (e.g., after search)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const currentPageStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, startIndex + pageSize)
  }, [filteredStudents, startIndex, pageSize])

  const pageNumbers = useMemo<(number | "ellipsis")[]>(() => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (currentPage > 3) pages.push("ellipsis")
    const windowStart = Math.max(2, currentPage - 1)
    const windowEnd = Math.min(totalPages - 1, currentPage + 1)
    for (let i = windowStart; i <= windowEnd; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
    return pages
  }, [currentPage, totalPages])

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Not provided') return 'Not provided'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUniqueCampuses = () => {
    const campusList = [...new Set(students.map(s => s.campus).filter(Boolean))]
    if (campusList.length === 0) {
      return ['Campus 1', 'Campus 2', 'Campus 3', 'Main Campus', 'Branch Campus']
    }
    return campusList.sort()
  }

  const getUniqueGrades = () => {
    const grades = [...new Set(students.map(s => s.current_grade).filter(Boolean))]
    return grades.sort()
  }

  // Edit form functions
  const openEditForm = (student: any) => {
    setSelectedStudent(student)
    setEditFormData({
      name: student.name || '',
      gr_no: student.gr_no || '',
      current_grade: student.current_grade || '',
      section: student.section || '',
      shift: student.shift || '',
      current_state: student.current_state || '',
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      father_contact: student.father_contact || '',
      mother_contact: student.mother_contact || '',
      emergency_contact: student.emergency_contact || '',
      dob: student.dob ? student.dob.split('T')[0] : '',
      gender: student.gender || '',
      address: student.address || '',
      enrollment_year: student.enrollment_year || '',
      campus: student.campus || ''
    })
    setIsEditOpen(true)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!selectedStudent) return

    setIsSaving(true)
    try {
      const updateData = {
        name: editFormData.name,
        gr_no: editFormData.gr_no,
        current_grade: editFormData.current_grade,
        section: editFormData.section,
        shift: editFormData.shift,
        current_state: editFormData.current_state,
        father_name: editFormData.father_name,
        mother_name: editFormData.mother_name,
        father_contact: editFormData.father_contact,
        mother_contact: editFormData.mother_contact,
        emergency_contact: editFormData.emergency_contact,
        dob: editFormData.dob,
        gender: editFormData.gender,
        address: editFormData.address,
        enrollment_year: editFormData.enrollment_year ? parseInt(editFormData.enrollment_year) : null
      }

      await apiPatch(`/api/students/${selectedStudent.id}/`, updateData)
      
      // Update local state
      setStudents((prev: any[]) => 
        prev.map(s => s.id === selectedStudent.id ? { ...s, ...updateData } : s)
      )
      
      toast.success("Student updated successfully!")
      setIsEditOpen(false)
    } catch (err: any) {
      console.error("Error updating student:", err)
      toast.error(err.message || "Failed to update student")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Student List</h1>
          <p className="text-gray-600">Browse and manage all students in the system</p>
          {!loading && !error && (
            <div className="text-sm text-gray-500 mt-1">
              <p>Total Students: {students.length} | Showing: {filteredStudents.length}</p>
              {getUniqueCampuses().length === 0 && (
                <p className="text-yellow-600">⚠️ Campus data not available - using fallback options</p>
              )}
            </div>
          )}
        </div>
        <Badge style={{ backgroundColor: '#6096ba', color: 'white' }} className="px-4 py-2">
          {filteredStudents.length} of {students.length} Students
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students by name, GR number, campus, or grade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
                <select
                  value={campusFilter}
                  onChange={(e) => setCampusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Campuses</option>
                  {getUniqueCampuses().map(campus => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Grades</option>
                  {getUniqueGrades().map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Students Overview
          </CardTitle>
          <CardDescription>Click on any student to view their detailed profile</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error: {error}</div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-[#274c77] text-white hover:bg-[#274c77]">
                    <TableHead className="text-white min-w-[200px]">Student</TableHead>
                    <TableHead className="text-white min-w-[120px]">GR No & Grade</TableHead>
                    <TableHead className="text-white min-w-[120px]">Campus</TableHead>
                    <TableHead className="text-white min-w-[150px]">Contact</TableHead>
                    <TableHead className="text-white min-w-[100px]">Enrollment</TableHead>
                    <TableHead className="text-white min-w-[80px]">Status</TableHead>
                    <TableHead className="text-white min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageStudents.map((student, index) => {
                    const isActive = student.current_state.toLowerCase() === 'active'
                    return (
                      <TableRow
                        key={student.id}
                        className={`hover:bg-[#a3cef1] transition ${index % 2 === 0 ? 'bg-[#e7ecef]' : 'bg-white'}`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-green-100 text-green-600 font-semibold rounded-full flex items-center justify-center text-sm">
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.gender}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">{student.gr_no}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <GraduationCap className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">{student.current_grade}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate max-w-[100px]">{student.campus}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{student.father_contact}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{student.father_name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{student.enrollment_year}</div>
                            <div className="text-gray-500 text-xs">
                              {student.shift}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <span className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full">Active</span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded-full">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/students/profile?studentId=${student.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(student)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredStudents.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No students found matching your search criteria.
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-[#274c77]">
                  {totalRecords > 0
                    ? `Showing ${startIndex + 1}-${endIndex} of ${totalRecords}`
                    : 'No records found'}
                </div>
                <Pagination className="w-full sm:w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)) }}
                      />
                    </PaginationItem>
                    {pageNumbers.map((p, i) => (
                      p === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === currentPage}
                            onClick={(e) => { e.preventDefault(); setCurrentPage(p) }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)) }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Student Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={editFormData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="gr_no">GR Number</Label>
                  <Input
                    id="gr_no"
                    value={editFormData.gr_no || ''}
                    onChange={(e) => handleInputChange('gr_no', e.target.value)}
                    placeholder="Enter GR number"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={editFormData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="enrollment_year">Enrollment Year</Label>
                  <Input
                    id="enrollment_year"
                    type="number"
                    value={editFormData.enrollment_year || ''}
                    onChange={(e) => handleInputChange('enrollment_year', e.target.value)}
                    placeholder="Enter enrollment year"
                  />
                </div>
                <div>
                  <Label htmlFor="current_state">Status</Label>
                  <Select value={editFormData.current_state || ''} onValueChange={(value) => handleInputChange('current_state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editFormData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_grade">Current Grade</Label>
                  <Input
                    id="current_grade"
                    value={editFormData.current_grade || ''}
                    onChange={(e) => handleInputChange('current_grade', e.target.value)}
                    placeholder="Enter current grade"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={editFormData.section || ''}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    placeholder="Enter section"
                  />
                </div>
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={editFormData.shift || ''} onValueChange={(value) => handleInputChange('shift', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="father_name">Father Name</Label>
                  <Input
                    id="father_name"
                    value={editFormData.father_name || ''}
                    onChange={(e) => handleInputChange('father_name', e.target.value)}
                    placeholder="Enter father name"
                  />
                </div>
                <div>
                  <Label htmlFor="father_contact">Father Contact</Label>
                  <Input
                    id="father_contact"
                    value={editFormData.father_contact || ''}
                    onChange={(e) => handleInputChange('father_contact', e.target.value)}
                    placeholder="Enter father contact"
                  />
                </div>
                <div>
                  <Label htmlFor="mother_name">Mother Name</Label>
                  <Input
                    id="mother_name"
                    value={editFormData.mother_name || ''}
                    onChange={(e) => handleInputChange('mother_name', e.target.value)}
                    placeholder="Enter mother name"
                  />
                </div>
                <div>
                  <Label htmlFor="mother_contact">Mother Contact</Label>
                  <Input
                    id="mother_contact"
                    value={editFormData.mother_contact || ''}
                    onChange={(e) => handleInputChange('mother_contact', e.target.value)}
                    placeholder="Enter mother contact"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={editFormData.emergency_contact || ''}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}