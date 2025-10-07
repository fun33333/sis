"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Eye, Edit } from "lucide-react"
import { getAllTeachers, getAllCampuses } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CoordinatorTeacherListPage() {
  useEffect(() => {
    document.title = "Teacher List - Coordinator | IAK SMS";
  }, []);

  const router = useRouter()
  const [search, setSearch] = useState("")
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          status: teacher.is_active ? 'Active' : 'Inactive',
          classes: teacher.classes || 'Not Assigned',
          email: teacher.email || 'Not provided',
          phone: teacher.phone || 'Not provided',
          joining_date: teacher.joining_date || 'Not provided',
          experience: teacher.experience || 'Not provided'
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
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#274c77' }}>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Subject</TableHead>
                  <TableHead className="text-white">Campus</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Classes</TableHead>
                  <TableHead className="text-white">Status</TableHead>
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
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>{teacher.campus}</TableCell>
                    <TableCell className="text-sm text-gray-600">{teacher.email}</TableCell>
                    <TableCell>{teacher.classes}</TableCell>
                    <TableCell>
                      <Badge 
                        style={{ 
                          backgroundColor: teacher.status === 'Active' ? '#6096ba' : '#8b8c89',
                          color: 'white'
                        }}
                      >
                        {teacher.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: '#6096ba', color: '#274c77' }}
                          onClick={() => router.push(`/admin/teachers/profile?teacherId=${teacher.id}`)}
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
