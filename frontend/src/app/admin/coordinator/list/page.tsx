"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search } from "lucide-react"
import { getUsers } from "@/lib/api"

interface CoordinatorUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  campus_name?: string
  is_active: boolean
}

export default function CoordinatorListPage() {
  useEffect(() => {
    document.title = "Coordinator List - Coordinator | IAK SMS"
  }, [])

  const [search, setSearch] = useState("")
  const [coordinators, setCoordinators] = useState<CoordinatorUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getUsers("coordinator")
      setCoordinators(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return coordinators
    return coordinators.filter(u =>
      (u.first_name || "").toLowerCase().includes(q) ||
      (u.last_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.campus_name || "").toLowerCase().includes(q)
    )
  }, [search, coordinators])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Coordinator List</h1>
          <p className="text-gray-600">All coordinators across campuses</p>
        </div>
        <Badge style={{ backgroundColor: '#6096ba', color: 'white' }} className="px-4 py-2">
          {filtered.length} Coordinators
        </Badge>
      </div>

      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, campus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              style={{ borderColor: '#a3cef1' }}
            />
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Coordinators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading coordinators...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#274c77' }}>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Username</TableHead>
                  <TableHead className="text-white">Campus</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u, index) => (
                  <TableRow key={u.id} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }} className="cursor-pointer hover:bg-[#a3cef1] transition" onClick={() => router.push(`/admin/coordinator`)}>
                    <TableCell className="font-medium">{`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.campus_name || '—'}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: u.is_active ? '#6096ba' : '#8b8c89', color: 'white' }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


