"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CAMPUSES, mockStudents, getCampusPerformance } from "@/data/mockData"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react";





export default function CampusListPage() {

  useEffect(() => {
    document.title = "Campus List | IAK SMS";
  }, []);

  const [query, setQuery] = React.useState("")
  const filtered = CAMPUSES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))


  const campusPerformance = React.useMemo(() => getCampusPerformance(mockStudents), [])

  const getCampusMetric = (campus: string) => {
    const studentCount = mockStudents.filter((s) => s.campus === campus).length
    const perf = campusPerformance.find((p) => p.name === campus)
    const avgScore = perf ? perf.value : 0
    return { studentCount, avgScore }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campus List</h1>
          <p className="text-sm text-muted-foreground">Manage campuses, profiles and quick actions</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campuses..."
            className="px-3 py-2 border rounded-md w-64 focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => {
          const { studentCount, avgScore } = getCampusMetric(c)
          return (
            <Card key={c} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold">{String(i + 1)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{c}</div>
                        <div className="text-sm text-muted-foreground">Code: C{String(i + 1).padStart(2, "0")}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Campus</Badge>
                        <Badge className="bg-green-50 text-green-700">Active</Badge>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 items-center">
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">Students</div>
                        <div className="font-medium">{studentCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Avg Score</div>
                        <div className="w-full">
                          <Progress value={avgScore} className="h-2 rounded-full" />
                          <div className="text-xs text-muted-foreground mt-1">{avgScore}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Link href={`/campus/profile?name=${encodeURIComponent(c)}`}>
                        <Button size="sm">Open</Button>
                      </Link>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
