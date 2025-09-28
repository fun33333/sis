"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// mock data removed; using real API data only
import { apiGet } from "@/lib/api"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react";





export default function CampusListPage() {

  useEffect(() => {
    document.title = "Campus List | IAK SMS";
  }, []);

  const [query, setQuery] = React.useState("")
  const [campuses, setCampuses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const filtered = campuses.filter((c) => c.name?.toLowerCase().includes(query.toLowerCase()))

  // metrics from API data only (fallbacks to 0 for avg score)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet<any[]>("/api/campus/")
      .then((data) => {
        if (!mounted) return
        setCampuses(data)
      })
      .catch((err) => {
        console.error(err)
        if (!mounted) return
        setError(err.message || "Failed to load campuses")
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

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
            aria-label="Search campuses"
          />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs text-muted-foreground border-b">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Campus</div>
          <div className="col-span-2 text-center">Students</div>
          <div className="col-span-2 text-center">Avg Score</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {loading ? (
          <div className="p-6">Loading campuses...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-muted-foreground">No campuses found</div>
        ) : (
          <div>
            {filtered.map((c, i) => {
              const studentCount = typeof c.num_students === 'number' ? c.num_students : 0
              const avgScore = 0
              return (
                <Link
                  key={c.id}
                  href={`/admin/campus/profile?id=${encodeURIComponent(String(c.id))}`}
                  className="group border-b last:border-b-0 hover:bg-slate-50 block"
                  aria-label={`Open campus ${c.name}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center px-4 py-4">
                    <div className="col-span-1 flex items-center">
                      <div className="w-9 h-9 rounded-full bg-primary/5 text-primary font-semibold flex items-center justify-center">{String(i + 1)}</div>
                    </div>

                    <div className="col-span-5">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">Code: {c.code || `C${String(i + 1).padStart(2, "0")}`}{c.campus_address ? ` • ${c.campus_address}` : ''}</div>
                    </div>

                    <div className="col-span-2 text-center">
                      <div className="font-medium">{c.num_students ?? studentCount}</div>
                    </div>

                    <div className="col-span-2">
                      <div className="w-full max-w-xs mx-auto">
                        <Progress value={avgScore} className="h-2 rounded-full" />
                        <div className="text-xs text-muted-foreground mt-1 text-center">{avgScore}%</div>
                      </div>
                    </div>

                    <div className="col-span-1 text-center">
                      <Badge className={`${c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-800'}`}>{c.status || '—'}</Badge>
                    </div>

                    <div className="col-span-1 text-right flex justify-end items-center">
                      <span className="text-muted-foreground">›</span>
                    </div>

                    {/* Mobile compact view */}
                    <div className="col-span-12 md:hidden mt-2 px-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">Students: <span className="font-medium">{c.num_students ?? studentCount}</span></div>
                        <div className="text-xs text-muted-foreground">Avg: <span className="font-medium">{avgScore}%</span></div>
                        <div className="text-xs text-muted-foreground">Status: <span className="font-medium">{c.status || '—'}</span></div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
