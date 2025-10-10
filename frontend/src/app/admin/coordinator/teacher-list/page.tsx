"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Eye, Edit } from "lucide-react"
import { getAllTeachers } from "@/lib/api"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

function CoordinatorTeacherListContent() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to truncate subjects/grades to max 2 items
  const truncateList = (listString: string, maxItems: number = 2) => {
    if (!listString) return ''
    const items = listString.split(', ').map(item => item.trim())
    if (items.length <= maxItems) {
      return listString
    }
    return `${items.slice(0, maxItems).join(', ')} ...`
  }

  useEffect(() => {
    async function fetchTeachers() {
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
           const userData = JSON.parse(user);
           
           // Backend automatically filters teachers based on logged-in coordinator
           // No need to find coordinator separately
           const teachersData = await getAllTeachers();
           
           // Map teacher data to the expected format
           const mappedTeachers = teachersData.map((teacher: any) => ({
             id: teacher.id,
             name: teacher.full_name || 'Unknown',
             subject: teacher.current_subjects || 'Not Assigned',
             classes: teacher.current_classes_taught || 'Not Assigned',
             email: teacher.email || 'Not provided',
             phone: teacher.contact_number || 'Not provided',
             joining_date: teacher.joining_date || 'Not provided',
             experience: teacher.total_experience_years ? `${teacher.total_experience_years} years` : 'Not provided',
             employee_code: teacher.employee_code,
             shift: teacher.shift,
             is_class_teacher: teacher.is_class_teacher
           }))
          
          setTeachers(mappedTeachers)
        } else {
          setError("User not logged in")
        }
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
     teacher.email.toLowerCase().includes(search.toLowerCase())
   )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Teacher List</h1>
          <p className="text-gray-600">Manage and review teacher assignments</p>
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
              placeholder="Search teachers by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              style={{ borderColor: '#a3cef1' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Teachers Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner message="Loading teachers..." />
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error: {error}</div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
               <TableHeader>
                 <TableRow style={{ backgroundColor: '#274c77' }}>
                   <TableHead className="text-white">Name</TableHead>
                   <TableHead className="text-white">Subject</TableHead>
                   <TableHead className="text-white">Email</TableHead>
                   <TableHead className="text-white">Classes</TableHead>
                   <TableHead className="text-white">Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher, index) => (
                  <TableRow 
                    key={teacher.id}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : ''}`}
                    style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}
                  >
                     <TableCell className="font-medium">{teacher.name}</TableCell>
                     <TableCell>{truncateList(teacher.subject)}</TableCell>
                     <TableCell className="text-sm text-gray-600">{teacher.email}</TableCell>
                     <TableCell>{truncateList(teacher.classes)}</TableCell>
                     <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                          onClick={() => router.push(`/admin/teachers/profile?id=${teacher.id}`)}
                          title="View Teacher Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                          title="Edit Teacher"
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
        </CardContent>
      </Card>
    </div>
  )
}

export default function CoordinatorTeacherListPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    document.title = "Teacher List - Coordinator | IAK SMS";
  }, [])

  if (!isClient) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teacher List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingSpinner message="Loading..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return <CoordinatorTeacherListContent />
}
