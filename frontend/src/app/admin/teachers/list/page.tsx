"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"
import { getAllTeachers, getAllCampuses } from "@/lib/api"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

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
  const pageSize = 30

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true)
      setError(null)
      try {
        const [teachersData, campusesData] = await Promise.all([
          getAllTeachers(),
          getAllCampuses()
        ])
        
        // Create campus mapping
        const campusMap = new Map()
        if (Array.isArray(campusesData)) {
          campusesData.forEach((campus: any) => {
            campusMap.set(campus.id, campus.name)
          })
        }
        
        // Map teacher data to the expected format
        const mappedTeachers = Array.isArray(teachersData) ? teachersData.map((teacher: any) => ({
          id: teacher.id,
          name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.username || 'Unknown',
          subject: teacher.subject || 'Not Assigned',
          campus: campusMap.get(teacher.campus) || 'Unknown Campus',
          email: teacher.email || 'Not provided',
          phone: teacher.phone || 'Not provided',
          experience: teacher.experience || 'Not provided',
          is_active: teacher.is_active,
          classes: teacher.classes || 'Not Assigned',
          joining_date: teacher.joining_date || 'Not provided',
          qualification: teacher.qualification || 'Not provided'
        })) : []
        
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

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(search.toLowerCase()) ||
    teacher.campus.toLowerCase().includes(search.toLowerCase()) ||
    teacher.email.toLowerCase().includes(search.toLowerCase())
  )

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Teacher List</h1>
          <p className="text-gray-600">Browse and manage all teachers in the system</p>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              Total Teachers: {teachers.length} | Showing: {filteredTeachers.length}
            </p>
          )}
        </div>
        <Badge style={{ backgroundColor: '#6096ba', color: 'white' }} className="px-4 py-2">
          {filteredTeachers.length} of {teachers.length} Teachers
        </Badge>
      </div>

      {/* Search */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers by name, subject, campus, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
            <div>
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-[#274c77] text-white hover:bg-[#274c77]">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Subject</TableHead>
                    <TableHead className="text-white">Campus</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Classes</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageTeachers.map((teacher, index) => {
                    const isActive = !!teacher.is_active
                    return (
                      <TableRow
                        key={teacher.id}
                        className={`cursor-pointer hover:bg-[#a3cef1] transition ${index % 2 === 0 ? 'bg-[#e7ecef]' : 'bg-white'}`}
                        onClick={() => router.push(`/admin/teachers/profile?teacherId=${teacher.id}`)}
                      >
                        <TableCell className="font-medium">{teacher.name || 'Unknown'}</TableCell>
                        <TableCell>{teacher.subject || 'Not Assigned'}</TableCell>
                        <TableCell>{teacher.campus || 'Unknown Campus'}</TableCell>
                        <TableCell>{teacher.email || 'Not provided'}</TableCell>
                        <TableCell>{teacher.classes || 'Not Assigned'}</TableCell>
                        <TableCell>
                          {isActive ? (
                            <span className="px-2 py-1 text-xs font-semibold text-white bg-green-600/70 rounded-full shadow">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-white bg-[#8b8c89] rounded-full shadow">Inactive</span>
                          )}
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
