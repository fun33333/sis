"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, GraduationCap, School, Users } from "lucide-react"
import { getCurrentUserProfile } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import LevelManagement from "@/components/campus-management/level-management"
import GradeManagement from "@/components/campus-management/grade-management"
import ClassroomManagement from "@/components/campus-management/classroom-management"

export default function CampusManagementPage() {
  const [activeTab, setActiveTab] = useState<'levels' | 'grades' | 'classrooms'>('levels')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Campus Management | IAK SMS"
    
    async function fetchProfile() {
      try {
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Campus Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingSpinner message="Loading campus information..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Campus Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your campus structure: Levels, Grades, and Classrooms
          </p>
          {userProfile?.campus_name && (
            <p className="text-sm text-gray-500 mt-1">
              Campus: <span className="font-semibold">{userProfile.campus_name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Management Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="levels" className="flex items-center gap-2">
                <School className="h-4 w-4" />
                Levels
              </TabsTrigger>
              <TabsTrigger value="grades" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Grades
              </TabsTrigger>
              <TabsTrigger value="classrooms" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Classrooms
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="levels" className="mt-6">
              <LevelManagement campusId={userProfile?.campus_id} />
            </TabsContent>
            
            <TabsContent value="grades" className="mt-6">
              <GradeManagement campusId={userProfile?.campus_id} />
            </TabsContent>
            
            <TabsContent value="classrooms" className="mt-6">
              <ClassroomManagement campusId={userProfile?.campus_id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

