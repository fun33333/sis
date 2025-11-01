"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// mock data removed; using real API data only
import { apiGet, getAllCampuses } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Building2, MapPin, Users, GraduationCap, ChevronRight, Loader2 } from "lucide-react"
import { getCurrentUserRole } from "@/lib/permissions"
import { getAllStudents, getFilteredTeachers } from "@/lib/api"

export default function CampusListPage() {
  useEffect(() => {
    document.title = "Campus List | IAK SMS";
  }, []);

  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [campuses, setCampuses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [realStudentCounts, setRealStudentCounts] = React.useState<Record<number, number>>({})
  const [realTeacherCounts, setRealTeacherCounts] = React.useState<Record<number, number>>({})
  
  // Role-based access control
  const [userRole, setUserRole] = React.useState<string>("")
  const canAddCampus = userRole === "superadmin"
  
  React.useEffect(() => {
    setUserRole(getCurrentUserRole())
  }, [])

  const filtered = (Array.isArray(campuses) ? campuses : []).filter((c: any) =>
    (c?.campus_name || c?.name || "").toLowerCase().includes(query.toLowerCase())
  )

  // metrics from API data only (fallbacks to 0 for avg score)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Fetch campuses and real counts
    Promise.all([
      getAllCampuses(),
      getAllStudents(true) // Force refresh to get latest data
    ])
      .then(([campusesData, studentsData]) => {
        if (!mounted) return
        
        const list = Array.isArray(campusesData) 
          ? campusesData 
          : (Array.isArray((campusesData as any)?.results) ? (campusesData as any).results : [])
        setCampuses(list)
        
        // Calculate real student counts per campus
        const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData?.results || [])
        const studentCounts: Record<number, number> = {}
        
        // Initialize all campuses with 0 (to ensure all campuses have real count, even if 0)
        list.forEach((campus: any) => {
          if (campus.id) {
            studentCounts[campus.id] = 0
          }
        })
        
        // Count students per campus (only active students)
        studentsArray.forEach((student: any) => {
          if (student?.current_state && String(student.current_state).toLowerCase() !== 'active') return
          // Resolve campus id from multiple possible shapes
          const candidates = [
            student?.campus?.id,
            student?.campus?.pk,
            student?.campus_id,
            student?.current_campus,
            student?.current_campus_id,
            student?.campus
          ]
          const found = candidates.find((v: any) => v !== null && v !== undefined && String(v).trim() !== '')
          const campusId = found !== undefined ? Number(found) : null
          if (campusId !== null && Object.prototype.hasOwnProperty.call(studentCounts, campusId)) {
            studentCounts[campusId] = (studentCounts[campusId] || 0) + 1
          }
        })
        
        setRealStudentCounts(studentCounts)
        
        // Fetch teacher counts for each campus
        const teacherCounts: Record<number, number> = {}
        
        // Initialize all campuses with 0
        list.forEach((campus: any) => {
          if (campus.id) {
            teacherCounts[campus.id] = 0
          }
        })
        
        const teacherPromises = list.map((campus: any) => 
          getFilteredTeachers({ 
            current_campus: campus.id, 
            is_currently_active: true 
          }).then((response) => {
            const count = Array.isArray(response) ? response.length : (response?.count || 0)
            return { campusId: campus.id, count }
          }).catch(() => {
            // Return 0 on error
            return { campusId: campus.id, count: 0 }
          })
        )
        
        Promise.all(teacherPromises).then((results) => {
          if (!mounted) return
          results.forEach(({ campusId, count }) => {
            if (campusId && teacherCounts.hasOwnProperty(campusId)) {
              teacherCounts[campusId] = count
            }
          })
          setRealTeacherCounts(teacherCounts)
        })
      })
      .catch((err) => {
        console.error(err)
        if (!mounted) return
        setError(err.message || "Failed to load campuses")
      })
      .finally(() => mounted && setLoading(false))
    
    return () => {
      mounted = false
    }
  }, [])

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    const apiBase = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000')
      : 'http://127.0.0.1:8000'
    return `${apiBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Campus List</h1>
              <p className="text-sm text-slate-600">Manage campuses, profiles and quick actions</p>
        </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campuses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#274c77] focus:border-transparent text-sm"
            aria-label="Search campuses"
          />
              </div>
          {canAddCampus && (
            <Button 
              onClick={() => router.push("/admin/campus/add")}
              style={{ backgroundColor: '#274c77' }}
                  className="flex items-center gap-2 px-4 py-2.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Campus</span>
                  <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>
        </div>

        {/* Campus Cards */}
        {loading ? (
          <Card>
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#274c77]" />
                <p className="text-slate-600">Loading campuses...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 sm:p-12">
              <div className="text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12">
              <div className="text-center">
                <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 font-medium">No campuses found</p>
                <p className="text-sm text-slate-500 mt-2">
                  {query ? 'Try adjusting your search query' : 'Get started by adding a new campus'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filtered.map((c, i) => {
              // Use real student count if available (including 0), otherwise fallback to campus record
              const hasRealStudentCount = realStudentCounts.hasOwnProperty(c.id)
              const realStudentCount = hasRealStudentCount ? realStudentCounts[c.id] : null
              const studentCount = hasRealStudentCount ? realStudentCounts[c.id] : (typeof c.num_students === 'number' ? c.num_students : (c.total_students || 0))
              
              // Use real teacher count if available (including 0), otherwise fallback to campus record
              const hasRealTeacherCount = realTeacherCounts.hasOwnProperty(c.id)
              const realTeacherCount = hasRealTeacherCount ? realTeacherCounts[c.id] : null
              const teacherCount = hasRealTeacherCount ? realTeacherCounts[c.id] : (c.total_teachers || 0)
              
              const campusImageUrl = getImageUrl(c.campus_photo)
              
              return (
                <Link
                  key={c.id || i}
                  href={`/admin/campus/profile?id=${encodeURIComponent(String(c.id))}`}
                  className="block"
                  aria-label={`Open campus ${c.campus_name || c.name}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-[#274c77]/30 group">
                    <CardContent className="p-0">
                      {/* Campus Image Header */}
                      {campusImageUrl && (
                        <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={campusImageUrl} 
                            alt={c.campus_name || c.name || 'Campus'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          {/* Status Badge on Image */}
                          <div className="absolute top-3 right-3">
                            <Badge className={`${c.status === 'active' 
                              ? 'bg-green-500/90 text-white border-green-400' 
                              : c.status === 'inactive'
                              ? 'bg-yellow-500/90 text-white border-yellow-400'
                              : 'bg-gray-500/90 text-white border-gray-400'
                            }`}>
                              {c.status || '—'}
                            </Badge>
                      </div>
                    </div>
                      )}
                      
                      <div className={`p-4 sm:p-5 ${!campusImageUrl ? 'rounded-t-lg' : ''}`}>
                        {/* Campus Info */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                          {!campusImageUrl && (
                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#274c77]/10 flex items-center justify-center">
                              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#274c77]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-[#274c77] transition-colors">
                              {c.campus_name || c.name || 'Unknown Campus'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                              <span className="font-medium">Code: {c.campus_code || c.code || `C${String(i + 1).padStart(2, "0")}`}</span>
                              {(c.address_full || c.address) && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{c.address_full || c.address}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            {c.city && (
                              <div className="text-xs text-slate-500 mt-1">
                                {c.city} {c.district ? `, ${c.district}` : ''}
                              </div>
                            )}
                          </div>
                          {!campusImageUrl && (
                            <div className="flex-shrink-0">
                              <Badge className={`${c.status === 'active' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : c.status === 'inactive'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {c.status || '—'}
                              </Badge>
                            </div>
                          )}
                    </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-lg sm:text-xl font-bold text-slate-800">{studentCount}</div>
                              <div className="text-xs text-slate-600">Students</div>
                              {hasRealStudentCount && (
                                <div className="text-xs text-blue-600 font-semibold mt-0.5">Real Database Count</div>
                              )}
                      </div>
                    </div>

                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-lg sm:text-xl font-bold text-slate-800">{teacherCount}</div>
                              <div className="text-xs text-slate-600">Teachers</div>
                              {hasRealTeacherCount && (
                                <div className="text-xs text-green-600 font-semibold mt-0.5">Real Database Count</div>
                              )}
                            </div>
                    </div>
                    </div>

                        {/* Footer with arrow */}
                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-[#274c77] group-hover:gap-3 transition-all">
                            <span className="text-sm font-medium">View Details</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}