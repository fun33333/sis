"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import type { Student } from "@/types/dashboard"
import { CAMPUSES, GRADES, ACADEMIC_YEARS } from "@/data/mockData"

export default function StudentListPage() {
  useEffect(() => {
    document.title = "Student List | IAK SMS";
  }, []);
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [campusFilter, setCampusFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      const res = await fetch("/csvjson.json")
      const data = await res.json()
      // Replace 'any' with Record<string, unknown> for item type
      const mapped: Student[] = data.map((item: Record<string, unknown>, idx: number) => {
        let academicYear = Number(item["Year of Admission"])
        if (isNaN(academicYear)) academicYear = 2025
        const attendancePercentage = Math.floor(Math.random() * 31) + 70
        const averageScore = Math.floor(Math.random() * 41) + 60
        const retentionFlag = Math.random() > 0.2
        let enrollmentDate = new Date()
        try {
          enrollmentDate = new Date(item["Timestamp"] as string)
        } catch { }
        return {
          studentId: `CSV${idx + 1}`,
          name: (item["Student Name"] as string) || "Unknown",
          academicYear,
          campus: (item["Campus"] as string) || "Unknown",
          grade: (item["Current Grade/Class"] as string) || "Unknown",
          gender: (item["Gender"] === "Male" || item["Gender"] === "Female") ? (item["Gender"] as string) : "Other",
          motherTongue: (item["Mother Tongue"] as string) || "Other",
          religion: (item["Religion"] as string) || "Other",
          attendancePercentage,
          averageScore,
          retentionFlag,
          enrollmentDate,
        }
      })
      setStudents(mapped)
      setLoading(false)
    }
    fetchStudents()
  }, [])

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (yearFilter !== "all" && String(s.academicYear) !== yearFilter) return false
      if (campusFilter !== "all" && s.campus !== campusFilter) return false
      if (gradeFilter !== "all" && s.grade !== gradeFilter) return false
      return true
    })
  }, [search, yearFilter, campusFilter, gradeFilter, students])

  if (loading) {
    return <div className="p-6 text-xl text-[#274c77]">Loading student data...</div>
  }
  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#274c77]">Student List</h1>
          <p className="text-[#8b8c89]">Search, filter and select students to manage profiles and actions.</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-[#6096ba] to-[#274c77] hover:from-[#274c77] hover:to-[#6096ba] text-white rounded-lg shadow-md"
            onClick={() => router.push('/students')}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-xl shadow-lg bg-[#e7ecef] text-black">
        <CardHeader className=" rounded-t-xl">
          <CardTitle className="text-xl">Filters</CardTitle>
          <CardDescription className="text-[#274c77]">Use search and filters together to narrow results</CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-black mb-2">Search by name</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students"
                className="bg-transparent border-2 border-[#274c77] text-black placeholder-[white] rounded-lg focus:ring-2 focus:ring-[#274c77]"
              />
            </div>
            <div>
              <Label className="text-black mb-2">Academic Year</Label>
              <Select value={yearFilter} onValueChange={(v) => setYearFilter(v)}>
                <SelectTrigger className="w-full border border-[#6096ba] text-[#274c77] bg-transparent rounded-lg">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#274c77] shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-black mb-2">Campus</Label>
              <Select value={campusFilter} onValueChange={(v) => setCampusFilter(v)}>
                <SelectTrigger className="w-full border border-[#6096ba] text-[#274c77] bg-transparent rounded-lg">
                  <SelectValue placeholder="All campuses" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#274c77] shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  {CAMPUSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-black mb-2">Grade</Label>
              <Select value={gradeFilter} onValueChange={(v) => setGradeFilter(v)}>
                <SelectTrigger className="w-full border border-[#6096ba] text-[#274c77] bg-transparent rounded-lg">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#274c77] shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-xl shadow-lg bg-white">
        <CardHeader className="rounded-t-xl">
          <CardTitle className="text-[#274c77] text-xl text-bold">Student Records</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-[#274c77] text-white hover:bg-[#274c77]">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">GR No</TableHead>
                <TableHead className="text-white">Campus</TableHead>
                <TableHead className="text-white">Class-Section</TableHead>
                <TableHead className="text-white">Shift</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, idx) => {
                const isActive = Math.random() > 0.2
                return (
                  <TableRow
                    key={s.studentId}
                    className={`cursor-pointer hover:bg-[#a3cef1]  transition ${idx % 2 === 0 ? "bg-[#e7ecef]" : "bg-white"
                      }`}
                    onClick={() => router.push(`/students/profile?studentId=${s.studentId}`)}
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>{s.campus}</TableCell>
                    <TableCell>{s.grade}</TableCell>
                    <TableCell>{Math.random() > 0.5 ? 'Morning' : 'Evening'}</TableCell>
                    <TableCell>
                      {isActive ? (
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-green-600/70 rounded-full shadow">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600/70 rounded-full shadow">
                          Not Active
                        </span>
                      )}

                    </TableCell>
                    <TableCell>0300-1234567</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}