
"use client"

import { ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, LabelList } from "recharts"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Student } from "@/types/dashboard"


export default function StudentProfilePage() {
  const router = useRouter()
  const params = useSearchParams()
  const studentId = params?.get("studentId") || ""
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      const res = await fetch("/csvjson.json")
      const data = await res.json()
      const mapped: Student[] = data.map((item: any, idx: number) => {
        let academicYear = Number(item["Year of Admission"])
        if (isNaN(academicYear)) academicYear = 2025
        let attendancePercentage = Math.floor(Math.random() * 31) + 70 // 70-100
        let averageScore = Math.floor(Math.random() * 41) + 60 // 60-100
        let retentionFlag = Math.random() > 0.2
        let enrollmentDate = new Date()
        try {
          enrollmentDate = new Date(item["Timestamp"])
        } catch { }
        return {
          studentId: `CSV${idx + 1}`,
          name: item["Student Name"] || "Unknown",
          academicYear,
          campus: item["Campus"] || "Unknown",
          grade: item["Current Grade/Class"] || "Unknown",
          gender: item["Gender"] === "Male" || item["Gender"] === "Female" ? item["Gender"] : "Other",
          motherTongue: item["Mother Tongue"] || "Other",
          religion: item["Religion"] || "Other",
          attendancePercentage,
          averageScore,
          retentionFlag,
          enrollmentDate,
          rawData: item,
        }
      })
      setStudents(mapped)
      setLoading(false)
    }
    fetchStudents()
  }, [])


  const student = useMemo(() => students.find((s) => s.studentId === studentId), [studentId, students])

  if (loading) {
    return <div className="p-6 text-lg">Loading student data...</div>
  }
  if (!student) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Student not found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No student found for the given ID.</div>
            <div className="mt-4">
              <Button onClick={() => router.back()}>Go back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


  // Only run this after student is defined
  const gradeBySubject = student ? ["Science", "Maths", "English", "Physics", "Arts"].map((s, idx) => ({
    name: s,
    value: Math.max(50, Math.min(100, student.averageScore - idx * 3)),
    fill: idx % 2 === 0 ? '#0b6b58' : '#16a34a'
  })) : []

  const suspensionRate = Math.max(0, Math.round((100 - student.attendancePercentage) * 0.25))
  const participationRate = Math.min(100, student.attendancePercentage + 5)

  function Gauge({ value, size = 180, colors = ['#f97316', '#facc15', '#06b6d4'] }: { value: number; size?: number; colors?: string[] }) {
    const radius = size / 2
    const stroke = 14
    const circumference = Math.PI * (radius - stroke / 2)
    const pct = Math.max(0, Math.min(100, value))
    const dash = (pct / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
          <defs>
            <linearGradient id={`grad-${value}`} x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1]} />
              <stop offset="100%" stopColor={colors[2]} />
            </linearGradient>
          </defs>
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <path d={`M ${-radius + stroke / 2} 0 A ${radius - stroke / 2} ${radius - stroke / 2} 0 0 1 ${radius - stroke / 2} 0`} fill="none" stroke="#eee" strokeWidth={stroke} strokeLinecap="round" />
            <path d={`M ${-radius + stroke / 2} 0 A ${radius - stroke / 2} ${radius - stroke / 2} 0 0 1 ${radius - stroke / 2} 0`} fill="none" stroke={`url(#grad-${value})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} />
          </g>
        </svg>
        <div className="mt-2 text-2xl font-semibold">{value}%</div>
      </div>
    )
  }


  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Student Profile Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <Card>
            <CardContent>
              <div className="mb-2 text-sm font-medium">Student Name</div>
              <Select value={student.studentId} onValueChange={(v) => router.push(`/students/profile?studentId=${v}`)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.slice(0, 200).map((st) => (
                    <SelectItem key={st.studentId} value={st.studentId}>{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="mt-4">
            <div className="bg-white rounded shadow overflow-hidden">
              <img
                src="/student-profile.jpg"
                alt={student.name}
                className="w-full h-96 object-cover rounded-xl shadow"
              />            </div>
          </div>
        </aside>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                </TabsList>
                <TabsContent value="personal">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <tbody>
                        <tr className="border-t"><td className="w-1/3 p-4 font-semibold">Student ID</td><td className="p-4">{student.studentId.replace(/^STU/, '')}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Full Name</td><td className="p-4">{student.name}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Gender</td><td className="p-4">{student.gender}</td></tr>
                        <tr className="border-t"><td className="w-1/3 p-4 font-semibold">Date of Birth</td><td className="p-4">{student.rawData?.['Date of Birth'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Place of Birth</td><td className="p-4">{student.rawData?.['Place of Birth'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Mother Tongue</td><td className="p-4">{student.motherTongue}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Nationality</td><td className="p-4">Local</td></tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="contact">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <tbody>
                        <tr className="border-t"><td className="w-1/3 p-4 font-semibold">Father Name</td><td className="p-4">{student.rawData?.['Father Name'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Father CNIC</td><td className="p-4">{student.rawData?.['Father CNIC'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Father Contact</td><td className="p-4">{student.rawData?.['Father Contact Number'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Mother Name</td><td className="p-4">{student.rawData?.['Mother Name'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Mother CNIC</td><td className="p-4">{student.rawData?.['Mother CNIC'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Mother Occupation</td><td className="p-4">{student.rawData?.['Mother Occupation'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Mother Contact</td><td className="p-4">{student.rawData?.['Mother Contact Number'] || '-'}</td></tr>

                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="academic">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <tbody>
                        <tr className="border-t"><td className="w-1/3 p-4 font-semibold">Grade</td><td className="p-4">{student.grade}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Academic Year</td><td className="p-4">{student.academicYear}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Attendance %</td><td className="p-4">{student.attendancePercentage}%</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Average Score</td><td className="p-4">{student.averageScore}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Retention Status</td><td className="p-4">{student.retentionFlag ? 'Retained' : 'Not Retained'}</td></tr>
                        <tr className="border-t"><td className="w-1/3 p-4 font-semibold">Family Income</td><td className="p-4">{student.rawData?.['Family Income'] || '-'}</td></tr>
                        <tr className="border-t"><td className="p-4 font-semibold">Section</td><td className="p-4">{student.rawData?.['Section'] || '-'}</td></tr>

                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="text-sm text-muted-foreground">...</div>
            </CardHeader>
            <CardContent />
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={gradeBySubject} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="value" position="insideTop" formatter={(val: any) => `${String(val)}%`} />
                      {gradeBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Activities by Medals Awarded</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={gradeBySubject} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#059669">
                      <LabelList dataKey="value" position="right" formatter={(v: any) => String(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Student Suspension Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <Gauge value={suspensionRate} colors={["#f97316", "#facc15", "#34d399"]} />
              </div>
              <div className="text-center text-sm text-muted-foreground">Overall suspension (lower is better)</div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Class Participation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <Gauge value={participationRate} colors={["#06b6d4", "#facc15", "#10b981"]} />
              </div>
              <div className="text-center text-sm text-muted-foreground">Participation trend</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
