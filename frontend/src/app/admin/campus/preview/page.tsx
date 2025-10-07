"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Users, 
  Building2, 
  Eye,
  Plus,
  ArrowLeft
} from "lucide-react"
import { getCurrentUserRole } from "@/lib/permissions"
import { getClassrooms, getGrades, getLevels } from "@/lib/api"
import Link from "next/link"

export default function PreviewPage() {
  useEffect(() => {
    document.title = "Campus Preview | IAK SMS";
  }, []);

  const [userRole, setUserRole] = useState<string>("")
  const [activeTab, setActiveTab] = useState("classes")
  
  // Data states
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  
  // Loading states
  const [classroomsLoading, setClassroomsLoading] = useState(false)
  const [gradesLoading, setGradesLoading] = useState(false)
  const [levelsLoading, setLevelsLoading] = useState(false)

  useEffect(() => {
    setUserRole(getCurrentUserRole())
    loadAllData()
  }, [])

  const loadAllData = async () => {
    await Promise.all([
      loadClassrooms(),
      loadGrades(),
      loadLevels()
    ])
  }

  const loadClassrooms = async () => {
    setClassroomsLoading(true)
    try {
      console.log('Loading classrooms...')
      const data = await getClassrooms()
      console.log('Classrooms API response:', data)
      console.log('Is array?', Array.isArray(data))
      
      // Handle different response formats
      let classrooms = []
      if (Array.isArray(data)) {
        classrooms = data
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
        classrooms = (data as any).results
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        classrooms = (data as any).data
      }
      
      console.log('Processed classrooms:', classrooms)
      setClassrooms(classrooms)
    } catch (error) {
      console.error('Failed to load classrooms:', error)
      setClassrooms([])
    } finally {
      setClassroomsLoading(false)
    }
  }

  const loadGrades = async () => {
    setGradesLoading(true)
    try {
      console.log('Loading grades...')
      const data = await getGrades()
      console.log('Grades API response:', data)
      console.log('Is array?', Array.isArray(data))
      
      // Handle different response formats
      let grades = []
      if (Array.isArray(data)) {
        grades = data
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
        grades = (data as any).results
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        grades = (data as any).data
      }
      
      console.log('Processed grades:', grades)
      setGrades(grades)
    } catch (error) {
      console.error('Failed to load grades:', error)
      setGrades([])
    } finally {
      setGradesLoading(false)
    }
  }

  const loadLevels = async () => {
    setLevelsLoading(true)
    try {
      console.log('Loading levels...')
      const data = await getLevels()
      console.log('Levels API response:', data)
      console.log('Is array?', Array.isArray(data))
      
      // Handle different response formats
      let levels = []
      if (Array.isArray(data)) {
        levels = data
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
        levels = (data as any).results
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        levels = (data as any).data
      }
      
      console.log('Processed levels:', levels)
      setLevels(levels)
    } catch (error) {
      console.error('Failed to load levels:', error)
      setLevels([])
    } finally {
      setLevelsLoading(false)
    }
  }

  const renderClassrooms = () => {
    if (classroomsLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (classrooms.length === 0) {
      return (
        <div className="text-center py-12">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#a3cef1' }}
          >
            <GraduationCap className="h-10 w-10" style={{ color: '#274c77' }} />
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: '#274c77' }}>No classes found</p>
          <p className="text-sm" style={{ color: '#6096ba' }}>Create your first class using the form</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom: any) => (
          <Card 
            key={classroom.id} 
            className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#274c77' }}
                  >
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#274c77' }}>
                      {classroom.grade_name} - Section {classroom.section}
                    </h3>
                    <p className="text-sm" style={{ color: '#6096ba' }}>Class</p>
                  </div>
                </div>
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#a3cef1', color: '#274c77' }}
                >
                  ID: {classroom.id}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Grade:</span>
                  <span className="font-medium">{classroom.grade_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level:</span>
                  <span className="font-medium">{classroom.level_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Campus:</span>
                  <span className="font-medium">{classroom.campus_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-medium">{classroom.capacity} students</span>
                </div>
                {classroom.teacher_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Teacher:</span>
                    <span className="font-medium">{classroom.teacher_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderGrades = () => {
    if (gradesLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )
    }

    if (grades.length === 0) {
      return (
        <div className="text-center py-12">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#a3cef1' }}
          >
            <BookOpen className="h-10 w-10" style={{ color: '#274c77' }} />
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: '#274c77' }}>No grades found</p>
          <p className="text-sm" style={{ color: '#6096ba' }}>Create your first grade using the form</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade: any) => (
          <Card 
            key={grade.id} 
            className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#6096ba' }}
                  >
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#274c77' }}>{grade.name}</h3>
                    <p className="text-sm" style={{ color: '#6096ba' }}>Grade</p>
                  </div>
                </div>
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#a3cef1', color: '#274c77' }}
                >
                  ID: {grade.id}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                {grade.short_code && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Code:</span>
                    <span className="font-medium">{grade.short_code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Level:</span>
                  <span className="font-medium">{grade.level_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Campus:</span>
                  <span className="font-medium">{grade.campus_name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderLevels = () => {
    if (levelsLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )
    }

    if (levels.length === 0) {
      return (
        <div className="text-center py-12">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#a3cef1' }}
          >
            <Layers className="h-10 w-10" style={{ color: '#274c77' }} />
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: '#274c77' }}>No levels found</p>
          <p className="text-sm" style={{ color: '#6096ba' }}>Create your first level using the form</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level: any) => (
          <Card 
            key={level.id} 
            className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#274c77' }}
                  >
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#274c77' }}>{level.name}</h3>
                    <p className="text-sm" style={{ color: '#6096ba' }}>Level</p>
                  </div>
                </div>
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#a3cef1', color: '#274c77' }}
                >
                  ID: {level.id}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                {level.short_code && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Code:</span>
                    <span className="font-medium">{level.short_code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Campus:</span>
                  <span className="font-medium">{level.campus_name}</span>
                </div>
                {level.coordinator_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Coordinator:</span>
                    <span className="font-medium">{level.coordinator_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b" style={{ borderColor: '#a3cef1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/campus">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center hover:shadow-md transition-shadow"
                  style={{ borderColor: '#274c77', color: '#274c77' }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campus
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#274c77' }}>Campus Preview</h1>
                <p className="mt-1 text-sm" style={{ color: '#6096ba' }}>View all classes, grades, and levels</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium shadow-md"
                style={{ backgroundColor: '#274c77', color: 'white' }}
              >
                {classrooms.length} Classes
              </div>
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium shadow-md"
                style={{ backgroundColor: '#6096ba', color: 'white' }}
              >
                {grades.length} Grades
              </div>
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium shadow-md"
                style={{ backgroundColor: '#274c77', color: 'white' }}
              >
                {levels.length} Levels
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList 
            className="grid w-full grid-cols-3 shadow-lg"
            style={{ backgroundColor: '#a3cef1' }}
          >
            <TabsTrigger 
              value="classes" 
              className="flex items-center space-x-2 data-[state=active]:shadow-md transition-all"
              style={{ 
                color: activeTab === 'classes' ? 'white' : '#274c77',
                backgroundColor: activeTab === 'classes' ? '#274c77' : 'transparent'
              }}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Classes ({classrooms.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="grades" 
              className="flex items-center space-x-2 data-[state=active]:shadow-md transition-all"
              style={{ 
                color: activeTab === 'grades' ? 'white' : '#274c77',
                backgroundColor: activeTab === 'grades' ? '#274c77' : 'transparent'
              }}
            >
              <BookOpen className="h-4 w-4" />
              <span>Grades ({grades.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="levels" 
              className="flex items-center space-x-2 data-[state=active]:shadow-md transition-all"
              style={{ 
                color: activeTab === 'levels' ? 'white' : '#274c77',
                backgroundColor: activeTab === 'levels' ? '#274c77' : 'transparent'
              }}
            >
              <Layers className="h-4 w-4" />
              <span>Levels ({levels.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-2">
            <Card className="shadow-lg" style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
              <CardHeader 
                className="text-white rounded-t-lg"
                style={{ background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)' }}
              >
                <CardTitle className="flex items-center text-xl">
                  <GraduationCap className="h-6 w-6 mr-3" />
                  Classes Overview
                </CardTitle>
                <CardDescription className="text-blue-100">
                  All classes in your campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderClassrooms()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-2">
            <Card className="shadow-lg" style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
              <CardHeader 
                className="text-white rounded-t-lg"
                style={{ background: 'linear-gradient(135deg, #6096ba 0%, #274c77 100%)' }}
              >
                <CardTitle className="flex items-center text-xl">
                  <BookOpen className="h-6 w-6 mr-3" />
                  Grades Overview
                </CardTitle>
                <CardDescription className="text-blue-100">
                  All grades in your campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderGrades()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-2">
            <Card className="shadow-lg" style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
              <CardHeader 
                className="text-white rounded-t-lg"
                style={{ background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)' }}
              >
                <CardTitle className="flex items-center text-xl">
                  <Layers className="h-6 w-6 mr-3" />
                  Levels Overview
                </CardTitle>
                <CardDescription className="text-blue-100">
                  All levels in your campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLevels()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
