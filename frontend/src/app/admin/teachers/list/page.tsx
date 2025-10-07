"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Mail, Phone, MapPin, GraduationCap, Calendar, BookOpen, Eye, Edit } from "lucide-react"
import { getAllTeachers, getAllCampuses } from "@/lib/api"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions"

export default function TeacherListPage() {
  useEffect(() => {
    document.title = "Teacher List | IAK SMS";
  }, []);

  const router = useRouter()
  const [search, setSearch] = useState("")
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [campusFilter, setCampusFilter] = useState<string>("all")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  const pageSize = 30
  
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
    
    async function fetchTeachers() {
      setLoading(true)
      setError(null)
      try {
        const [teachersData, campusesData] = await Promise.all([
          getAllTeachers(),
          getAllCampuses().catch(err => {
            console.error('Campus API Error:', err)
            return []
          })
        ])
        
        
        // Also fix campus mapping to use campus_name instead of name
        const campusMap = new Map()
        
        // Handle different response structures
        let actualCampusData = campusesData
        if (campusesData && typeof campusesData === 'object' && 'results' in campusesData && Array.isArray((campusesData as any).results)) {
          actualCampusData = (campusesData as any).results
        } else if (Array.isArray(campusesData)) {
          actualCampusData = campusesData
        }
        
        if (Array.isArray(actualCampusData)) {
          actualCampusData.forEach((campus: any) => {
            campusMap.set(campus.id, campus.campus_name || campus.name)  // ✅ Use campus_name
          })
        }

          // Map teacher data to the expected format
          const mappedTeachers = Array.isArray(teachersData) ? teachersData.map((teacher: any) => {
            const campusName = teacher.current_campus ? 
              (typeof teacher.current_campus === 'object' ? 
                teacher.current_campus.campus_name || teacher.current_campus.name : 
                campusMap.get(teacher.current_campus)
              ) : 'Unknown Campus'
            
            return {
            id: teacher.id,
            name: teacher.full_name || 'Unknown',
            subject: teacher.current_subjects || 'Not Assigned',
            campus: campusName,
            assigned_coordinator: teacher.assigned_coordinator || null,
            email: teacher.email || 'Not provided',
            phone: teacher.contact_number || 'Not provided',
            experience: teacher.total_experience_years || 'Not provided',
            is_active: teacher.is_currently_active,
            classes: teacher.current_classes_taught || 'Not Assigned',
            joining_date: teacher.role_start_date || 'Not provided',
            qualification: teacher.education_level || 'Not provided',
            gender: teacher.gender || 'Not specified',
            dob: teacher.dob || null,
            address: teacher.permanent_address || 'Not provided'
            }
          }) : []

        setTeachers(mappedTeachers)
      } catch (err: any) {
        console.error("Error fetching teachers:", err)
        setError(err.message || "Failed to load teachers")
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  const filteredTeachers = teachers.filter(teacher => {
    const searchTerm = search.toLowerCase()
    const matchesSearch = (
      teacher.name.toLowerCase().includes(searchTerm) ||
      teacher.subject.toLowerCase().includes(searchTerm) ||
      teacher.campus.toLowerCase().includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm) ||
      teacher.qualification.toLowerCase().includes(searchTerm) ||
      teacher.classes.toLowerCase().includes(searchTerm)
    )

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && teacher.is_active) ||
      (statusFilter === "inactive" && !teacher.is_active)

    // Principal campus filtering - only show teachers from principal's campus
    const matchesCampus = userRole === "principal" 
      ? (userCampus ? teacher.campus.toLowerCase().includes(userCampus.toLowerCase()) : true)
      : (campusFilter === "all" || teacher.campus.toLowerCase().includes(campusFilter.toLowerCase()))

    const matchesSubject = subjectFilter === "all" || 
      teacher.subject.toLowerCase().includes(subjectFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesCampus && matchesSubject
  })

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, campusFilter, subjectFilter])

  const totalRecords = filteredTeachers.length
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalRecords / pageSize)), [totalRecords])
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(totalRecords, startIndex + pageSize)

  // Clamp current page if total pages shrink (e.g., after search)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const currentPageTeachers = useMemo(() => {
    return filteredTeachers.slice(startIndex, startIndex + pageSize)
  }, [filteredTeachers, startIndex, pageSize])

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
    const campuses = [...new Set(teachers.map(t => t.campus).filter(Boolean))]
    // Add fallback campuses if no data is available
    if (campuses.length === 0) {
      return ['Campus 1', 'Campus 2', 'Campus 3', 'Main Campus', 'Branch Campus']
    }
    return campuses.sort()
  }

  const getUniqueSubjects = () => {
    const subjects = [...new Set(teachers.map(t => t.subject).filter(Boolean))]
    return subjects.sort()
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
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Teacher List</h1>
          <p className="text-gray-600">Browse and manage all teachers in the system</p>
           {!loading && !error && (
             <div className="text-sm text-gray-500 mt-1">
               <p>Total Teachers: {teachers.length} | Showing: {filteredTeachers.length}</p>
               {getUniqueCampuses().length === 0 && (
                 <p className="text-yellow-600">⚠️ Campus data not available - using fallback options</p>
               )}
             </div>
           )}
        </div>
        <Badge style={{ backgroundColor: '#6096ba', color: 'white' }} className="px-4 py-2">
          {filteredTeachers.length} of {teachers.length} Teachers
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
                 placeholder="Search teachers by name, subject, campus, or email..."
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
                      {getUniqueCampuses().length === 0 && (
                        <option value="unknown">Unknown Campus</option>
                      )}
                    </select>
                  </div>
                )}
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                 <select
                   value={subjectFilter}
                   onChange={(e) => setSubjectFilter(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">All Subjects</option>
                   {getUniqueSubjects().map(subject => (
                     <option key={subject} value={subject}>{subject}</option>
                   ))}
                 </select>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

      {/* Teachers List */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Teachers Overview
          </CardTitle>
          <CardDescription>Click on any teacher to view their detailed profile</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading teachers...</p>
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
               <Table className="w-full min-w-[920px]">
                 <TableHeader>
                   <TableRow className="bg-[#274c77] text-white hover:bg-[#274c77]">
                     <TableHead className="text-white min-w-[200px]">Teacher</TableHead>
                     <TableHead className="text-white min-w-[150px]">Subject & Classes</TableHead>
                     <TableHead className="text-white min-w-[120px]">Campus</TableHead>
                     <TableHead className="text-white min-w-[120px]">Coordinator</TableHead>
                     <TableHead className="text-white min-w-[180px]">Contact</TableHead>
                     <TableHead className="text-white min-w-[100px]">Experience</TableHead>
                     <TableHead className="text-white min-w-[80px]">Status</TableHead>
                     <TableHead className="text-white min-w-[100px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {currentPageTeachers.map((teacher, index) => {
                    const isActive = !!teacher.is_active
                    return (
                       <TableRow
                         key={teacher.id}
                         className={`hover:bg-[#a3cef1] transition ${index % 2 === 0 ? 'bg-[#e7ecef]' : 'bg-white'}`}
                       >
                         <TableCell className="font-medium">
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-blue-100 text-blue-600 font-semibold rounded-full flex items-center justify-center text-sm">
                               {getInitials(teacher.name)}
                             </div>
                             <div>
                               <div className="font-semibold text-gray-900">{teacher.name}</div>
                               <div className="text-sm text-gray-500">{teacher.qualification}</div>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="space-y-1">
                             <div className="flex items-center gap-2 text-sm">
                               <BookOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
                               <span className="truncate max-w-[120px]">{teacher.subject}</span>
                             </div>
                             <div className="flex items-center gap-2 text-sm text-gray-600">
                               <GraduationCap className="w-4 h-4 text-gray-500 flex-shrink-0" />
                               <span className="truncate max-w-[120px]">{teacher.classes}</span>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2 text-sm">
                             <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                             <span className="truncate max-w-[100px]">{teacher.campus}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm">
                             {teacher.assigned_coordinator ? (
                               <div className="flex items-center gap-2">
                                 <div className="h-6 w-6 bg-blue-100 text-blue-600 font-semibold rounded-full flex items-center justify-center text-xs">
                                   {teacher.assigned_coordinator.full_name?.charAt(0) || 'C'}
                                 </div>
                                 <span className="truncate max-w-[100px] font-medium">
                                   {teacher.assigned_coordinator.full_name}
                                 </span>
                               </div>
                             ) : (
                               <span className="text-gray-400 text-xs">Not Assigned</span>
                             )}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="space-y-1">
                             <div className="flex items-center gap-2 text-sm">
                               <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                               <span className="truncate max-w-[150px]">{teacher.email}</span>
                             </div>
                             <div className="flex items-center gap-2 text-sm text-gray-600">
                               <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                               <span className="truncate max-w-[150px]">{teacher.phone}</span>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm">
                             <div className="font-medium">{teacher.experience} years</div>
                             <div className="text-gray-500 text-xs">
                               Joined: {formatDate(teacher.joining_date)}
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
                               onClick={() => router.push(`/admin/teachers/profile?teacherId=${teacher.id}`)}
                               className="h-8 w-8 p-0"
                             >
                               <Eye className="w-4 h-4" />
                             </Button>
                             {canEdit && (
                               <Button
                                 size="sm"
                                 variant="outline"
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
              {filteredTeachers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No teachers found matching your search criteria.
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
