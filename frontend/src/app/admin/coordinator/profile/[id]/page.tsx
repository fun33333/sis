"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, Calendar, MapPin, GraduationCap, Briefcase, User } from "lucide-react"
import { getAllCoordinators } from "@/lib/api"

interface CoordinatorProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  campus_name?: string
  is_active: boolean
  level?: string
  joining_date?: string
  dob?: string
  gender?: string
  phone?: string
  address?: string
  education_level?: string
  institution_name?: string
  year_of_passing?: number
  total_experience_years?: number
  can_assign_class_teachers?: boolean
}

export default function CoordinatorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [coordinator, setCoordinator] = useState<CoordinatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Coordinator Profile - Coordinator | IAK SMS"
  }, [])

  useEffect(() => {
    async function loadCoordinator() {
      try {
        setLoading(true)
        const coordinators = await getAllCoordinators() as any
        const coordinatorsList = coordinators?.results || coordinators || []
        
        const coordinatorId = parseInt(params.id as string)
        const foundCoordinator = coordinatorsList.find((coord: any) => coord.id === coordinatorId)
        
        if (!foundCoordinator) {
          setError("Coordinator not found")
          return
        }

        // Convert level number to proper name
        const getLevelName = (level: any) => {
          if (foundCoordinator.level?.name) {
            return foundCoordinator.level.name
          }
          if (foundCoordinator.level) {
            const levelNum = parseInt(foundCoordinator.level)
            switch (levelNum) {
              case 1: return 'Primary'
              case 2: return 'Secondary'
              case 3: return 'Pre-Primary'
              case 4: return 'Kindergarten'
              case 5: return 'Nursery'
              case 6: return 'Higher Secondary'
              default: return `Level ${foundCoordinator.level}`
            }
          }
          return 'Not Assigned'
        }

        const mappedCoordinator: CoordinatorProfile = {
          id: foundCoordinator.id,
          username: foundCoordinator.email || foundCoordinator.username || '',
          email: foundCoordinator.email || '',
          first_name: foundCoordinator.full_name?.split(' ')[0] || foundCoordinator.first_name || '',
          last_name: foundCoordinator.full_name?.split(' ').slice(1).join(' ') || foundCoordinator.last_name || '',
          role: 'coordinator',
          campus_name: foundCoordinator.campus?.campus_name || foundCoordinator.campus || 'Unknown',
          is_active: foundCoordinator.is_currently_active !== false,
          level: getLevelName(foundCoordinator.level),
          joining_date: foundCoordinator.joining_date || 'Unknown',
          dob: foundCoordinator.dob || 'Unknown',
          gender: foundCoordinator.gender || 'Unknown',
          phone: foundCoordinator.phone || 'Not provided',
          address: foundCoordinator.permanent_address || 'Not provided',
          education_level: foundCoordinator.education_level || 'Not provided',
          institution_name: foundCoordinator.institution_name || 'Not provided',
          year_of_passing: foundCoordinator.year_of_passing || 0,
          total_experience_years: foundCoordinator.total_experience_years || 0,
          can_assign_class_teachers: foundCoordinator.can_assign_class_teachers || false
        }

        setCoordinator(mappedCoordinator)
      } catch (error) {
        console.error('Error loading coordinator:', error)
        setError("Failed to load coordinator profile")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCoordinator()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading coordinator profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !coordinator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-4">{error || "The requested coordinator profile could not be found."}</p>
              <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <Badge 
            style={{ 
              backgroundColor: coordinator.is_active ? '#10b981' : '#ef4444', 
              color: 'white',
              fontSize: '14px',
              padding: '8px 16px'
            }}
          >
            {coordinator.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {`${coordinator.first_name} ${coordinator.last_name}`.trim() || coordinator.username}
                </CardTitle>
                <p className="text-blue-100 mt-1">Coordinator</p>
                <p className="text-blue-200 text-sm">{coordinator.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{coordinator.dob}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{coordinator.gender}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{coordinator.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{coordinator.address}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Information</h3>
                
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-medium">{coordinator.level}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Joining Date</p>
                    <p className="font-medium">{coordinator.joining_date}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium">{coordinator.total_experience_years} years</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="font-medium">{coordinator.education_level}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Institution</p>
                  <p className="font-medium">{coordinator.institution_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year of Passing</p>
                  <p className="font-medium">{coordinator.year_of_passing || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Can Assign Class Teachers</p>
                  <Badge 
                    style={{ 
                      backgroundColor: coordinator.can_assign_class_teachers ? '#10b981' : '#ef4444', 
                      color: 'white'
                    }}
                  >
                    {coordinator.can_assign_class_teachers ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Campus</p>
                  <p className="font-medium">{coordinator.campus_name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
