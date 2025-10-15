"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Eye, Edit } from "lucide-react"
import { getAllStudents } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

function CoordinatorStudentListContent() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to truncate subjects/grades to max 2 items

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      setError(null)
      try {
        // Check if we're on client side
        if (typeof window === 'undefined') {
          setError("Please wait, loading...");
          return;
        }
        
         // Get user from localStorage
         const user = localStorage.getItem("sis_user");
         if (user) {
           
           // Backend automatically filters students based on logged-in coordinator
           // No need to find coordinator separately
           const studentsData = await getAllStudents(true); // Force refresh to get latest data
           
           // Map student data to the expected format
           const mappedStudents = studentsData.map((student: any) => ({
             id: student.id,
             name: student.name || 'Unknown',
             student_code: student.student_id || student.student_code || 'Not Assigned',
             gr_no: student.gr_no || 'Not Assigned',
             father_name: student.father_name || 'Not provided',
             email: student.email || 'Not provided',
             phone: student.contact_number || 'Not provided',
             enrollment_year: student.enrollment_year || 'Not provided',
             current_grade: student.current_grade || 'Not Assigned',
             classroom_name: student.classroom_name || 'Not Assigned',
             campus_name: student.campus_name || 'Not Assigned',
             current_state: student.current_state || 'Active',
             gender: student.gender || 'Not specified',
             shift: student.shift || 'Not specified'
           }))
          
          setStudents(mappedStudents)
        } else {
          setError("User not logged in")
        }
      } catch (err: any) {
        console.error("Error fetching students:", err)
        setError(err.message || "Failed to load students")
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.student_code.toLowerCase().includes(search.toLowerCase()) ||
    student.gr_no.toLowerCase().includes(search.toLowerCase()) ||
    student.father_name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student List
          </CardTitle>
          <p className="text-sm text-gray-600">
            View and manage students from classrooms taught by your assigned teachers
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name, ID, or father's name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredStudents.length} of {students.length} Students
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading students..." />
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p className="font-medium">Error: {error}</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
               <TableHeader>
                 <TableRow style={{ backgroundColor: '#274c77' }}>
                   <TableHead className="text-white">Name</TableHead>
                   <TableHead className="text-white">Student ID</TableHead>
                   <TableHead className="text-white">GR No</TableHead>
                   <TableHead className="text-white">Father Name</TableHead>
                   <TableHead className="text-white">Grade</TableHead>
                   <TableHead className="text-white">Classroom</TableHead>
                   <TableHead className="text-white">Status</TableHead>
                   <TableHead className="text-white">Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : ''}`}
                    style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}
                  >
                     <TableCell className="font-medium">{student.name}</TableCell>
                     <TableCell className="text-sm text-gray-600">{student.student_code}</TableCell>
                     <TableCell className="text-sm text-gray-600">{student.gr_no}</TableCell>
                     <TableCell className="text-sm text-gray-600">{student.father_name}</TableCell>
                     <TableCell>{student.current_grade}</TableCell>
                     <TableCell>{student.classroom_name}</TableCell>
                     <TableCell>
                       <Badge 
                         variant={student.current_state === 'Active' ? 'default' : 'secondary'}
                         style={{ 
                           backgroundColor: student.current_state === 'Active' ? '#10b981' : '#6b7280',
                           color: 'white'
                         }}
                       >
                         {student.current_state}
                       </Badge>
                     </TableCell>
                     <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                          onClick={() => router.push(`/admin/students/profile?id=${student.id}`)}
                          title="View Student Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                          title="Edit Student"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredStudents.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
              {search && (
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CoordinatorStudentListPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    document.title = "Student List - Coordinator | IAK SMS";
  }, [])

  if (!isClient) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingSpinner message="Loading..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return <CoordinatorStudentListContent />
}
