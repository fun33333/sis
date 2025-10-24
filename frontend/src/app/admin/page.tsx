"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MultiSelectFilter } from "@/components/dashboard/multi-select-filter"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart"
import { CampusPerformanceChart } from "@/components/dashboard/campus-performance-chart"
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart"
import { MotherTongueChart } from "@/components/dashboard/mother-tongue-chart"
import { ReligionChart } from "@/components/dashboard/religion-chart"
import { EnrollmentTrendChart } from "@/components/dashboard/enrollment-trend-chart"
import { AgeDistributionChart } from "@/components/dashboard/age-distribution-chart"
import { WeeklyAttendanceChart } from "@/components/dashboard/weekly-attendance-chart"
import { ZakatStatusChart } from "@/components/dashboard/zakat-status-chart"
import { HouseOwnershipChart } from "@/components/dashboard/house-ownership-chart"
import { UserGreeting } from "@/components/dashboard/user-greeting"
import { ArrowLeft, Users, Download, ChevronDown, GraduationCap, UsersRound, RefreshCw } from "lucide-react"
import { getGradeDistribution, getGenderDistribution, getCampusPerformance, getEnrollmentTrend, getMotherTongueDistribution, getReligionDistribution, getAgeDistribution, getZakatStatusDistribution, getHouseOwnershipDistribution } from "@/lib/chart-utils"
import type { FilterState, LegacyStudent as DashboardStudent } from "@/types/dashboard"
import { useRouter } from "next/navigation"
import { getDashboardStats, getAllStudents, getAllCampuses, apiGet, getCurrentUserProfile } from "@/lib/api"
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions"

if (typeof window !== 'undefined') {
  import('html2pdf.js').then(mod => { (window as any).html2pdf = mod.default; });
}

