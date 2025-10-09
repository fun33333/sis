import type { ChartData, TrendData } from "@/types/dashboard"

// Stable color by label
const colorFor = (label: string) => `hsl(${Array.from(label).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 360}, 70%, 55%)`

export function getMotherTongueDistribution(students: any[]): ChartData[] {
  const norm = (s: any) => (s ?? "").toString().trim()
  const distribution = (students || []).reduce(
    (acc: Record<string, number>, student: any) => {
      const key = norm(student.motherTongue)
      if (!key || key === "" || key.toLowerCase() === "unknown") {
        acc["Others"] = (acc["Others"] || 0) + 1
        return acc
      }
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )cha ni 
  
  // Group languages with count < 10 into "Others"
  const result: ChartData[] = []
  let othersCount = 0
  
  Object.entries(distribution).forEach(([tongue, count]) => {
    if (count < 10) {
      othersCount += count
    } else {
      result.push({
        name: tongue,
        value: count,
        fill: colorFor(tongue),
      })
    }
  })
  
  // Add "Others" if there are any languages with count < 10
  if (othersCount > 0) {
    result.push({
      name: "Others",
      value: othersCount,
      fill: colorFor("Others"),
    })
  }
  
  return result
}

export function getReligionDistribution(students: any[]): ChartData[] {
  const distribution = (students || []).reduce(
    (acc: Record<string, number>, student: any) => {
      const key = (student.religion ?? "").toString().trim()
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  return Object.entries(distribution).map(([religion, count]) => ({
    name: religion,
    value: count,
    fill: colorFor(religion),
  }))
}

export function getGradeDistribution(students: any[]): ChartData[] {
  const distribution = (students || []).reduce(
    (acc: Record<string, number>, student: any) => {
      const key = (student.grade ?? "").toString().trim()
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(distribution).map(([grade, count]) => ({
    name: grade,
    value: count,
    fill: colorFor(grade),
  }))
}

export function getGenderDistribution(students: any[]): ChartData[] {
  const mapKey = (g: string = "") => g.trim()
  const distribution = (students || []).reduce(
    (acc: Record<string, number>, student: any) => {
      const g = mapKey((student.gender ?? "Unknown").toString())
      if (!g) return acc
      acc[g] = (acc[g] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(distribution).map(([gender, count]) => ({
    name: gender,
    value: count,
    fill: colorFor(gender),
  }))
}

export function getCampusPerformance(students: any[]): ChartData[] {
  const norm = (s: any) => (s ?? "").toString().trim()
  type Agg = { totalScore: number; count: number; display: string }
  const campusData = (students || []).reduce(
    (acc: Record<string, Agg>, student: any) => {
      const label = norm(student.campus)
      if (!label || label.toLowerCase() === "unknown") return acc
      const key = label.toLowerCase()
      if (!acc[key]) {
        acc[key] = { totalScore: 0, count: 0, display: label }
      }
      acc[key].totalScore += Number(student.averageScore || 0)
      acc[key].count += 1
      return acc
    },
    {} as Record<string, Agg>,
  )

  return Object.values(campusData).map(({ display, totalScore, count }) => ({
    name: display,
    value: count ? Math.round(totalScore / count) : 0,
    fill: colorFor(display),
  }))
}

export function getEnrollmentTrend(students: any[]): TrendData[] {
  const years = Array.from(new Set((students || [])
    .map((s: any) => Number(s.academicYear))
    .filter((y: any) => Number.isFinite(y)) as number[])).sort((a, b) => a - b)

  return years.map((year) => {
    const yearStudents = (students || []).filter((s: any) => Number(s.academicYear) === year)
    const retainedStudents = yearStudents.filter((s: any) => Boolean(s.retentionFlag))
    return {
      year,
      enrollment: yearStudents.length,
      retention: yearStudents.length ? Math.round((retainedStudents.length / yearStudents.length) * 100) : 0,
    }
  })
}


