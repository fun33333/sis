"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiGet, apiPatch } from "@/lib/api"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form"
import { useForm } from "react-hook-form"

export default function AdminCampusProfilePage() {
  const params = useSearchParams()
  const id = params?.get("id") || params?.get("pk") || ""

  const [campus, setCampus] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview')
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
    if (campus?.name) document.title = `${campus.name} | Campus Profile`
  }, [campus])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const uStr = window.localStorage.getItem('sis_user')
        if (uStr) {
          const u = JSON.parse(uStr)
          const role = String(u?.role || '').toLowerCase()
          setCanEdit(role.includes('princ'))
        }
      } catch {}
    }
  }, [])

  if (!id) {
    return <div className="p-6">No campus selected</div>
  }

  if (loading) return <div className="p-6">Loading campus...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const fmtMonth = (m: any) => {
    const n = Number(m)
    if (!n || n < 1 || n > 12) return '—'
    return monthNames[n - 1]
  }

  const renderValue = (v: any) => {
    if (v === null || v === undefined || String(v).trim() === "") return '—'
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (Array.isArray(v)) return v.join(', ')
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }

  const EditForm = ({ onSaved, onClose }: { onSaved: (updated: any) => void; onClose: () => void }) => {
    const methods = useForm<any>({ defaultValues: campus || {} })

    useEffect(() => {
      methods.reset(campus || {})
    }, [campus])

    const onSubmit = methods.handleSubmit(async (values) => {
      try {
        // send values directly (API expects snake_case keys)
        const updated = await apiPatch<any>(`/api/campus/${id}/`, values)
        onSaved(updated)
        onClose()
      } catch (err: any) {
        console.error(err)
        alert(err?.message || "Failed to update campus")
      }
    })

    return (
      ///Edit Form Forntend Form Code

      <Form {...methods}>
        <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-auto pr-2">
          <h3 className="text-lg font-semibold">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...methods.register("name")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...methods.register("code")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Governing Body</FormLabel>
              <FormControl>
                <Input {...methods.register("governing_body")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Registration No</FormLabel>
              <FormControl>
                <Input {...methods.register("registration_no")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...methods.register("address")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Campus Address</FormLabel>
              <FormControl>
                <Input {...methods.register("campus_address")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Grades Offered</FormLabel>
              <FormControl>
                <Input {...methods.register("grades_offered")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Languages of Instruction</FormLabel>
              <FormControl>
                <Input {...methods.register("languages_of_instruction")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Academic Year Start Month</FormLabel>
              <FormControl>
                <Input {...methods.register("academic_year_start_month")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Established Date</FormLabel>
              <FormControl>
                <Input {...methods.register("established_date")} placeholder="YYYY-MM-DD" />
              </FormControl>
            </FormItem>
          </div>

          <h3 className="text-lg font-semibold mt-4">Facilities & Capacity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("capacity")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Total Classrooms</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("total_classrooms")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Office Rooms</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("office_rooms")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Computer Labs</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("computer_labs")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Biology Labs</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("biology_labs")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Chemistry Labs</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("chemistry_labs")} />
              </FormControl>
            </FormItem>
          </div>

          <h3 className="text-lg font-semibold mt-4">Staff & Counts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem>
              <FormLabel>Total Teachers</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("total_teachers")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Num Teachers</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("num_teachers")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Num Students</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("num_students")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Toilets (Male)</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("toilets_male")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Toilets (Female)</FormLabel>
              <FormControl>
                <Input type="number" {...methods.register("toilets_female")} />
              </FormControl>
            </FormItem>
          </div>

          <h3 className="text-lg font-semibold mt-4">Contact & Meta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormItem>
              <FormLabel>HR Contact</FormLabel>
              <FormControl>
                <Input {...methods.register("staff_contact_hr")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Admission Contact</FormLabel>
              <FormControl>
                <Input {...methods.register("admission_office_contact")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Official Email</FormLabel>
              <FormControl>
                <Input {...methods.register("official_email")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Photo (URL)</FormLabel>
              <FormControl>
                <Input {...methods.register("photo")} />
              </FormControl>
            </FormItem>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <div className="p-6 bg-[#e7ecef] min-h-screen">
      <header className="mb-6">
        <div className="relative rounded-lg overflow-hidden shadow-sm">
          <div className="h-48 lg:h-72 w-full bg-gray-200">
            {campus?.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campus.photo} alt="campus banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8b8c89]">No image</div>
            )}
          </div>

          {/* bottom colored band */}
          <div className="absolute left-0 right-0 bottom-0">
            <div className="bg-[#6b46c1] text-white py-6 lg:py-8 px-6 rounded-b-lg flex items-center gap-6">
              {/* circular logo overlapping */}
              <div className="-mt-12 lg:-mt-16">
                <div className="h-24 w-24 lg:h-28 lg:w-28 bg-white rounded-full flex items-center justify-center overflow-hidden" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
                  {campus?.photo ? (
                    // small circular crop
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={campus.photo} alt="logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-[#6b46c1] font-bold">{(campus?.name || 'C').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}</div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{campus?.name || 'Campus'}</h2>
                  <div className="text-sm opacity-90 mt-1 text-white/90">{campus?.campus_address || campus?.address || ''}</div>
                </div>
                <div className="mt-2 text-sm text-white/80">{campus?.governing_body}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {canEdit && (
        <div className="flex justify-end mb-4">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">Update Campus</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Update Campus</DialogTitle>
              </DialogHeader>
              <EditForm
                onSaved={(updated: any) => setCampus(updated)}
                onClose={() => setEditOpen(false)}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <main className="mt-6 grid grid-cols-4 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-[#274c77]">Overview</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-[#8b8c89]">Address</div>
                <div className="font-medium text-[#274c77]">{campus?.campus_address || campus?.address || '—'}</div>
                <div className="text-xs text-[#8b8c89]">Grades Offered</div>
                <div className="font-medium text-[#274c77]">{campus?.grades_offered || '—'}</div>
                  <div className="text-xs text-[#8b8c89]">Academic Year</div>
                <div className="font-medium text-[#274c77]">{campus?.academic_year_start_month ? fmtMonth(campus.academic_year_start_month) : '—'} {campus?.academic_year_end_month ? ` - ${fmtMonth(campus.academic_year_end_month)}` : ''}</div>
              </div>

              <div>
                <div className="text-xs text-[#8b8c89] mt-3">Code</div>
                <div className="font-medium text-[#274c77]">{campus?.code || '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Languages</div>
                <div className="font-medium text-[#274c77]">{campus?.languages_of_instruction || '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Special Classes</div>
                <div className="font-medium text-[#274c77]">{campus?.special_classes || '—'}</div>
              </div>

              <div>
                
                <div className="text-xs text-[#8b8c89] mt-3">Established</div>
                <div className="font-medium text-[#274c77]">{campus?.established_date || campus?.established_date === null ? (campus?.established_date || '—') : '—'}</div>

                <div className="text-xs text-[#8b8c89]">Capacity</div>
                <div className="font-medium text-[#274c77]">{campus?.capacity ?? campus?.total_students ?? '—'}</div>
                <div className="text-xs text-[#8b8c89]">Current Enrollment</div>
                <div className="font-medium text-[#274c77]">{campus?.num_students ?? campus?.current_student_enrollment ?? '—'}</div>
                <div className="text-xs text-[#8b8c89]">Shift</div>
                <div className="font-medium text-[#274c77]">{campus?.shift_available || campus?.shiftAvailable || '—'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-[#274c77]">Infrastructure</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-[#8b8c89]">Total Rooms</div>
                <div className="font-medium text-[#274c77]">{campus?.num_rooms ?? '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Total Classrooms</div>
                <div className="font-medium text-[#274c77]">{campus?.total_classrooms ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8c89]">Office Rooms</div>
                <div className="font-medium text-[#274c77]">{campus?.office_rooms ?? '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Avg Class Size</div>
                <div className="font-medium text-[#274c77]">{campus?.avg_class_size ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8c89]">Computer Labs</div>
                <div className="font-medium text-[#274c77]">{campus?.computer_labs ?? '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Libraries</div>
                <div className="font-medium text-[#274c77]">{(String(campus?.library) === 'true') || campus?.library ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-[#8b8c89]">Bio Labs</div>
                <div className="font-medium text-[#274c77]">{campus?.biology_labs ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8c89]">Chem Labs</div>
                <div className="font-medium text-[#274c77]">{campus?.chemistry_labs ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8c89]">Physics Labs</div>
                <div className="font-medium text-[#274c77]">{campus?.physics_labs ?? '—'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-[#274c77]">Staff Summary</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-[#8b8c89]">Total Teachers</div>
                <div className="font-medium text-[#274c77]">{campus?.total_teachers ?? campus?.num_teachers ?? '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Male Teachers</div>
                <div className="font-medium text-[#274c77]">{campus?.num_teachers_male ?? campus?.maleTeachers ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8c89]">Non-teaching Staff</div>
                <div className="font-medium text-[#274c77]">{campus?.total_non_teaching_staff ?? '—'}</div>
                <div className="text-xs text-[#8b8c89] mt-3">Female Teachers</div>
                <div className="font-medium text-[#274c77]">{campus?.num_teachers_female ?? campus?.femaleTeachers ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b8c89]">Students (M/F)</div>
                <div className="font-medium text-[#274c77]">{(campus?.num_students_male ?? campus?.maleStudents ?? 0)}/{(campus?.num_students_female ?? campus?.femaleStudents ?? 0)}</div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h3 className="text-sm text-slate-600">Facilities</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-800">
              <li>Library: <strong className="text-slate-900">{campus?.library ? 'Yes' : 'No'}</strong></li>
              <li>Power Backup: <strong className="text-slate-900">{campus?.power_backup ? 'Yes' : 'No'}</strong></li>
              <li>Internet/WiFi: <strong className="text-slate-900">{campus?.internet_wifi ? 'Yes' : 'No'}</strong></li>
              <li>Toilets (M/F): <strong className="text-slate-900">{(campus?.toilets_male ?? 0)}/{(campus?.toilets_female ?? 0)}</strong></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <h3 className="text-sm text-slate-600">Contact & Meta</h3>
            <div className="mt-4 text-sm text-slate-800">
              <div className="text-slate-500 text-xs">HR Contact</div>
              <div className="font-medium text-slate-900">{campus?.staff_contact_hr || '—'}</div>
              <div className="text-xs text-[#8b8c89] mt-3">Admission Office Contact</div>
              <div className="font-medium text-[#274c77]">{campus?.admission_office_contact || '—'}</div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
