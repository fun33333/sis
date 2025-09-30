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
import { getAllStudents, getAllCampuses } from "@/lib/api"

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
  const [campuses, setCampuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherClass, setTeacherClass] = useState<string | null>(null)

  useEffect(() => {
    // Check if teacher is logged in
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "teacher" && user.class) {
            setTeacherClass(user.class);
          }
        } catch {}
      }
    }
    async function fetchStudents() {
      setLoading(true);
      try {
        const [data, campusList] = await Promise.all([
          getAllStudents(),
          getAllCampuses(),
        ])
        setStudents(Array.isArray(data) ? data : []);
        const clist = Array.isArray(campusList) ? campusList : (Array.isArray((campusList as any)?.results) ? (campusList as any).results : [])
        setCampuses(clist)
      } catch (err) {
        setStudents([]);
        setCampuses([])
      }
      setLoading(false);
    }
    fetchStudents();
  }, [])
  const academicYearOptions = useMemo(() => {
    const yearsArray = Array.from(new Set(students.map((s) => Number(String(s.created_at ?? "").split('-')[0]))))
      .filter((y): y is number => Number.isFinite(y))
      .sort((a: number, b: number) => a - b)
    return yearsArray
  }, [students])

  const getCampusName = (s: any): string => {
    const c = s?.campus
    if (!c) return ""
    // Object with name
    if (typeof c === 'object' && c !== null) return String(c.name || "").trim()
    // Numeric id → map from campuses list
    if (typeof c === 'number') {
      const hit = campuses.find((x: any) => String(x.id) === String(c))
      return String(hit?.name || c).trim()
    }
    // Fallback string
    return String(c).trim()
  }

  const campusOptions = useMemo((): string[] => {
    const arr = Array.from(new Set(students.map((s) => getCampusName(s))))
      .filter(Boolean) as string[]
    return arr.sort()
  }, [students])

  const gradeOptions = useMemo((): string[] => {
    const arr = Array.from(new Set(students.map((s) => String(s.current_grade ?? "").trim())))
      .filter(Boolean) as string[]
    return arr.sort()
  }, [students])


  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (teacherClass && s.current_grade !== teacherClass) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (yearFilter !== "all" && String(s.created_at?.split('-')[0]) !== yearFilter) return false
      if (campusFilter !== "all" && getCampusName(s) !== campusFilter) return false
      if (gradeFilter !== "all" && s.current_grade !== gradeFilter) return false
      return true
    })
  }, [search, yearFilter, campusFilter, gradeFilter, students, teacherClass])

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
                  {academicYearOptions.map((y) => (
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
                  {campusOptions.map((c) => (
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
                  {gradeOptions.map((g) => (
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
                const statusRaw = (s as any).current_state || ""
                const isActive = String(statusRaw).toLowerCase() === "active"
                const contact =
                  (s as any).emergency_contact ||
                  (s as any).father_contact ||
                  (s as any).guardian_phone ||
                  (s as any).mother_contact ||
                  ""
                const classSection = [s.current_grade, (s as any).section].filter(Boolean).join("-")
                const shift = (s as any).shift || ""
                return (
                  <TableRow
                    key={s.id || idx}
                    className={`cursor-pointer hover:bg-[#a3cef1]  transition ${idx % 2 === 0 ? "bg-[#e7ecef]" : "bg-white"
                      }`}
                    onClick={() => router.push(`/admin/students/profile?studentId=${s.id}`)}
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.gr_no || 'N/A'}</TableCell>
                    <TableCell>{getCampusName(s) || 'N/A'}</TableCell>
                    <TableCell>{classSection || 'N/A'}</TableCell>
                    <TableCell>{shift || 'N/A'}</TableCell>
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
                    <TableCell>{contact || 'N/A'}</TableCell>
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