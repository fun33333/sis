"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

const mockTeachers = [
  { id: "TEA001", name: "Aisha Khan", subject: "Mathematics", email: "aisha.khan@example.com", campus: "Campus 1", totalYears: 5, classes: ["5-A","6-B"], responsibilities: "Class teacher, Exam coordinator", rating: 92 },
  { id: "TEA002", name: "Bilal Ahmed", subject: "Science", email: "bilal.ahmed@example.com", campus: "Campus 2", totalYears: 8, classes: ["7-A","8-A"], responsibilities: "Lab in-charge", rating: 88 },
  { id: "TEA003", name: "Sara Ali", subject: "English", email: "sara.ali@example.com", campus: "Campus 1", totalYears: 3, classes: ["3-B","4-A"], responsibilities: "Debate coach", rating: 84 },
]

import { useEffect } from "react";

export default function TeacherProfilePage() {
  useEffect(() => {
    document.title = "Teacher Profile | IAK SMS";
  }, []);
  const router = useRouter()
  const params = useSearchParams()
  const id = params?.get("id") || "TEA001"

  const teacher = useMemo(() => mockTeachers.find((t) => t.id === id), [id])

  if (!teacher) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Teacher not found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No teacher found for the given ID.</div>
            <div className="mt-4">
              <Button onClick={() => router.back()}>Go back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const performance = [
    { name: 'Term 1', score: Math.max(60, teacher.rating - 6) },
    { name: 'Term 2', score: teacher.rating },
    { name: 'Term 3', score: Math.min(100, teacher.rating + 3) },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Teacher Profile</h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <Card>
            <CardContent>
              <div className="mb-2 text-sm font-medium">{teacher.name}</div>
              <div className="text-sm text-muted-foreground">{teacher.subject} • {teacher.campus}</div>

              <div className="mt-4">
                <img src={`https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=60`} alt={teacher.name} className="w-full h-64 object-cover rounded" />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div><strong>Email:</strong> {teacher.email}</div>
                <div><strong>Years:</strong> {teacher.totalYears}</div>
                <div><strong>Classes:</strong> {teacher.classes.join(', ')}</div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-9">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="text-sm text-muted-foreground">Rating: {teacher.rating}%</div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded shadow">
                    <div className="text-sm text-muted-foreground">Avg Student Rating</div>
                    <div className="text-2xl font-semibold">{teacher.rating}%</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded shadow">
                    <div className="text-sm text-muted-foreground">Years</div>
                    <div className="text-2xl font-semibold">{teacher.totalYears}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded shadow">
                    <div className="text-sm text-muted-foreground">Classes</div>
                    <div className="text-2xl font-semibold">{teacher.classes.length}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{teacher.responsibilities}</p>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Recent Performance</h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={performance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#4f46e5">
                          {performance.map((p, i) => (
                            <Cell key={i} fill={i === performance.length - 1 ? '#06b6d4' : '#4f46e5'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
