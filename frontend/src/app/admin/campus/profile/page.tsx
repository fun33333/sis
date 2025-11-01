"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { apiGet, getAllStudents, getFilteredTeachers, getAllCoordinators } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { MapPin, Phone, Mail, Users, Building, BookOpen, Wifi, GraduationCap, UserCheck, BarChart3, Activity, Target } from "lucide-react"
import { StudentRadialChart } from "@/components/charts/radial-chart"

function CampusProfileContent() {
  const params = useSearchParams()
  const id = params?.get("id") || params?.get("pk") || ""

  const [campus, setCampus] = useState<any | null>(null)
  const [realStudentData, setRealStudentData] = useState<any | null>(null)
  const [realTeachersCount, setRealTeachersCount] = useState<number | null>(null)
  const [realCoordinatorsCount, setRealCoordinatorsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)

  // Function to calculate real student statistics
  const calculateRealStudentStats = (students: any[], campusId: string) => {
    console.log('Calculating stats for campus ID:', campusId)
    console.log('Total students fetched:', students.length)
    
    // Try different ways to match campus ID
    const campusStudents = students.filter(student => {
      let studentCampusId = null
      
      if (typeof student.campus === 'object' && student.campus) {
        studentCampusId = student.campus.id || student.campus.pk || student.campus.campus_id
      } else if (student.campus) {
        studentCampusId = student.campus
      }
      
      const isActive = student.current_state === 'active'
      const matchesCampus = studentCampusId == campusId || studentCampusId === campusId
      
      console.log('Student campus ID:', studentCampusId, 'Matches:', matchesCampus, 'Active:', isActive, 'Student:', student.name)
      
      return matchesCampus && isActive
    })

    console.log('Campus students found:', campusStudents.length)

    const total = campusStudents.length
    const male = campusStudents.filter(s => s.gender === 'male').length
    const female = campusStudents.filter(s => s.gender === 'female').length
    const morning = campusStudents.filter(s => s.shift === 'M' || s.shift === 'morning').length
    const afternoon = campusStudents.filter(s => s.shift === 'E' || s.shift === 'afternoon').length

    console.log('Calculated stats:', { total, male, female, morning, afternoon })

    return {
      total,
      male,
      female,
      morning,
      afternoon
    }
  }

  useEffect(() => {
    if (!id) return
    let mounted = true
    setLoading(true)
    
    // Fetch campus data
    apiGet<any>(`/api/campus/${id}/`)
      .then((data) => {
        if (mounted) {
          setCampus(data)
        }
      })
      .catch((err) => {
        console.error(err)
        if (mounted) {
          setError(err.message || "Failed to load campus")
        }
      })
    
    // Fetch real data from database
    Promise.all([
    // Fetch real student data
      getAllStudents(true) // Force refresh to get latest data
      .then((students) => {
        console.log('Fetched students data:', students)
        if (mounted) {
            const studentsArray = Array.isArray(students) ? students : (students?.results || [])
            const realStats = calculateRealStudentStats(studentsArray, id)
          console.log('Setting real student data:', realStats)
          setRealStudentData(realStats)
        }
          return students
      })
      .catch((err) => {
        console.warn('Failed to fetch real student data:', err)
          if (mounted) {
            // Set to empty stats on error so chart knows we attempted to fetch real data
            setRealStudentData({ total: 0, male: 0, female: 0, morning: 0, afternoon: 0 })
          }
          return []
        }),
      
      // Fetch real teachers data filtered by campus
      getFilteredTeachers({ current_campus: parseInt(id), is_currently_active: true })
        .then((response) => {
          console.log('Fetched teachers data:', response)
          if (mounted) {
            const teachers = Array.isArray(response) ? response : (response?.results || [])
            const count = Array.isArray(response) ? response.length : (response?.count || 0)
            console.log('Setting real teachers count:', count)
            setRealTeachersCount(count)
          }
          return response
        })
        .catch((err) => {
          console.warn('Failed to fetch real teachers data:', err)
          if (mounted) setRealTeachersCount(null)
          return null
        }),
      
      // Fetch real coordinators data and filter by campus
      getAllCoordinators()
        .then((coordinators: any) => {
          console.log('Fetched coordinators data:', coordinators)
          if (mounted) {
            // Filter coordinators by campus
            const coordinatorsList = Array.isArray(coordinators) ? coordinators : ((coordinators as any)?.results || [])
            const campusCoordinators = coordinatorsList.filter((coord: any) => {
              let coordCampusId = null
              if (typeof coord.campus === 'object' && coord.campus) {
                coordCampusId = coord.campus.id || coord.campus.pk || coord.campus.campus_id
              } else if (coord.campus) {
                coordCampusId = coord.campus
              }
              return coordCampusId == id || coordCampusId === id
            })
            console.log('Setting real coordinators count:', campusCoordinators.length)
            setRealCoordinatorsCount(campusCoordinators.length)
          }
          return coordinators
        })
        .catch((err) => {
          console.warn('Failed to fetch real coordinators data:', err)
          if (mounted) setRealCoordinatorsCount(null)
          return []
        })
    ])
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })
    
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (campus?.campus_name || campus?.name) {
      document.title = `${campus.campus_name || campus.name} | Campus Profile`
    }
  }, [campus])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const uStr = window.localStorage.getItem('sis_user')
        if (uStr) {
          const u = JSON.parse(uStr)
          const role = String(u?.role || '').toLowerCase()
          setCanEdit(role.includes('princ') || role.includes('admin'))
        }
      } catch {}
    }
  }, [])

  if (!id) {
    return <div className="p-6">No campus selected</div>
  }

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-600 mb-4">Error: {error}</div>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  )

  const renderValue = (v: any) => {
    if (v === null || v === undefined || String(v).trim() === "") return '—'
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (Array.isArray(v)) return v.join(', ')
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }

  // const formatDate = (dateStr: string) => {
  //   if (!dateStr) return '—'
  //   try {
  //     return new Date(dateStr).toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric'
  //     })
  //   } catch {
  //     return dateStr
  //   }
  // }

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    // Otherwise, construct full URL from API base
    const apiBase = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000')
      : 'http://127.0.0.1:8000'
    return `${apiBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  const campusImageUrl = getImageUrl(campus?.campus_photo)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden shadow-2xl border-0 bg-white">
            <div className="relative">
              {/* Campus Image Background/Header */}
              {campusImageUrl && (
                <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden">
                  <img 
                    src={campusImageUrl} 
                    alt={campus?.campus_name || 'Campus'} 
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent"></div>
                </div>
              )}
              
              {/* Decorative Elements (only show if no image) */}
              {!campusImageUrl && (
                <>
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6 sm:translate-y-12 sm:-translate-x-12"></div>
                </>
              )}
              
              {/* Content */}
              <div className={`relative ${campusImageUrl ? 'p-4 sm:p-6 lg:p-8' : 'p-4 sm:p-6 lg:p-8'}`}>
                <div className={`flex flex-col ${campusImageUrl ? 'lg:flex-row' : 'lg:flex-row'} lg:items-start lg:justify-between gap-6`}>
                  {/* Left Side - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      {/* Campus Image Thumbnail */}
                      {campusImageUrl ? (
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                            <img 
                              src={campusImageUrl} 
                              alt={campus?.campus_name || 'Campus'} 
                              className="w-full h-full object-cover"
                            />
                      </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 sm:p-3 bg-primary rounded-xl backdrop-blur-sm flex-shrink-0">
                          <Building className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 text-slate-800">
                          {campus?.campus_name || campus?.name || 'Unknown Campus'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm sm:text-base lg:text-lg text-slate-600">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span>{campus?.campus_type ? campus.campus_type.charAt(0).toUpperCase() + campus.campus_type.slice(1) : 'Campus'}</span>
                          <span>•</span>
                          <span>{campus?.city || 'Unknown City'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                      <div className="bg-primary/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 rounded-lg">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <div className="text-2xl sm:text-3xl font-bold">
                              {realStudentData?.total !== undefined ? realStudentData.total : (campus?.total_students || 0)}
                            </div>
                            <div className="text-xs sm:text-sm opacity-80 font-medium">Students</div>
                            {realStudentData?.total !== undefined && (
                              <div className="text-xs opacity-60">Real Count</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 bg-green-500/30 rounded-lg">
                            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <div className="text-2xl sm:text-3xl font-bold">
                              {realTeachersCount !== null ? realTeachersCount : (campus?.total_teachers || 0)}
                            </div>
                            <div className="text-xs sm:text-sm opacity-80 font-medium">Teachers</div>
                            {realTeachersCount !== null && (
                              <div className="text-xs opacity-60">Real Count</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 bg-purple-500/30 rounded-lg">
                            <Building className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <div className="text-2xl sm:text-3xl font-bold">{campus?.total_classrooms || 0}</div>
                            <div className="text-xs sm:text-sm opacity-80 font-medium">Classrooms</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                      </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-auto">
              <TabsTrigger value="analytics" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                Details
              </TabsTrigger>
            </TabsList>


            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 sm:space-y-8">

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Basic Information */}
                <Card className="shadow-lg border-0 overflow-hidden" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <Building className="w-4 h-4" />
                        </div>
                  Basic Information
                </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus ID</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <p className="text-sm font-bold" style={{color: '#274c77'}}>{renderValue(campus?.campus_id)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus Code</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <p className="text-sm font-bold" style={{color: '#274c77'}}>{renderValue(campus?.campus_code)}</p>
                        </div>
                      </div>
                      <div className="group md:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus Name</label>
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: '#274c77', borderColor: '#274c77'}}>
                          <p className="text-lg font-bold text-white">{renderValue(campus?.campus_name)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus Type</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <Badge 
                            className="text-sm px-2 py-1 font-semibold"
                            style={{backgroundColor: '#6096ba', color: 'white'}}
                          >
                            {renderValue(campus?.campus_type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Established Year</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <p className="text-sm font-bold" style={{color: '#274c77'}}>{renderValue(campus?.established_year)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Governing Body</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.governing_body)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Accreditation</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.accreditation)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Instruction Language</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.instruction_language)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Registration Number</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.registration_number)}</p>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Status</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <Badge 
                            className="text-sm px-3 py-1 font-bold rounded-full"
                            style={{
                              backgroundColor: campus?.status === 'active' ? '#6096ba' : '#8b8c89',
                              color: 'white'
                            }}
                          >
                            {renderValue(campus?.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg border-0 overflow-hidden" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #6096ba 0%, #a3cef1 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        Staff Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>
                            {realTeachersCount !== null ? realTeachersCount : renderValue(campus?.total_teachers)}
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Total Teachers</div>
                          {realTeachersCount !== null && (
                            <div className="text-xs mt-1" style={{color: '#6096ba'}}>Real</div>
                          )}
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_non_teaching_staff)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Non-Teaching Staff</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_maids)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Total Maids</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>
                            {realCoordinatorsCount !== null ? realCoordinatorsCount : renderValue(campus?.total_coordinators)}
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Coordinators</div>
                          {realCoordinatorsCount !== null && (
                            <div className="text-xs mt-1" style={{color: '#6096ba'}}>Real</div>
                          )}
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_guards)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Guards</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.other_staff)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Other Staff</div>
                    </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                      <div className="text-center p-2 sm:p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                        <div className="text-sm sm:text-base font-bold" style={{color: '#274c77'}}>{renderValue(campus?.male_teachers)}</div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Male Teachers</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                        <div className="text-sm sm:text-base font-bold" style={{color: '#274c77'}}>{renderValue(campus?.female_teachers)}</div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Female Teachers</div>
                  </div>
                    </div>
                  </CardContent>
                </Card>


                {/* Location & Contact Information */}
                <Card className="shadow-lg border-0 overflow-hidden lg:col-span-2" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #6096ba 0%, #a3cef1 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        Location & Contact Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color: '#8b8c89'}}>Full Address</label>
                      <div className="p-3 rounded-lg border" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                        <p className="text-sm leading-relaxed" style={{color: '#274c77'}}>{renderValue(campus?.address_full)}</p>
                      </div>
                    </div>
                    
                    {/* Location Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{backgroundColor: '#a3cef1'}}>
                            <MapPin className="w-4 h-4" style={{color: '#274c77'}} />
                          </div>
                          <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>City</label>
                          <p className="text-sm font-bold" style={{color: '#274c77'}}>{renderValue(campus?.city)}</p>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{backgroundColor: '#e7ecef'}}>
                            <Building className="w-4 h-4" style={{color: '#6096ba'}} />
                          </div>
                          <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>District</label>
                          <p className="text-sm font-bold" style={{color: '#274c77'}}>{renderValue(campus?.district)}</p>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{backgroundColor: '#a3cef1'}}>
                            <Mail className="w-4 h-4" style={{color: '#274c77'}} />
                          </div>
                          <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Postal Code</label>
                          <p className="text-sm font-bold" style={{color: '#274c77'}}>{renderValue(campus?.postal_code)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Primary Phone</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" style={{color: '#6096ba'}} />
                            <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.primary_phone)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Secondary Phone</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" style={{color: '#8b8c89'}} />
                            <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.secondary_phone)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Official Email</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" style={{color: '#274c77'}} />
                            <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.official_email)}</p>
                          </div>
                    </div>
                  </div>
              </div>
              </CardContent>
            </Card>

                {/* Administration */}
                <Card className="shadow-lg border-0 overflow-hidden" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #6096ba 0%, #a3cef1 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <UserCheck className="w-4 h-4" />
                        </div>
                        Administration
                </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus Head Name</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.campus_head_name)}</p>
                    </div>
                    </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus Head Phone</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.campus_head_phone)}</p>
                    </div>
                  </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Campus Head Email</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.campus_head_email)}</p>
                    </div>
                    </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Total Staff Members</label>
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <p className="text-xl font-bold text-center" style={{color: '#274c77'}}>{renderValue(campus?.total_staff_members)}</p>
              </div>
            </div>
          </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
                <Card className="shadow-lg border-0 overflow-hidden" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                  Academic Information
                </CardTitle>
                    </div>
              </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Academic Year Start Month</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.academic_year_start_month)}</p>
              </div>
              </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Academic Year End Month</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.academic_year_end_month)}</p>
              </div>
            </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Shift Available</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <Badge 
                            className="text-sm px-2 py-1 font-semibold"
                            style={{backgroundColor: '#6096ba', color: 'white'}}
                          >
                            {renderValue(campus?.shift_available)}
                          </Badge>
              </div>
              </div>
                      <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Grades Available</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.grades_available)}</p>
              </div>
            </div>
                      <div className="group md:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Grades Offered</label>
                        <div className="p-2 rounded-lg border transition-all duration-300 group-hover:shadow-sm" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.grades_offered)}</p>
              </div>
            </div>
          </div>
              </CardContent>
            </Card>

                {/* Student Demographics - Large Card */}
                <Card className="shadow-lg border-0 overflow-hidden lg:col-span-2" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <Users className="w-4 h-4" />
                        </div>
                        Student Demographics
                </CardTitle>
                    </div>
              </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="group text-center">
                        <div className="p-4 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <div className="text-2xl font-bold mb-1" style={{color: '#274c77'}}>
                            {realStudentData?.total !== undefined ? realStudentData.total : renderValue(campus?.total_students)}
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Total Students</div>
                          {realStudentData?.total !== undefined && (
                            <div className="text-xs mt-1" style={{color: '#6096ba'}}>Real Count</div>
                          )}
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-4 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-2xl font-bold mb-1" style={{color: '#274c77'}}>
                            {realTeachersCount !== null ? realTeachersCount : renderValue(campus?.total_teachers)}
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Total Teachers</div>
                          {realTeachersCount !== null && (
                            <div className="text-xs mt-1" style={{color: '#6096ba'}}>Real Count</div>
                          )}
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-4 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-2xl font-bold mb-1" style={{color: '#274c77'}}>
                            {realCoordinatorsCount !== null ? realCoordinatorsCount : renderValue(campus?.total_coordinators)}
                        </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Coordinators</div>
                          {realCoordinatorsCount !== null && (
                            <div className="text-xs mt-1" style={{color: '#6096ba'}}>Real Count</div>
                          )}
                      </div>
                    </div>
                      </div>
                    
                    {/* Additional Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-4">
                      <div className="text-center p-2 sm:p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                        <div className="text-base sm:text-lg font-bold" style={{color: '#274c77'}}>
                          {realStudentData?.male !== undefined ? realStudentData.male : renderValue(campus?.male_students)}
                      </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Male Students</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                        <div className="text-base sm:text-lg font-bold" style={{color: '#274c77'}}>
                          {realStudentData?.female !== undefined ? realStudentData.female : renderValue(campus?.female_students)}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Female Students</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                        <div className="text-base sm:text-lg font-bold" style={{color: '#274c77'}}>
                          {realStudentData?.morning !== undefined ? realStudentData.morning : renderValue(campus?.morning_students)}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Morning Shift</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                        <div className="text-base sm:text-lg font-bold" style={{color: '#274c77'}}>
                          {realStudentData?.afternoon !== undefined ? realStudentData.afternoon : renderValue(campus?.afternoon_students)}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Afternoon Shift</div>
                      </div>
                    </div>
                    
                    {/* Capacity and Class Size Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="text-center p-3 rounded-lg border" style={{backgroundColor: '#f0f0f0', borderColor: '#8b8c89'}}>
                        <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.student_capacity)}</div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Student Capacity</div>
                      </div>
                      <div className="text-center p-3 rounded-lg border" style={{backgroundColor: '#f0f0f0', borderColor: '#8b8c89'}}>
                        <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.avg_class_size)}</div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Avg Class Size</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                
                {/* Infrastructure - Large Card */}
                <Card className="shadow-lg border-0 overflow-hidden lg:col-span-2" style={{backgroundColor: '#e7ecef'}}>
                  <CardHeader className="p-0">
                    <div className="p-4" style={{background: 'linear-gradient(135deg, #274c77 0%, #6096ba 100%)'}}>
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="p-1.5 rounded" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                          <Building className="w-4 h-4" />
                        </div>
                        Infrastructure & Facilities
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_rooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Total Rooms</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_classrooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Classrooms</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_offices)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Offices</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.num_computer_labs)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Computer Labs</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.num_science_labs)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Science Labs</div>
                    </div>
                  </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.num_biology_labs)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Biology Labs</div>
                    </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.num_chemistry_labs)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Chemistry Labs</div>
                        </div>
                      </div>
                      <div className="group text-center">
                        <div className="p-3 rounded-lg border transition-all duration-300 group-hover:shadow-sm group-hover:scale-105" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-xl font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.num_physics_labs)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Physics Labs</div>
                        </div>
                      </div>
                    </div>

                    {/* Washrooms Section */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color: '#8b8c89'}}>Washrooms</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 rounded-lg border" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                          <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.total_washrooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Total Washrooms</div>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.male_teachers_washrooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Male Teachers</div>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#6096ba'}}>
                          <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.female_teachers_washrooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Female Teachers</div>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{backgroundColor: 'white', borderColor: '#8b8c89'}}>
                          <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.male_student_washrooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Male Students</div>
                        </div>
                        <div className="text-center p-3 rounded-lg border md:col-start-2" style={{backgroundColor: 'white', borderColor: '#274c77'}}>
                          <div className="text-lg font-bold mb-1" style={{color: '#274c77'}}>{renderValue(campus?.female_student_washrooms)}</div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Female Students</div>
                        </div>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color: '#8b8c89'}}>Facilities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className={`p-2 sm:p-3 rounded-lg border text-center ${campus?.library_available ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="text-sm sm:text-base font-bold" style={{color: campus?.library_available ? '#274c77' : '#8b8c89'}}>
                          {campus?.library_available ? '✓' : '✗'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Library</div>
                      </div>
                        <div className={`p-2 sm:p-3 rounded-lg border text-center ${campus?.power_backup ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="text-sm sm:text-base font-bold" style={{color: campus?.power_backup ? '#274c77' : '#8b8c89'}}>
                          {campus?.power_backup ? '✓' : '✗'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Power Backup</div>
                      </div>
                        <div className={`p-2 sm:p-3 rounded-lg border text-center ${campus?.internet_available ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="text-sm sm:text-base font-bold" style={{color: campus?.internet_available ? '#274c77' : '#8b8c89'}}>
                          {campus?.internet_available ? '✓' : '✗'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Internet</div>
                      </div>
                        <div className={`p-2 sm:p-3 rounded-lg border text-center ${campus?.teacher_transport ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="text-sm sm:text-base font-bold" style={{color: campus?.teacher_transport ? '#274c77' : '#8b8c89'}}>
                            {campus?.teacher_transport ? '✓' : '✗'}
                        </div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Teacher Transport</div>
                      </div>
                        <div className={`p-2 sm:p-3 rounded-lg border text-center ${campus?.canteen_facility ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="text-sm sm:text-base font-bold" style={{color: campus?.canteen_facility ? '#274c77' : '#8b8c89'}}>
                          {campus?.canteen_facility ? '✓' : '✗'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Canteen</div>
                      </div>
                        <div className={`p-2 sm:p-3 rounded-lg border text-center ${campus?.meal_program ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="text-sm sm:text-base font-bold" style={{color: campus?.meal_program ? '#274c77' : '#8b8c89'}}>
                          {campus?.meal_program ? '✓' : '✗'}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{color: '#8b8c89'}}>Meal Program</div>
                      </div>
                      </div>
                      {campus?.sports_available && (
                        <div className="mt-3">
                          <label className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{color: '#8b8c89'}}>Sports Available</label>
                          <div className="p-2 rounded-lg border" style={{backgroundColor: '#a3cef1', borderColor: '#6096ba'}}>
                            <p className="text-sm font-semibold" style={{color: '#274c77'}}>{renderValue(campus?.sports_available)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="text-white border-0" style={{backgroundColor: '#274c77'}}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium" style={{color: '#a3cef1'}}>Total Students</p>
                        <p className="text-2xl sm:text-3xl font-bold">
                          {realStudentData?.total !== undefined ? realStudentData.total : renderValue(campus?.total_students)}
                        </p>
                        <p className="text-xs" style={{color: '#a3cef1'}}>
                          {realStudentData?.total !== undefined ? 'Real Database Count' : 'Campus Record'}
                        </p>
                      </div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" style={{color: '#a3cef1'}} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-white border-0" style={{backgroundColor: '#6096ba'}}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
              <div>
                        <p className="text-xs sm:text-sm font-medium" style={{color: '#e7ecef'}}>Total Staff</p>
                        <p className="text-2xl sm:text-3xl font-bold">
                          {(realTeachersCount !== null || realCoordinatorsCount !== null) 
                            ? ((realTeachersCount || 0) + (realCoordinatorsCount || 0) + (campus?.total_non_teaching_staff || 0))
                            : renderValue(campus?.total_staff_members)}
                        </p>
                        <p className="text-xs" style={{color: '#e7ecef'}}>
                          {(realTeachersCount !== null || realCoordinatorsCount !== null) 
                            ? 'Real Count (Teachers + Coordinators + Staff)' 
                            : 'Campus Record'}
                        </p>
                      </div>
                      <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" style={{color: '#e7ecef'}} />
              </div>
                  </CardContent>
                </Card>

                <Card className="text-white border-0" style={{backgroundColor: '#8b8c89'}}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
              <div>
                        <p className="text-xs sm:text-sm font-medium" style={{color: '#a3cef1'}}>Total Rooms</p>
                        <p className="text-2xl sm:text-3xl font-bold">{renderValue(campus?.total_rooms)}</p>
                        <p className="text-xs" style={{color: '#a3cef1'}}>Capacity: {renderValue(campus?.student_capacity)}</p>
                      </div>
                      <Building className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" style={{color: '#a3cef1'}} />
              </div>
                  </CardContent>
                </Card>

                <Card className="text-white border-0" style={{backgroundColor: '#a3cef1'}}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium" style={{color: '#274c77'}}>Avg Class Size</p>
                        <p className="text-2xl sm:text-3xl font-bold" style={{color: '#274c77'}}>{renderValue(campus?.avg_class_size)}</p>
                        <p className="text-xs" style={{color: '#274c77'}}>Optimal range: 25-30</p>
            </div>
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" style={{color: '#274c77'}} />
          </div>
              </CardContent>
            </Card>
          </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Student Demographics Chart */}
            <div>
              <StudentRadialChart 
                data={{
                  // Use real data if available (even if 0), otherwise fallback to campus record
                  male_students: realStudentData !== null ? (realStudentData.male || 0) : (campus?.male_students || (campus?.total_students ? Math.floor(campus.total_students * 0.6) : 0)),
                  female_students: realStudentData !== null ? (realStudentData.female || 0) : (campus?.female_students || (campus?.total_students ? Math.floor(campus.total_students * 0.4) : 0)),
                  morning_students: realStudentData !== null ? (realStudentData.morning || 0) : (campus?.morning_students || (campus?.total_students ? Math.floor(campus.total_students * 0.7) : 0)),
                  afternoon_students: realStudentData !== null ? (realStudentData.afternoon || 0) : (campus?.afternoon_students || (campus?.total_students ? Math.floor(campus.total_students * 0.3) : 0)),
                  total_students: realStudentData !== null ? (realStudentData.total || 0) : (campus?.total_students || 0)
                }}
              />
              {/* Info badge - Show only if real data was fetched (even if count is 0) */}
              {realStudentData !== null && (
                <div className="mt-2 text-xs text-center">
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Real Database Count: {realStudentData.total || 0} students
                  </Badge>
              </div>
              )}
            </div>

                {/* Staff Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Staff Distribution
                </CardTitle>
              </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {realTeachersCount !== null ? realTeachersCount : renderValue(campus?.total_teachers)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">Teachers</div>
                          {realTeachersCount !== null ? (
                            <div className="text-xs text-gray-500 mt-1">Real Count</div>
                          ) : (
                          <div className="text-xs text-gray-500 mt-1">
                            {campus?.male_teachers}M, {campus?.female_teachers}F
                          </div>
                          )}
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-green-600">{renderValue(campus?.total_maids)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Maids</div>
                </div>
                        <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            {realCoordinatorsCount !== null ? realCoordinatorsCount : renderValue(campus?.total_coordinators)}
                </div>
                          <div className="text-xs sm:text-sm text-gray-600">Coordinators</div>
                          {realCoordinatorsCount !== null && (
                            <div className="text-xs text-gray-500 mt-1">Real Count</div>
                          )}
                </div>
                        <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-red-600">{renderValue(campus?.total_guards)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Guards</div>
                </div>
                </div>
                </div>
              </CardContent>
            </Card>

                {/* Infrastructure Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Infrastructure Overview
                </CardTitle>
              </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{renderValue(campus?.total_classrooms)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Classrooms</div>
                </div>
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="text-2xl sm:text-3xl font-bold text-green-600">{renderValue(campus?.total_offices)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Offices</div>
                </div>
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{renderValue(campus?.num_computer_labs)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Computer Labs</div>
                </div>
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{renderValue(campus?.num_science_labs)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Science Labs</div>
                </div>
                </div>
                </div>
              </CardContent>
            </Card>

                {/* Facilities Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                      <Wifi className="w-5 h-5" />
                      Facilities Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className={`p-3 sm:p-4 rounded-lg border-2 ${campus?.library_available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">Library</span>
                          <div className={`w-3 h-3 rounded-full ${campus?.library_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                      </div>
                      <div className={`p-3 sm:p-4 rounded-lg border-2 ${campus?.power_backup ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">Power Backup</span>
                          <div className={`w-3 h-3 rounded-full ${campus?.power_backup ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                      </div>
                      <div className={`p-3 sm:p-4 rounded-lg border-2 ${campus?.internet_available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">Internet</span>
                          <div className={`w-3 h-3 rounded-full ${campus?.internet_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                      </div>
                      {campus?.sports_available && (
                        <div className={`p-3 sm:p-4 rounded-lg border-2 border-green-200 bg-green-50`}>
                  <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium">Sports Available</span>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                          <p className="text-xs text-gray-600 mt-1">{renderValue(campus?.sports_available)}</p>
                  </div>
                      )}
                      <div className={`p-3 sm:p-4 rounded-lg border-2 ${campus?.canteen_facility ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">Canteen</span>
                          <div className={`w-3 h-3 rounded-full ${campus?.canteen_facility ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                  </div>
                      <div className={`p-3 sm:p-4 rounded-lg border-2 ${campus?.meal_program ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">Meal Program</span>
                          <div className={`w-3 h-3 rounded-full ${campus?.meal_program ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                        {(realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) && campus?.student_capacity ? 
                          Math.round(((realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) / campus.student_capacity) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Capacity Utilization</div>
                      {realStudentData?.total !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">Using Real Student Count</div>
                      )}
                      <Progress 
                        value={(realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) && campus?.student_capacity ? 
                          ((realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) / campus.student_capacity) * 100 : 0} 
                        className="mt-2" 
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                        {(realTeachersCount || campus?.total_teachers) && (realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) ? 
                          Math.round((realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) / (realTeachersCount || campus?.total_teachers || 1)) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Student-Teacher Ratio</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {realTeachersCount !== null ? 'Using Real Count' : ''} Ideal: 15-20
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                        {campus?.total_classrooms && (realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) ? 
                          Math.round((realStudentData?.total !== undefined ? realStudentData.total : campus?.total_students) / campus.total_classrooms) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Students per Classroom</div>
                      <div className="text-xs text-gray-500 mt-1">Current avg: {renderValue(campus?.avg_class_size)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
            </div>
          </div>
    </div>
  )
}

export default function AdminCampusProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CampusProfileContent />
    </Suspense>
  )
}