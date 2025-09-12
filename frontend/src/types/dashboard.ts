export interface Student {
  studentId: string
  name: string
  academicYear: number
  campus: string
  grade: string
  gender: "Male" | "Female" | "Other"
  motherTongue: string
  religion: string
  attendancePercentage: number
  averageScore: number
  retentionFlag: boolean
  enrollmentDate: Date
}
  
  export interface FilterState {
    academicYears: number[]
    campuses: string[]
    grades: string[]
    genders: ("Male" | "Female" | "Other")[]
    motherTongues: string[]
    religions: string[]
  }
  
  export interface DashboardMetrics {
    totalStudents: number
    averageAttendance: number
    averageScore: number
    retentionRate: number
  }
  
  export interface ChartData {
    name: string
    value: number
    fill?: string
  }
  
  export interface TrendData {
    year: number
    enrollment: number
    retention: number
  }
  