"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { mockStudents, CAMPUSES, GRADES, ACADEMIC_YEARS } from "@/data/mockData"

export default function StudentListPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  // use a non-empty special value for the "All" option because Select items
  // must not have an empty-string value (the Select uses empty string to
  // represent a cleared value internally). Use "all" as the sentinel.
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [campusFilter, setCampusFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")

  // Filtered students based on search + filters
  const filtered = useMemo(() => {
    return mockStudents.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      // Only apply each filter when it's not the sentinel "all" value
      if (yearFilter !== "all" && String(s.academicYear) !== yearFilter) return false
      if (campusFilter !== "all" && s.campus !== campusFilter) return false
      if (gradeFilter !== "all" && s.grade !== gradeFilter) return false
      return true
    })
  }, [search, yearFilter, campusFilter, gradeFilter])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student List</h1>
          <p className="text-muted-foreground">Search, filter and select students to manage profiles and actions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/students')}>Refresh</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Use search and filters together to narrow results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search by name</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students" />
            </div>
            <div>
              <Label>Academic Year</Label>
              <Select value={yearFilter} onValueChange={(v) => setYearFilter(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Campus</Label>
              <Select value={campusFilter} onValueChange={(v) => setCampusFilter(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All campuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {CAMPUSES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={gradeFilter} onValueChange={(v) => setGradeFilter(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
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

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>GR No</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Class-Section</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.studentId} className="cursor-pointer" onClick={() => router.push(`/students/profile?studentId=${s.studentId}`)}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.studentId}</TableCell>
                  <TableCell>{s.campus}</TableCell>
                  <TableCell>{s.grade}</TableCell>
                  <TableCell>{Math.random() > 0.5 ? 'Morning' : 'Evening'}</TableCell>
                  <TableCell>{Math.random() > 0.2 ? 'Active' : 'Not Active'}</TableCell>
                  <TableCell>0300-1234567</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
