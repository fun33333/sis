"use client"

import Link from "next/link"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockTeachers = [
  { id: "TEA001", name: "Aisha Khan", subject: "Mathematics", email: "aisha.khan@example.com" },
  { id: "TEA002", name: "Bilal Ahmed", subject: "Science", email: "bilal.ahmed@example.com" },
  { id: "TEA003", name: "Sara Ali", subject: "English", email: "sara.ali@example.com" },
  { id: "TEA004", name: "Omar Farooq", subject: "History", email: "omar.farooq@example.com" },
]

export default function TeacherListPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teacher List</h1>

      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
          <CardDescription>Browse and open teacher profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTeachers.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.subject} • {t.email}</div>
              </div>
              <div>
                <Link href={`/teachers/profile?id=${encodeURIComponent(t.id)}`}>
                  <Button size="sm">Open</Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
