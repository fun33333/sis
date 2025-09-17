"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { List, UserPlus, Search, Filter, Users } from "lucide-react"
import Link from "next/link"

export default function StudentsPage() {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Student Management
        </CardTitle>
        <CardDescription>Manage all student records and information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search students..." className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/admin/students/add">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first student to the system.</p>
          <Link href="/admin/students/add">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
