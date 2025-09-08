import type { Student, ChartData, TrendData } from "@/types/dashboard"

// Campus configurations
export const CAMPUSES = [
  "Campus 1",
  "Campus 2",
  "Campus 3",
  "Campus 4",
  "Campus 5",
  "Campus 6",
  "Campus 7",
]

export const GRADES = [
  "Nursery",
  "Pre-K",
  "K",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "College",
]

export const ACADEMIC_YEARS = [2022, 2023, 2024]

// Generate realistic names
const FIRST_NAMES = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "William",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Harper",
  "Henry",
  "Evelyn",
  "Alexander",
  "Abigail",
  "Michael",
  "Emily",
  "Daniel",
  "Elizabeth",
  "Jacob",
  "Sofia",
  "Logan",
  "Avery",
  "Jackson",
]

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
]

// Generate mock student data
function generateMockStudents(count = 1500): Student[] {
  const students: Student[] = []

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    const academicYear = ACADEMIC_YEARS[Math.floor(Math.random() * ACADEMIC_YEARS.length)]
    const campus = CAMPUSES[Math.floor(Math.random() * CAMPUSES.length)]
    const grade = GRADES[Math.floor(Math.random() * GRADES.length)]
    const gender = Math.random() < 0.48 ? "Female" : Math.random() < 0.96 ? "Male" : "Other"

    // Generate realistic attendance (70-100%)
    const attendancePercentage = Math.round(70 + Math.random() * 30)

    // Generate realistic scores (60-100, with some correlation to attendance)
    const baseScore = 60 + (attendancePercentage - 70) * 0.8 + Math.random() * 20
    const averageScore = Math.round(Math.min(100, Math.max(60, baseScore)))

    // Retention flag (higher for better students)
    const retentionFlag = averageScore > 75 && attendancePercentage > 80 ? Math.random() > 0.1 : Math.random() > 0.3

    // Generate enrollment date within academic year
    const enrollmentDate = new Date(academicYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)

    students.push({
      studentId: `STU${String(i + 1).padStart(4, "0")}`,
      name: `${firstName} ${lastName}`,
      academicYear,
      campus,
      grade,
      gender,
      attendancePercentage,
      averageScore,
      retentionFlag,
      enrollmentDate,
    })
  }

  return students
}

export const mockStudents = generateMockStudents()

// Generate chart data for grade distribution
export function getGradeDistribution(students: Student[]): ChartData[] {
  const distribution = students.reduce(
    (acc, student) => {
      acc[student.grade] = (acc[student.grade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(distribution).map(([grade, count]) => ({
    name: grade,
    value: count,
    fill: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  }))
}

// Generate chart data for gender distribution
export function getGenderDistribution(students: Student[]): ChartData[] {
  const distribution = students.reduce(
    (acc, student) => {
      acc[student.gender] = (acc[student.gender] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const colors = {
    Male: "hsl(210, 70%, 50%)",
    Female: "hsl(330, 70%, 50%)",
    Other: "hsl(60, 70%, 50%)",
  }

  return Object.entries(distribution).map(([gender, count]) => ({
    name: gender,
    value: count,
    fill: colors[gender as keyof typeof colors],
  }))
}

// Generate campus performance data
export function getCampusPerformance(students: Student[]): ChartData[] {
  const campusData = students.reduce(
    (acc, student) => {
      if (!acc[student.campus]) {
        acc[student.campus] = { totalScore: 0, count: 0 }
      }
      acc[student.campus].totalScore += student.averageScore
      acc[student.campus].count += 1
      return acc
    },
    {} as Record<string, { totalScore: number; count: number }>,
  )

  return Object.entries(campusData).map(([campus, data]) => ({
    name: campus,
    value: Math.round(data.totalScore / data.count),
    fill: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  }))
}

// Generate enrollment trend data
export function getEnrollmentTrend(students: Student[]): TrendData[] {
  const trendData = ACADEMIC_YEARS.map((year) => {
    const yearStudents = students.filter((s) => s.academicYear === year)
    const retainedStudents = yearStudents.filter((s) => s.retentionFlag)

    return {
      year,
      enrollment: yearStudents.length,
      retention: Math.round((retainedStudents.length / yearStudents.length) * 100),
    }
  })

  return trendData
}
