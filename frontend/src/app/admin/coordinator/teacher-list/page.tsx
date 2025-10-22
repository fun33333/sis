"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Eye, Edit, User, Mail, Phone, GraduationCap, MapPin, Calendar, Award } from "lucide-react"
import { getAllTeachers, getCoordinatorTeachers, getCurrentUserProfile } from "@/lib/api"
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
        
        // Get current user profile to get coordinator ID
        const userProfile = await getCurrentUserProfile() as any;
        console.log('User profile:', userProfile);
        const coordinatorId = userProfile?.coordinator_id;
        console.log('Coordinator ID:', coordinatorId);
        
        if (!coordinatorId) {
          console.error('Coordinator ID not found in user profile:', userProfile);
          setError(`Coordinator ID not found in user profile. User role: ${userProfile?.role || 'unknown'}, Available fields: ${Object.keys(userProfile || {}).join(', ')}`);
          return;
        }
        
        // Use coordinator-specific API to get assigned teachers
        console.log('Calling getCoordinatorTeachers with ID:', coordinatorId);
        const response = await getCoordinatorTeachers(coordinatorId) as any;
        console.log('Coordinator teachers response:', response);
        
        if (!response || !response.teachers) {
          console.error('Invalid response from getCoordinatorTeachers:', response);
          setError('Invalid response from coordinator teachers API');
          return;
        }
        
        const teachersData = response.teachers || [];
        
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
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3" style={{ color: '#274c77' }}>
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
            <Users className="h-5 w-5 text-white" />
          </div>
          <span>Teacher List</span>
        </h1>
        <p className="text-gray-600">
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </p>
      </div>

      {/* Search Section */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers by name, subject, or email..."
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
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#274c77' }}>
                <TableHead className="text-white">Teacher</TableHead>
                <TableHead className="text-white">Subject</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Classes</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <LoadingSpinner message="Loading teachers..." />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="text-red-600 mb-4">Error: {error}</div>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Try Again
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher, index) => (
                  <TableRow 
                    key={teacher.id}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : ''}`}
                    style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6096ba' }}>
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{teacher.name}</span>
                            {teacher.is_class_teacher && (
                              <Award className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span className="capitalize">{teacher.shift || 'Morning'}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <div className="text-sm">
                          <div className="text-gray-900 truncate max-w-xs">{truncateList(teacher.subject)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <div className="text-sm text-gray-900 truncate max-w-xs">{teacher.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" style={{ color: '#6096ba' }} />
                        <div className="text-sm">
                          <div className="text-gray-900 truncate max-w-xs">{truncateList(teacher.classes)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                          onClick={() => router.push(`/admin/teachers/profile?id=${teacher.id}`)}
                          title="View Teacher Profile"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
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
