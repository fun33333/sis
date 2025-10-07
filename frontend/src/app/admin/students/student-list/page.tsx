"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Mail, Phone, MapPin, GraduationCap, Calendar, BookOpen, Eye, User } from "lucide-react"
import { getAllStudents } from "@/lib/api"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions"

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
  const pageSize = 500

  
  // Role-based access control
  const [userRole, setUserRole] = useState<string>("")
  const [userCampus, setUserCampus] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const canEdit = userRole !== "superadmin"

  useEffect(() => {
    setIsClient(true)
    // Get user role and campus
    setUserRole(getCurrentUserRole())
    
    // Get user campus for principal filtering
    const user = getCurrentUser() as any
    if (user?.campus?.campus_name) {
      setUserCampus(user.campus.campus_name)
    }
    
    async function fetchStudents() {
      setLoading(true)
      setError(null)
      try {
        const studentsData = await getAllStudents()

        // Map student data to the expected format
        const mappedStudents = Array.isArray(studentsData) ? studentsData.map((student: any) => ({
          id: student.id,
          name: student.name || 'Unknown',
          gr_no: student.gr_no || 'Not Assigned',
          campus: student.campus ? 
            (typeof student.campus === 'object' ? 
              student.campus.campus_name || student.campus.name : 
              'Unknown Campus'
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

    // Principal campus filtering - only show students from principal's campus
    const matchesCampus = userRole === "principal" 
      ? (userCampus ? student.campus.toLowerCase().includes(userCampus.toLowerCase()) : true)
      : (campusFilter === "all" || student.campus.toLowerCase().includes(campusFilter.toLowerCase()))

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


  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
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
            
            {/* Filters - Hide for teachers */}
            {userRole !== "teacher" && (
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
              
                {/* Hide campus filter for principal - they only see their campus data */}
                {userRole !== "principal" && (
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
                )}
              
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
            )}
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

    </div>
  )
}