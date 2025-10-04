"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiGet, apiPatch } from "@/lib/api"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Mail, Users, Building, Calendar, BookOpen, Wifi, Zap, Library, GraduationCap, UserCheck, Clock } from "lucide-react"

export default function AdminCampusProfilePage() {
  const params = useSearchParams()
  const id = params?.get("id") || params?.get("pk") || ""

  const [campus, setCampus] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    setLoading(true)
    apiGet<any>(`/api/campus/${id}/`)
      .then((data) => mounted && setCampus(data))
      .catch((err) => {
        console.error(err)
        mounted && setError(err.message || "Failed to load campus")
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (campus?.campus_name || campus?.name) {
      document.title = `${campus.campus_name || campus.name} | Campus Profile`
    }
  }, [campus])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const uStr = window.localStorage.getItem('sis_user')
        if (uStr) {
          const u = JSON.parse(uStr)
          const role = String(u?.role || '').toLowerCase()
          setCanEdit(role.includes('princ') || role.includes('admin'))
        }
      } catch {}
    }
  }, [])

  if (!id) {
    return <div className="p-6">No campus selected</div>
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading campus...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-600 mb-4">Error: {error}</div>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  )

  const renderValue = (v: any) => {
    if (v === null || v === undefined || String(v).trim() === "") return '—'
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (Array.isArray(v)) return v.join(', ')
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const EditForm = ({ onSaved, onClose }: { onSaved: (updated: any) => void; onClose: () => void }) => {
    const methods = useForm<any>({ defaultValues: campus || {} })

    useEffect(() => {
      methods.reset(campus || {})
    }, [campus])

    const onSubmit = methods.handleSubmit(async (values) => {
      try {
        const updated = await apiPatch<any>(`/api/campus/${id}/`, values)
        onSaved(updated)
        onClose()
      } catch (err: any) {
        console.error(err)
        alert(err?.message || "Failed to update campus")
      }
    })

    return (
      <Form {...methods}>
        <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Campus Name</FormLabel>
              <FormControl>
                <Input {...methods.register("campus_name")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Campus Code</FormLabel>
              <FormControl>
                <Input {...methods.register("campus_code")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...methods.register("city")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input {...methods.register("postal_code")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Primary Phone</FormLabel>
              <FormControl>
                <Input {...methods.register("primary_phone")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Official Email</FormLabel>
              <FormControl>
                <Input {...methods.register("official_email")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Campus Head Name</FormLabel>
              <FormControl>
                <Input {...methods.register("campus_head_name")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Student Capacity</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("student_capacity")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Total Students</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("total_students")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Total Teachers</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("total_teachers")} />
              </FormControl>
            </FormItem>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600">
            {campus?.photo ? (
              <img src={campus.photo} alt="campus banner" className="w-full h-full object-cover" />
            ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {campus?.campus_name || campus?.name || 'Campus'}
            </div>
            )}
          </div>

        {/* Overlay with campus info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex items-end gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {campus?.photo ? (
                <img src={campus.photo} alt="campus logo" className="w-full h-full rounded-full object-cover" />
                  ) : (
                <Building className="w-10 h-10 text-blue-600" />
                  )}
                </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{campus?.campus_name || campus?.name || 'Campus'}</h1>
              <p className="text-lg opacity-90">{campus?.city || 'City'}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {campus?.status || 'Active'}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {campus?.campus_type || 'Main'}
                </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Edit Button */}
      {canEdit && (
        <div className="p-6 pb-0">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserCheck className="w-4 h-4 mr-2" />
                Edit Campus
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Campus Information</DialogTitle>
              </DialogHeader>
              <EditForm
                onSaved={(updated: any) => setCampus(updated)}
                onClose={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Campus Name</label>
                      <p className="text-lg font-semibold">{campus?.campus_name || campus?.name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Campus Code</label>
                      <p className="text-lg font-semibold">{campus?.campus_code || campus?.code || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Campus ID</label>
                      <p className="text-lg font-semibold">{campus?.campus_id || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Governing Body</label>
                      <p className="text-lg font-semibold">{campus?.governing_body || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Number</label>
                      <p className="text-lg font-semibold">{campus?.registration_number || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Accreditation</label>
                      <p className="text-lg font-semibold">{campus?.accreditation || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Established Year</label>
                      <p className="text-lg font-semibold">{campus?.established_year || '—'}</p>
                    </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Instruction Language</label>
                      <p className="text-lg font-semibold">{campus?.instruction_language || '—'}</p>
                    </div>
                  </div>
              </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Address</label>
                      <p className="text-lg font-semibold">{campus?.address_full || campus?.address || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p className="text-lg font-semibold">{campus?.city || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">District</label>
                      <p className="text-lg font-semibold">{campus?.district || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Postal Code</label>
                      <p className="text-lg font-semibold">{campus?.postal_code || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Primary Phone</label>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {campus?.primary_phone || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Secondary Phone</label>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {campus?.secondary_phone || '—'}
                      </p>
                    </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Official Email</label>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {campus?.official_email || '—'}
                      </p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Campus Head</label>
                      <p className="text-lg font-semibold">{campus?.campus_head_name || '—'}</p>
              </div>
            </div>
          </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
              <div>
                      <label className="text-sm font-medium text-gray-500">Academic Year Start</label>
                      <p className="text-lg font-semibold">{formatDate(campus?.academic_year_start) || '—'}</p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Academic Year End</label>
                      <p className="text-lg font-semibold">{formatDate(campus?.academic_year_end) || '—'}</p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Grades Available</label>
                      <p className="text-lg font-semibold">{campus?.grades_available || '—'}</p>
              </div>
            </div>
                  <div className="space-y-4">
              <div>
                      <label className="text-sm font-medium text-gray-500">Student Capacity</label>
                      <p className="text-lg font-semibold">{campus?.student_capacity || '—'}</p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Current Enrollment</label>
                      <p className="text-lg font-semibold">{campus?.total_students || '—'}</p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Enrollment Rate</label>
                      <p className="text-lg font-semibold">
                        {campus?.student_capacity && campus?.total_students 
                          ? `${Math.round((campus.total_students / campus.student_capacity) * 100)}%`
                          : '—'
                        }
                      </p>
              </div>
            </div>
          </div>
              </CardContent>
            </Card>

            {/* Infrastructure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Infrastructure & Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Classrooms</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Classrooms</label>
                      <p className="text-lg font-semibold">{campus?.total_classrooms || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Office Rooms</label>
                      <p className="text-lg font-semibold">{campus?.office_rooms || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Rooms</label>
                      <p className="text-lg font-semibold">{campus?.num_rooms || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Labs</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Science Labs</label>
                      <p className="text-lg font-semibold">{campus?.num_science_labs || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Computer Labs</label>
                      <p className="text-lg font-semibold">{campus?.num_computer_labs || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Washrooms</h4>
              <div>
                      <label className="text-sm font-medium text-gray-500">Male Student</label>
                      <p className="text-lg font-semibold">{campus?.male_student_washrooms || '—'}</p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Female Student</label>
                      <p className="text-lg font-semibold">{campus?.female_student_washrooms || '—'}</p>
              </div>
              <div>
                      <label className="text-sm font-medium text-gray-500">Staff</label>
                      <p className="text-lg font-semibold">{campus?.staff_washrooms || '—'}</p>
              </div>
            </div>
          </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Info */}
          <div className="space-y-6">
            {/* Student Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Student Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Students</span>
                  <span className="text-2xl font-bold text-blue-600">{campus?.total_students || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Male Students</span>
                  <span className="text-lg font-semibold">{campus?.male_students || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Female Students</span>
                  <span className="text-lg font-semibold">{campus?.female_students || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Capacity</span>
                  <span className="text-lg font-semibold">{campus?.student_capacity || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${campus?.student_capacity && campus?.total_students 
                        ? Math.min((campus.total_students / campus.student_capacity) * 100, 100)
                        : 0
                      }%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Staff Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Teachers</span>
                  <span className="text-2xl font-bold text-green-600">{campus?.total_teachers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Male Teachers</span>
                  <span className="text-lg font-semibold">{campus?.male_teachers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Female Teachers</span>
                  <span className="text-lg font-semibold">{campus?.female_teachers || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Non-teaching Staff</span>
                  <span className="text-lg font-semibold">{campus?.total_non_teaching_staff || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="w-5 h-5" />
                  Facilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Library</span>
                  <Badge variant={campus?.library_available ? "default" : "secondary"}>
                    {campus?.library_available ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Internet/WiFi</span>
                  <Badge variant={campus?.internet_available ? "default" : "secondary"}>
                    {campus?.internet_available ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Power Backup</span>
                  <Badge variant={campus?.power_backup ? "default" : "secondary"}>
                    {campus?.power_backup ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Campus Status</span>
                    <Badge variant={campus?.status === 'active' ? "default" : "secondary"}>
                      {campus?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Campus Type</span>
                    <Badge variant="outline">
                      {campus?.campus_type || 'Main'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Draft Status</span>
                    <Badge variant={campus?.is_draft ? "secondary" : "default"}>
                      {campus?.is_draft ? "Draft" : "Published"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </div>
    </div>
  )
}