export default function MainDashboardPage() {
  // Get current user role
  const [userRole, setUserRole] = useState<string>("")
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear dashboard cache on component mount to ensure fresh data
      try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('dashboard_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        console.log('🧹 Cleared localStorage cache on page load')
        
        // Also clear any cached data that might cause the 50 students issue
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(key => {
          if (key.includes('students') || key.includes('campus') || key.includes('dashboard')) {
            localStorage.removeItem(key)
          }
        })
        console.log('🧹 Cleared all related cache keys')
      } catch (error) {
        console.warn('Error clearing localStorage on mount:', error)
      }
      
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = user.role?.toLowerCase();
          setUserRole(role || "");
        } catch {
          setUserRole("");
        }
      }
    }
  }, []);
  // Utility to convert students to CSV
  function studentsToCSV(students: DashboardStudent[]) {
    if (!students.length) return '';
    const header = Object.keys(students[0] as any);
    const rows = students.map((s) => header.map((h) => JSON.stringify((s as any)[h] ?? "")).join(","));
    return [header.join(","), ...rows].join("\r\n");
  }

  function studentsToExcel(students: DashboardStudent[]) {
    return studentsToCSV(students); 
  }

  function downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Export dropdown state
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Principal campus filtering and shift filter
  const [userCampus, setUserCampus] = useState<string>("");
  const [principalShift, setPrincipalShift] = useState<string>("both");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  // Export handlers
  async function handleExport(type: string) {
    if (type === 'csv') {
      const csv = studentsToCSV(filteredStudents);
      downloadFile(csv, 'students.csv', 'text/csv');
    } else if (type === 'excel') {
      const excel = studentsToExcel(filteredStudents);
      downloadFile(excel, 'students.xls', 'application/vnd.ms-excel');
    } else if (type === 'pdf') {
      const main = document.querySelector('main');
      if (main && typeof window !== 'undefined' && (window as any).html2pdf) {
        (window as any).html2pdf().from(main).set({
          margin: 0.5,
          filename: 'dashboard.pdf',
          html2canvas: { scale: 1 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        }).save();
      } else {
        alert('PDF export requires html2pdf.js.');
      }
    }
    setExportOpen(false);
  }
  const router = useRouter();
  
  // Get user role and campus for principal filtering
  useEffect(() => {
    async function getUserData() {
      if (typeof window !== "undefined") {
        const role = getCurrentUserRole();
        setUserRole(role);
        
        // For principals, get detailed profile data from API
        if (role === 'principal') {
          try {
            const userProfile = await getCurrentUserProfile() as any;
            
            if (userProfile?.shift) {
              setPrincipalShift(String(userProfile.shift));
            }
            if (userProfile?.campus?.campus_name) {
              setUserCampus(userProfile.campus.campus_name);
            } else if (userProfile?.campus) {
              setUserCampus(userProfile.campus);
            }
          } catch (error) {
            console.error('Error fetching principal profile:', error);
            // Fallback to localStorage data
            const user = getCurrentUser() as any;
            if (user?.campus?.campus_name) {
              setUserCampus(user.campus.campus_name);
            } else if (user?.campus) {
              setUserCampus(user.campus);
            }
          }
        } else {
          // For other roles, use localStorage data
          const user = getCurrentUser() as any;
          if (user?.campus?.campus_name) {
            setUserCampus(user.campus.campus_name);
          }
        }
        
        if (role === "teacher") {
          router.replace("/admin/students/student-list");
        }
      }
    }
    
    getUserData();
  }, [router]);
  const [filters, setFilters] = useState<FilterState>({
    academicYears: [],
    campuses: [],
    grades: [],
    genders: [],
    motherTongues: [],
    religions: [],
  })
  const [students, setStudents] = useState<DashboardStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)
  const [principalCampusId, setPrincipalCampusId] = useState<number | null>(null)
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0)
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0) // From API stats
  const [apiChartData, setChartData] = useState<any>(null) // Chart data from API (all students)
  const [teachersCount, setTeachersCount] = useState<number>(0) // Total teachers count
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState<any[]>([]) // Weekly attendance data
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false) // Refresh state
  const [shiftFilter, setShiftFilter] = useState<string>("all");

  useEffect(() => {
    // Dynamic title based on user role
    if (userRole === 'principal' && userCampus) {
      document.title = `${userCampus} Dashboard | IAK SMS`
    } else if (userRole === 'superadmin') {
      document.title = "Super Admin Dashboard | IAK SMS"
    } else {
    document.title = "Dashboard | IAK SMS"
    }
    let loaderTimeout: NodeJS.Timeout;
    
    async function fetchData() {
      // Check cache first (5 minutes) - but only if we have valid role
      const now = Date.now()
      const cacheKey = `dashboard_${userRole}_${userCampus || 'all'}`
      
      // Skip cache for now to always get fresh data
      // This prevents the issue where cached data shows first, then real data loads
      console.log('🔄 Skipping cache to fetch fresh data')
      
      setLoading(true)
      setShowLoader(true)
      console.log('🔄 Starting fresh data fetch...')
      
      try {
        // Fetch teachers count and weekly attendance data
        try {
          const q = shiftFilter && shiftFilter !== 'all' ? `?shift=${encodeURIComponent(shiftFilter)}` : ''
          const teachersResponse: any = await apiGet(`/api/teachers/${q}`)
          if (teachersResponse && Array.isArray(teachersResponse)) {
            setTeachersCount(teachersResponse.length)
          } else if (teachersResponse?.results && Array.isArray(teachersResponse.results)) {
            setTeachersCount(teachersResponse.results.length)
          }
        } catch (error) {
          console.error('Error fetching teachers:', error)
          setTeachersCount(0)
        }

        // Fetch weekly attendance data (last 7 days)
        try {
          const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          
          // Try to fetch real attendance data
          try {
            const attendanceResponse: any = await apiGet('/api/attendance/')
            
            if (attendanceResponse && Array.isArray(attendanceResponse)) {
              // Process attendance data for last 7 days
              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return date
              })
              
              const weekData = last7Days.map((date) => {
                const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
                const dateStr = date.toISOString().split('T')[0]
                
                // Find attendance records for this date
                const dayRecords = attendanceResponse.filter((record: any) => 
                  record.date === dateStr || record.date?.startsWith(dateStr)
                )
                
                // Calculate present/absent from records
                let present = 0
                let absent = 0
                
                dayRecords.forEach((record: any) => {
                  if (record.present_count) present += record.present_count
                  if (record.absent_count) absent += record.absent_count
                })
                
                return { day: dayName, present, absent }
              })
              
              setWeeklyAttendanceData(weekData)
            } else {
              // Fallback to empty data if API doesn't return array
              const weekData = daysOfWeek.map(day => ({ day, present: 0, absent: 0 }))
              setWeeklyAttendanceData(weekData)
            }
          } catch (apiError) {
            console.error('Error fetching real attendance:', apiError)
            // Fallback to empty data
            const weekData = daysOfWeek.map(day => ({ day, present: 0, absent: 0 }))
            setWeeklyAttendanceData(weekData)
          }
        } catch (error) {
          console.error('Error processing attendance:', error)
        }

        // Principal: Fetch campus-specific data
        if (userRole === 'principal' && userCampus) {
          // Optimize: Only fetch essential data first
          const [apiStudents, caps] = await Promise.all([
            getAllStudents(),
            getAllCampuses()
          ])
          
          // Fetch stats separately to avoid blocking
          const apiStats = await getDashboardStats()
          
          console.log('📊 API Response:', {
            students: Array.isArray(apiStudents) ? apiStudents.length : 'Not array',
            stats: apiStats,
            campuses: Array.isArray(caps) ? caps.length : 'Not array'
          });
          
          // Filter students by principal's campus
          const studentsArray = Array.isArray(apiStudents) ? apiStudents : [];
          const campusArray = Array.isArray(caps) ? caps : (Array.isArray((caps as any)?.results) ? (caps as any).results : [])
          
          console.log('Total students fetched:', studentsArray.length)
          console.log('Available campuses:', campusArray.map((c: any) => c.campus_name || c.name))
          
          // Find principal's campus ID
          const principalCampus = campusArray.find((c: any) => {
            if (!c) return false;
            return c.campus_name === userCampus || 
                   c.name === userCampus ||
                   c.campus_code === userCampus ||
                   String(c.id) === String(userCampus);
          })
          
          console.log('Principal campus found:', principalCampus)
          
          if (principalCampus) {
            // Filter students by campus
            const campusStudents = studentsArray.filter((student: any) => {
              if (!student || !student.campus) {
                console.log('❌ Student or campus is null:', student);
                return false;
              }
              
              const studentCampus = student.campus
              console.log('Student campus:', studentCampus, 'Principal campus:', userCampus, 'Principal campus ID:', principalCampus.id)
              
              if (typeof studentCampus === 'object' && studentCampus !== null) {
                const matches = (studentCampus.campus_name === userCampus) || 
                               (studentCampus.name === userCampus) ||
                               (studentCampus.campus_code === userCampus) ||
                               (studentCampus.id === principalCampus.id)
                console.log('Object campus match:', matches)
                return matches
              }
              
              // Check if student campus ID matches principal campus ID
              const matches = (studentCampus === principalCampus.id) || 
                             (studentCampus === userCampus) ||
                             (String(studentCampus) === String(principalCampus.id)) ||
                             (String(studentCampus) === String(userCampus))
              console.log('ID campus match:', matches)
              return matches
            })
            
            console.log('Filtered campus students:', campusStudents.length)
            
            // Process filtered students
            const idToCampusName = new Map<string, string>(
              campusArray.filter((c: any) => c && (c.campus_name || c.name)).map((c: any) => [String(c.id), String(c.campus_name || c.name || '')])
            )

            const mapped: DashboardStudent[] = campusStudents.map((item: any, idx: number) => {
              const createdAt = typeof item?.created_at === "string" ? item.created_at : ""
              const year = createdAt ? Number(createdAt.split("-")[0]) : new Date().getFullYear()
              const genderRaw = (item?.gender ?? "").toString().trim()
              const gradeName = (item?.current_grade ?? "Unknown").toString().trim()
              const motherTongue = (item?.mother_tongue ?? "Other").toString().trim()
              const religion = (item?.religion ?? "Other").toString().trim()
              const campusName = (() => {
                const raw = item?.campus
                if (raw && typeof raw === 'object' && raw.campus_name) {
                  return String(raw.campus_name).trim()
                }
                if (typeof raw === 'number' || typeof raw === 'string') {
                  const hit = idToCampusName.get(String(raw))
                  if (hit) return hit
                }
                return userCampus || 'Unknown Campus'
              })()
              
              return {
                rawData: item,
                studentId: String(item?.gr_no || item?.id || idx + 1),
                name: item?.name || "Unknown",
                academicYear: isNaN(year) ? new Date().getFullYear() : year,
                campus: campusName,
                grade: gradeName,
                current_grade: gradeName,
                gender: genderRaw || "Unknown",
                motherTongue: motherTongue,
                religion: religion,
                attendancePercentage: Math.floor(Math.random() * 31) + 70, // Mock data for now
                averageScore: Math.floor(Math.random() * 41) + 60, // Mock data for now
                retentionFlag: (item?.current_state || "").toLowerCase() === "active",
                enrollmentDate: createdAt ? new Date(createdAt) : new Date(),
              }
            })
            
            console.log('Mapped campus students:', mapped.length)
            console.log('Sample student data:', mapped[0])
            console.log('Campus filtering debug:', {
              userCampus,
              principalCampusId: principalCampus.id,
              totalStudents: studentsArray.length,
              filteredStudents: campusStudents.length,
              campusStudents: campusStudents.slice(0, 3).map(s => ({
                id: s.id,
                name: s.name,
                campus: s.campus,
                gender: s.gender
              }))
            })
            
            setStudents(mapped)
            setCacheTimestamp(Date.now())
            
            // Save to cache (with total count) - only store essential data to avoid quota exceeded
            const cacheData = {
              totalCount: mapped.length,
              // Only store first 50 students to avoid localStorage quota issues
              students: mapped.slice(0, 50),
              hasMore: mapped.length > 50
            }
            localStorage.setItem(cacheKey, JSON.stringify(cacheData))
            localStorage.setItem(`${cacheKey}_time`, now.toString())
          } else {
            console.warn('Principal campus not found:', userCampus)
            setStudents([])
          }
        } else {
          // Other roles: For dashboard, we don't need ALL students - just stats!
        // Import getDashboardStudents and getDashboardChartData at the top
        const { getDashboardStudents, getDashboardChartData } = await import('@/lib/api');
        
        // Fetch students (for table), stats (for metrics), charts (for all students), and campuses
        const [firstPageStudents, apiStats, chartData, caps] = await Promise.all([
          getDashboardStudents(100), // Only first 100 students for dashboard table
          getDashboardStats(), // Total count and basic stats
          getDashboardChartData(), // Chart data for ALL students
          getAllCampuses()
        ])

          // Use only first page of students for display
        const studentsArray = Array.isArray(firstPageStudents) ? firstPageStudents : [];
        
        // Set total count from API stats
        if (apiStats && typeof apiStats.totalStudents === 'number') {
          setTotalStudentsCount(apiStats.totalStudents)
        }
        
        // Store chart data separately (will be used instead of calculating from 100 students)
        if (chartData) {
          console.log('📊 Raw API Chart Data:', chartData)
          setChartData(chartData)
        }
        const campusArray = Array.isArray(caps) ? caps : (Array.isArray((caps as any)?.results) ? (caps as any).results : [])
        const idToCampusCode = new Map<string, string>(
            campusArray.map((c: any) => [String(c.id), String(c.campus_code || c.code || '')])
        )

        // Filter students by campus if Principal
        let filteredStudents = studentsArray;
        if (userRole?.includes("principal")) {
          // Try to infer campusId from userCampus or similar variable
          const principalCampusId = typeof userCampus === "string" || typeof userCampus === "number" ? userCampus : null;
          if (principalCampusId) {
            filteredStudents = studentsArray.filter((student: any) => {
              return student.current_campus === principalCampusId || student.campus_id === principalCampusId;
            });
          }
        }

        const mapped: DashboardStudent[] = filteredStudents.map((item: any, idx: number) => {
            const createdAt = typeof item?.created_at === "string" ? item.created_at : ""
            const year = createdAt ? Number(createdAt.split("-")[0]) : new Date().getFullYear()
            const genderRaw = (item?.gender ?? "").toString().trim()
          const campusCode = (() => {
            const raw = item?.campus
              if (raw && typeof raw === 'object') return String(raw?.campus_code || raw?.code || 'Unknown').trim()
            if (typeof raw === 'number' || typeof raw === 'string') {
              const hit = idToCampusCode.get(String(raw))
              if (hit) return hit
            }
            return 'Unknown'
          })()
            const gradeName = (item?.current_grade ?? "Unknown").toString().trim()
            const motherTongue = (item?.mother_tongue ?? "Other").toString().trim()
            const religion = (item?.religion ?? "Other").toString().trim()
            return {
              rawData: item,
              studentId: String(item?.gr_no || item?.id || idx + 1),
              name: item?.name || "Unknown",
              academicYear: isNaN(year) ? new Date().getFullYear() : year,
              campus: campusCode,
              grade: gradeName,
              current_grade: gradeName,
              gender: genderRaw || "Unknown",
              motherTongue: motherTongue,
              religion: religion,
              attendancePercentage: 0, // Will be calculated from real attendance data
              averageScore: 0, // Removed mock data
              retentionFlag: (item?.current_state || "").toLowerCase() === "active",
              enrollmentDate: createdAt ? new Date(createdAt) : new Date(),
            }
          })
        
        setStudents(mapped)
        setCacheTimestamp(Date.now())
        
        // Save to cache (with total count) - only store essential data to avoid quota exceeded
        const cacheData = {
          totalCount: totalStudentsCount,
          // Only store first 50 students to avoid localStorage quota issues
          students: mapped.slice(0, 50),
          hasMore: mapped.length > 50
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        localStorage.setItem(`${cacheKey}_time`, now.toString())
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to empty array
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    
    // Only fetch if userRole is set
    if (userRole) {
      fetchData()
    }
    
    loaderTimeout = setTimeout(() => {
      setShowLoader(false)
    }, 3000)
    return () => clearTimeout(loaderTimeout)
  }, [userRole, userCampus, shiftFilter])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Principal campus filtering is already done in fetchData, so we only need to apply other filters
      if (filters.academicYears.length > 0 && !filters.academicYears.includes(student.academicYear)) return false
      if (filters.campuses.length > 0 && !filters.campuses.includes(student.campus)) return false
      if (filters.grades.length > 0 && !filters.grades.includes(student.grade)) return false
      if (filters.genders.length > 0 && !filters.genders.includes(student.gender)) return false
      if (filters.motherTongues.length > 0 && !filters.motherTongues.includes(student.motherTongue)) return false
      if (filters.religions.length > 0 && !filters.religions.includes(student.religion)) return false
      return true
    })
  }, [filters, students])

  const metrics = useMemo(() => {
    // Use totalStudentsCount from API stats instead of filtered students length
    const totalStudents = totalStudentsCount
    
    // Calculate real attendance from weekly data (average of present students)
    const averageAttendance = weeklyAttendanceData.length > 0 
      ? Math.round(weeklyAttendanceData.reduce((sum, day) => sum + day.present, 0) / weeklyAttendanceData.length)
      : 0
    
    // Teacher:Student ratio
    const teacherStudentRatio = teachersCount > 0 ? Math.round(totalStudents / teachersCount) : 0
    
    return { 
      totalStudents, 
      averageAttendance, 
      teachersCount,
      teacherStudentRatio,
      averageScore: 0, // Removed
      retentionRate: 0 // Removed
    }
  }, [totalStudentsCount, teachersCount, weeklyAttendanceData])

  // Campus performance data - use filtered students
  const campusPerformanceData = useMemo(() => {
    // Use filtered students for accurate campus counts based on applied filters
    const counts = filteredStudents.reduce((acc: Record<string, number>, s) => {
      const campusName = s.campus || 'Unknown'
      if (campusName !== 'Unknown') {
        acc[campusName] = (acc[campusName] || 0) + 1
      }
      return acc
    }, {})
    const campusData = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
    
    return campusData
  }, [filteredStudents])

  const chartData = useMemo(() => {
    // Use API chart data if available, otherwise calculate from filtered students
    if (apiChartData) {
      // Transform API data to match frontend expectations
      const transformedData = {
        gradeDistribution: apiChartData.gradeDistribution?.map((item: any) => ({
          name: item.grade || item.name,
          value: item.count || item.value
        })) || [],
        genderDistribution: apiChartData.genderDistribution || [],
        campusPerformance: apiChartData.campusPerformance || [],
        enrollmentTrend: apiChartData.enrollmentTrend || [],
        motherTongueDistribution: apiChartData.motherTongueDistribution || [],
        religionDistribution: apiChartData.religionDistribution || [],
        ageDistribution: apiChartData.ageDistribution || [],
        zakatStatus: apiChartData.zakatStatus || [],
        houseOwnership: apiChartData.houseOwnership || [],
      }
      
      console.log('📊 Transformed API Chart Data:', transformedData)
      return transformedData
    }
    
    // Fallback: calculate from filtered students
    const gradeDistribution = getGradeDistribution(filteredStudents as unknown as any[])
    const genderDistribution = getGenderDistribution(filteredStudents as unknown as any[])
    const enrollmentTrend = getEnrollmentTrend(filteredStudents as unknown as any[])
    const motherTongueDistribution = getMotherTongueDistribution(filteredStudents as unknown as any[])
    const religionDistribution = getReligionDistribution(filteredStudents as unknown as any[])
    const ageDistribution = getAgeDistribution(filteredStudents as unknown as any[])
    const zakatStatus = getZakatStatusDistribution(filteredStudents as unknown as any[])
    const houseOwnership = getHouseOwnershipDistribution(filteredStudents as unknown as any[])
    
    return {
      gradeDistribution,
      genderDistribution,
      campusPerformance: campusPerformanceData,
      enrollmentTrend,
      motherTongueDistribution,
      religionDistribution,
      ageDistribution,
      zakatStatus,
      houseOwnership,
    }
  }, [apiChartData, filteredStudents, campusPerformanceData])

  // Dynamic filter options based on real data
  const dynamicAcademicYears = useMemo(() => {
    const years = Array.from(new Set(students.map(s => s.academicYear))).sort((a, b) => a - b)
    return years
  }, [students])
  
  const dynamicCampuses = useMemo(() => {
    const campuses = Array.from(new Set(students.map(s => s.campus))).sort()
    return campuses
  }, [students])
  
  const dynamicGrades = useMemo(() => {
    const grades = Array.from(new Set(students.map(s => s.grade))).sort()
    return grades
  }, [students])
  
  const dynamicMotherTongues = useMemo(() => {
    const motherTongues = Array.from(new Set(students.map(s => (s.motherTongue || "").toString().trim()))).filter(Boolean).sort()
    return motherTongues
  }, [students])
  
  const dynamicReligions = useMemo(() => {
    const religions = Array.from(new Set(students.map(s => (s.religion || "").toString().trim()))).filter(Boolean).sort()
    return religions
  }, [students])
  
  const dynamicGenders = useMemo(() => {
    const genders = Array.from(new Set(students.map(s => (s.gender || "").toString().trim()))).filter(Boolean).sort()
    return genders
  }, [students])

  const resetFilters = () => {
    setFilters({ academicYears: [], campuses: [], grades: [], genders: [], motherTongues: [], religions: [] })
  }

  // Refresh data function
  const refreshData = async () => {
    setIsRefreshing(true)
    setLoading(true)
    setShowLoader(true)
    try {
      // Clear ALL dashboard cache to force fresh data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('dashboard_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('🔄 Cleared all dashboard cache for refresh')
      
      // Force re-fetch by calling the useEffect logic directly
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
      setLoading(false)
      setShowLoader(false)
    }
  }

  // Auto-refresh disabled to prevent cache issues
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refreshData()
  //   }, 5 * 60 * 1000) // 5 minutes

  //   return () => clearInterval(interval)
  // }, [userRole, userCampus])

  // Clear cache when user role changes (login/logout)
  useEffect(() => {
    if (userRole) {
      try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('dashboard_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        console.log('🧹 Cleared cache for user role change')
      } catch (error) {
        console.warn('Error clearing cache on role change:', error)
      }
    }
  }, [userRole])

  // Function to clear old localStorage data to prevent quota exceeded

  // Extract fetchData function to be reusable
  const fetchData = async () => {
    // Clear ALL localStorage cache on every refresh to get fresh data
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('dashboard_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleared localStorage cache for fresh data')
    } catch (error) {
      console.warn('Error clearing localStorage:', error)
    }
    
    const now = Date.now()
    const cacheKey = `dashboard_${userRole}_${userCampus || 'all'}`
    
    setLoading(true)
    
    try {
      // Fetch teachers count and weekly attendance data
      try {
        const teachersResponse: any = await apiGet('/api/teachers/')
        if (teachersResponse && Array.isArray(teachersResponse)) {
          setTeachersCount(teachersResponse.length)
        } else if (teachersResponse?.results && Array.isArray(teachersResponse.results)) {
          setTeachersCount(teachersResponse.results.length)
        }
      } catch (error) {
        console.error('Error fetching teachers:', error)
        setTeachersCount(0)
      }

      // Fetch weekly attendance data (last 7 days)
      try {
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        // Try to fetch real attendance data
        try {
          const attendanceResponse: any = await apiGet('/api/attendance/')
          
          if (attendanceResponse && Array.isArray(attendanceResponse)) {
            // Process attendance data for last 7 days
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (6 - i))
              return date
            })
            
            const weekData = last7Days.map((date) => {
              const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
              const dateStr = date.toISOString().split('T')[0]
              
              // Find attendance records for this date
              const dayRecords = attendanceResponse.filter((record: any) => 
                record.date === dateStr || record.date?.startsWith(dateStr)
              )
              
              // Calculate present/absent from records
              let present = 0
              let absent = 0
              
              dayRecords.forEach((record: any) => {
                if (record.present_count) present += record.present_count
                if (record.absent_count) absent += record.absent_count
              })
              
              return { day: dayName, present, absent }
            })
            
            setWeeklyAttendanceData(weekData)
          } else {
            // Fallback to empty data if API doesn't return array
            const weekData = daysOfWeek.map(day => ({ day, present: 0, absent: 0 }))
            setWeeklyAttendanceData(weekData)
          }
        } catch (apiError) {
          console.error('Error fetching real attendance:', apiError)
          // Fallback to empty data
          const weekData = daysOfWeek.map(day => ({ day, present: 0, absent: 0 }))
          setWeeklyAttendanceData(weekData)
        }
      } catch (error) {
        console.error('Error processing attendance:', error)
      }

      // Principal: Fetch campus-specific data
      if (userRole === 'principal' && userCampus) {
        // Optimize: Only fetch essential data first
        const [apiStudents, caps] = await Promise.all([
          getAllStudents(false, shiftFilter === 'all' ? undefined : shiftFilter),
          getAllCampuses()
        ])
        
        // Fetch stats separately to avoid blocking
        const apiStats = await getDashboardStats()
        
        console.log('📊 API Response:', {
          students: Array.isArray(apiStudents) ? apiStudents.length : 'Not array',
          stats: apiStats,
          campuses: Array.isArray(caps) ? caps.length : 'Not array'
        });
        
        // Filter students by principal's campus
        const studentsArray = Array.isArray(apiStudents) ? apiStudents : [];
        const campusArray = Array.isArray(caps) ? caps : (Array.isArray((caps as any)?.results) ? (caps as any).results : [])
        
        console.log('Total students fetched:', studentsArray.length)
        console.log('Available campuses:', campusArray.map((c: any) => c.campus_name || c.name))
        
        // Find principal's campus ID
        const principalCampus = campusArray.find((c: any) => {
          if (!c) return false;
          return c.campus_name === userCampus || 
                 c.name === userCampus ||
                 c.campus_code === userCampus ||
                 String(c.id) === String(userCampus);
        })
        
        if (principalCampus) {
          console.log('Found principal campus:', principalCampus)
          setPrincipalCampusId(principalCampus.id)
          
          // Filter students by campus
          const campusStudents = studentsArray.filter((student: any) => {
            const studentCampus = student.campus
            if (!studentCampus) return false
            
            // Check if student belongs to this campus
            if (typeof studentCampus === 'object') {
              return studentCampus.id === principalCampus.id || 
                     studentCampus.campus_name === userCampus ||
                     studentCampus.campus_code === userCampus
            } else {
              return String(studentCampus) === String(principalCampus.id) ||
                     studentCampus === userCampus
            }
          })
          
          console.log('Campus students after filtering:', campusStudents.length)
          
          // Map students to dashboard format
          const idToCampusCode = new Map()
          campusArray.forEach((c: any) => {
            if (c?.id && c?.campus_code) {
              idToCampusCode.set(String(c.id), c.campus_code)
            }
          })

          const mapped: DashboardStudent[] = campusStudents.map((item: any, idx: number) => {
            const createdAt = typeof item?.created_at === "string" ? item.created_at : ""
            const year = createdAt ? Number(createdAt.split("-")[0]) : new Date().getFullYear()
            const genderRaw = (item?.gender ?? "").toString().trim()
          const campusCode = (() => {
            const raw = item?.campus
              if (raw && typeof raw === 'object') return String(raw?.campus_code || raw?.code || 'Unknown').trim()
            if (typeof raw === 'number' || typeof raw === 'string') {
              const hit = idToCampusCode.get(String(raw))
              if (hit) return hit
            }
            return 'Unknown'
          })()
            const gradeName = (item?.current_grade ?? "Unknown").toString().trim()
            const motherTongue = (item?.mother_tongue ?? "Other").toString().trim()
            const religion = (item?.religion ?? "Other").toString().trim()
            return {
              rawData: item,
              studentId: String(item?.gr_no || item?.id || idx + 1),
              name: item?.name || "Unknown",
              academicYear: isNaN(year) ? new Date().getFullYear() : year,
              campus: campusCode,
              grade: gradeName,
              current_grade: gradeName,
              gender: genderRaw || "Unknown",
              motherTongue: motherTongue,
              religion: religion,
              attendancePercentage: 0, // Will be calculated from real attendance data
              averageScore: 0, // Removed mock data
              retentionFlag: (item?.current_state || "").toLowerCase() === "active",
              enrollmentDate: createdAt ? new Date(createdAt) : new Date(),
            }
          })
        
        setStudents(mapped)
        setCacheTimestamp(Date.now())
        
        // Save to cache (with total count) - only store essential data to avoid quota exceeded
        const cacheData = {
          totalCount: mapped.length,
          // Only store first 50 students to avoid localStorage quota issues
          students: mapped.slice(0, 50),
          hasMore: mapped.length > 50
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        localStorage.setItem(`${cacheKey}_time`, now.toString())
        } else {
          console.warn('Principal campus not found in API response')
          setStudents([])
        }
      } else {
        // Super Admin: Fetch all data
        const [apiStudents, caps, apiStats] = await Promise.all([
          getAllStudents(false, shiftFilter === 'all' ? undefined : shiftFilter),
          getAllCampuses(),
          getDashboardStats()
        ])
        
        console.log('📊 Super Admin API Response:', {
          students: Array.isArray(apiStudents) ? apiStudents.length : 'Not array',
          stats: apiStats,
          campuses: Array.isArray(caps) ? caps.length : 'Not array'
        });
        
        const studentsArray = Array.isArray(apiStudents) ? apiStudents : [];
        const campusArray = Array.isArray(caps) ? caps : (Array.isArray((caps as any)?.results) ? (caps as any).results : [])
        
        // Map all students
        const idToCampusCode = new Map()
        campusArray.forEach((c: any) => {
          if (c?.id && c?.campus_code) {
            idToCampusCode.set(String(c.id), c.campus_code)
          }
        })

        const mapped: DashboardStudent[] = studentsArray.map((item: any, idx: number) => {
            const createdAt = typeof item?.created_at === "string" ? item.created_at : ""
            const year = createdAt ? Number(createdAt.split("-")[0]) : new Date().getFullYear()
            const genderRaw = (item?.gender ?? "").toString().trim()
          const campusCode = (() => {
            const raw = item?.campus
              if (raw && typeof raw === 'object') return String(raw?.campus_code || raw?.code || 'Unknown').trim()
            if (typeof raw === 'number' || typeof raw === 'string') {
              const hit = idToCampusCode.get(String(raw))
              if (hit) return hit
            }
            return 'Unknown'
          })()
            const gradeName = (item?.current_grade ?? "Unknown").toString().trim()
            const motherTongue = (item?.mother_tongue ?? "Other").toString().trim()
            const religion = (item?.religion ?? "Other").toString().trim()
            return {
              rawData: item,
              studentId: String(item?.gr_no || item?.id || idx + 1),
              name: item?.name || "Unknown",
              academicYear: isNaN(year) ? new Date().getFullYear() : year,
              campus: campusCode,
              grade: gradeName,
              current_grade: gradeName,
              gender: genderRaw || "Unknown",
              motherTongue: motherTongue,
              religion: religion,
              attendancePercentage: 0, // Will be calculated from real attendance data
              averageScore: 0, // Removed mock data
              retentionFlag: (item?.current_state || "").toLowerCase() === "active",
              enrollmentDate: createdAt ? new Date(createdAt) : new Date(),
            }
          })
        
        setStudents(mapped)
        setTotalStudentsCount(mapped.length)
        setCacheTimestamp(Date.now())
        
        // Save to cache (with total count) - only store essential data to avoid quota exceeded
        const cacheData = {
          totalCount: mapped.length,
          // Only store first 50 students to avoid localStorage quota issues
          students: mapped.slice(0, 50),
          hasMore: mapped.length > 50
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        localStorage.setItem(`${cacheKey}_time`, now.toString())
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to empty array
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

  if (loading || showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-8 border-blue-400 border-t-transparent animate-spin" style={{ borderTopColor: '#FFD700' }}></div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0rDiT9it7r-r__abYbK7u5UQ1av9CoxaChw&s"
              alt="VIP Donor"
              className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow-lg absolute top-4 left-4"
              style={{ boxShadow: '0 4px 16px 0 rgba(0, 110, 244, 0.4)' }}
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-2 tracking-tight">Welcome to the VIP Dashboard</h2>
            <p className="text-lg text-blue-700 font-medium">Loading student data...</p>
            <span className="block mt-2 text-sm text-yellow-700 font-semibold">Powered by Idara Al-Khair Foundation</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* User Greeting */}
        <UserGreeting className="mb-6" />

        {/* Filters Card */}
        <Card className="!bg-[#E7ECEF] shadow-lg mb-6">
          <CardHeader className="!bg-[#E7ECEF]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Button variant="ghost" className="flex items-center gap-2 rounded-xl shadow-sm hover:bg-white/50 transition" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2 items-center">
                <Button 
                  onClick={refreshData} 
                  variant="outline" 
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
                {/* Export Button Dropdown (moved here) */}
                <div className="relative" ref={exportRef}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-gray-100"
                    onClick={() => setExportOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={exportOpen}
                  >
                    <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4" />
                  </Button>
                  {exportOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 animate-fade-in">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleExport('excel')}>Excel</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleExport('csv')}>CSV</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleExport('pdf')}>PDF</button>
                    </div>
                  )}
                </div>
              </div>            
            </div>
          </CardHeader>
          <CardContent className="!bg-[#E7ECEF]">
            <div className="flex flex-wrap gap-4">
              <MultiSelectFilter title="Academic Year" options={dynamicAcademicYears} selectedValues={filters.academicYears} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, academicYears: val as number[] }))} placeholder="All years" />
              {/* Hide campus filter for principal - they only see their campus data */}
              {userRole !== 'principal' && (
              <MultiSelectFilter title="Campus" options={dynamicCampuses} selectedValues={filters.campuses} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, campuses: val as string[] }))} placeholder="All campuses" />
              )}
              <MultiSelectFilter title="Grade" options={dynamicGrades} selectedValues={filters.grades} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, grades: val as string[] }))} placeholder="All grades" />
              <MultiSelectFilter title="Gender" options={dynamicGenders} selectedValues={filters.genders} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, genders: val as ("Male" | "Female" | "Other")[] }))} placeholder="All genders" />
              <MultiSelectFilter title="Mother Tongue" options={dynamicMotherTongues} selectedValues={filters.motherTongues} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, motherTongues: val as string[] }))} placeholder="All mother tongues" />
              <MultiSelectFilter title="Religion" options={dynamicReligions} selectedValues={filters.religions} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, religions: val as string[] }))} placeholder="All religions" />
              {/* Shift filter (principal only) */}
              {userRole === 'principal' && (
                <MultiSelectFilter
                  title="Shift"
                  options={["All", "Morning", "Afternoon", "Both"]}
                  selectedValues={[
                    shiftFilter === 'all' ? 'All' :
                    shiftFilter === 'morning' ? 'Morning' :
                    shiftFilter === 'afternoon' ? 'Afternoon' : 'Both'
                  ]}
                  onSelectionChange={(val) => {
                    // For single selection, replace the entire array with the new selection
                    const newSelection = val as (string | number)[]
                    const choice = String(newSelection[newSelection.length - 1] || 'All')
                    const normalized = choice.toLowerCase()
                    setShiftFilter(normalized)
                    console.log('Shift filter changed to:', normalized, 'from selection:', newSelection)
                  }}
                  placeholder="All shifts"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          <KpiCard 
            title={userRole === 'principal' && userCampus ? `${userCampus} Students` : "Total Students"} 
            value={metrics.totalStudents} 
            description={userRole === 'principal' && userCampus ? "Campus enrollments" : "Active enrollments"} 
            icon={Users} 
            bgColor="#274C77" 
            textColor="text-white" 
          />
          <KpiCard 
            title="Avg Attendance" 
            value={`${metrics.averageAttendance}`} 
            description="Daily average present students" 
            icon={Users} 
            bgColor="#6096BA" 
            textColor="text-white" 
          />
          <KpiCard 
            title="Total Teachers" 
            value={metrics.teachersCount} 
            description="Active teaching staff" 
            icon={GraduationCap} 
            bgColor="#10b981" 
            textColor="text-white" 
          />
          <KpiCard 
            title="Teacher:Student Ratio" 
            value={`1:${metrics.teacherStudentRatio}`} 
            description="Students per teacher" 
            icon={UsersRound} 
            bgColor="#14b8a6" 
            textColor="text-white" 
          />
        </div>

        {/* Row 1: Gender & Religion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
          <GenderDistributionChart data={chartData.genderDistribution} />
          <ReligionChart data={chartData.religionDistribution} />
        </div>

        {/* Row 2: Mother Tongue & Enrollment Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
          <MotherTongueChart data={chartData.motherTongueDistribution} />
          <EnrollmentTrendChart data={chartData.enrollmentTrend.map((t: any) => ({ name: String(t.year), value: t.enrollment }))} />
        </div>

        {/* Row 3: Campus Students - Full Width (only for non-principal) */}
        {userRole !== 'principal' && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 mt-8">
            <CampusPerformanceChart data={chartData.campusPerformance} valueKind="count" />
        </div>
        )}

        {/* Row 4: Weekly Attendance & Age Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
          <WeeklyAttendanceChart data={weeklyAttendanceData} />
          <AgeDistributionChart data={chartData.ageDistribution.map((item: any) => ({ name: `${item.age} years`, value: item.count }))} />
        </div>

        {/* Row 5: Zakat Status & House Ownership */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
          <ZakatStatusChart data={chartData.zakatStatus.map((item: any) => ({ name: item.status, value: item.count }))} />
          <HouseOwnershipChart data={chartData.houseOwnership.map((item: any) => ({ name: item.status, value: item.count }))} />
        </div>

        {/* Row 6: Grade Distribution - Full Width */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 mt-8 mb-8">
          <GradeDistributionChart data={chartData.gradeDistribution} />
        </div>
      </div>
    </main>
  )
}
