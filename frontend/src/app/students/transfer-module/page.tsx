"use client"

import React, { useMemo, useState } from "react"
import { mockStudents, CAMPUSES } from "@/data/mockData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { format } from "date-fns"

type Shift = "M" | "A"

type TransferType = "campus" | "shift"

type TransferRequest = {
  id: string
  type: TransferType
  studentIdBefore: string
  studentName: string
  currentCampus: string
  currentShift: Shift
  currentGrade: string
  newCampus?: string
  newShift?: Shift
  newStudentIdPreview: string
  reason?: string
  effectiveDate?: string
  status: "Requested" | "Approved" | "Rejected"
  approvals: {
    currentHead?: { approved: boolean; by?: string; at?: string; reason?: string }
    newHead?: { approved: boolean; by?: string; at?: string; reason?: string }
  }
  createdAt: string
}

// Helper: map campus name to code C01..C99
function campusCodeFromName(name: string) {
  const idx = CAMPUSES.indexOf(name)
  if (idx === -1) return "C00"
  return `C${String(idx + 1).padStart(2, "0")}`
}

function admissionYearShort(year: number) {
  return String(year).slice(-2)
}

function serialFromStudentId(stuId: string) {
  // If mock id is STU0001, extract number; fallback to random 5-digit
  const m = stuId.match(/(\d+)$/)
  if (m) return m[1].padStart(5, "0")
  return String(Math.floor(Math.random() * 90000) + 10000)
}

function generateNewStudentId(campusName: string, shift: Shift, student: any) {
  const code = campusCodeFromName(campusName)
  const year = admissionYearShort(student.academicYear || new Date().getFullYear())
  const serial = serialFromStudentId(student.studentId)
  return `${code}-${shift}-${year}-${serial}`
}

export default function TransferModulePage() {
  // local copy of students (in-memory)
  const [students, setStudents] = useState(() => mockStudents.slice(0, 200)) // keep list manageable

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const selectedStudent = useMemo(() => students.find((s) => s.studentId === selectedStudentId) || null, [students, selectedStudentId])

  const [tab, setTab] = useState<TransferType>("campus")

  // campus transfer fields
  const [newCampus, setNewCampus] = useState<string | undefined>(undefined)
  const [newShift, setNewShift] = useState<Shift | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [effectiveDate, setEffectiveDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  const [requests, setRequests] = useState<TransferRequest[]>([])

  const previewNewId = useMemo(() => {
    if (!selectedStudent) return ""
    const campus = newCampus ?? selectedStudent.campus
    const shift = newShift ?? ("M" as Shift)
    return generateNewStudentId(campus, shift, selectedStudent)
  }, [selectedStudent, newCampus, newShift])

  const createRequest = () => {
    if (!selectedStudent) return alert("Select a student first")
    const id = `TRF-${Date.now()}`
    const req: TransferRequest = {
      id,
      type: tab,
      studentIdBefore: selectedStudent.studentId,
      studentName: selectedStudent.name,
      currentCampus: selectedStudent.campus,
      currentShift: "M",
      currentGrade: selectedStudent.grade,
      newCampus: tab === "campus" ? newCampus : selectedStudent.campus,
      newShift: tab === "shift" ? newShift : newShift || ("M" as Shift),
      newStudentIdPreview: previewNewId,
      reason,
      effectiveDate,
      status: "Requested",
      approvals: { currentHead: { approved: false }, newHead: { approved: false } },
      createdAt: new Date().toISOString(),
    }
    setRequests((r) => [req, ...r])
    // Reset small fields
    setReason("")
    setNewCampus(undefined)
    setNewShift(undefined)
    alert("Transfer request created. Use the Approval panel below to simulate approvals.")
  }

  const approve = (requestId: string, which: "currentHead" | "newHead", approverName = "Head") => {
    setRequests((rs) =>
      rs.map((r) => {
        if (r.id !== requestId) return r
        const updated = { ...r }
        // mark approval
        ;(updated.approvals as any)[which] = { approved: true, by: approverName, at: new Date().toISOString() }
        // if campus transfer require both approvals
        const both = (updated.approvals.currentHead?.approved || false) && (updated.approvals.newHead?.approved || false)
        if (r.type === "campus" ? both : updated.approvals.currentHead?.approved) {
          updated.status = "Approved"
          // finalize: update student record in-memory
          setStudents((ss) =>
            ss.map((s) => {
              if (s.studentId !== r.studentIdBefore) return s
              return {
                ...s,
                campus: r.newCampus || s.campus,
                // keep grade same, set studentId to new id
                studentId: r.newStudentIdPreview,
                // attach transfer history
                transfer_history: {
                  previous_campus: r.currentCampus,
                  previous_shift: r.currentShift,
                  transfer_date: r.createdAt,
                  transfer_reason: r.reason,
                },
              }
            }),
          )
        }
        return updated
      }),
    )
  }

  const reject = (requestId: string, which: "currentHead" | "newHead", reasonText: string) => {
    setRequests((rs) =>
      rs.map((r) => {
        if (r.id !== requestId) return r
        const updated = { ...r }
        ;(updated.approvals as any)[which] = { approved: false, by: "Head", at: new Date().toISOString(), reason: reasonText }
        updated.status = "Rejected"
        return updated
      }),
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Student Transfer Module</h2>
        <div className="text-sm text-muted-foreground">Follow the form to request Campus or Shift transfers</div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
              <CardDescription>Auto-fill student information</CardDescription>
            </CardHeader>
            <CardContent>
              <Label className="text-sm">Student</Label>
              <Select onValueChange={(v) => setSelectedStudentId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.slice(0, 200).map((s) => (
                    <SelectItem key={s.studentId} value={s.studentId}>
                      {s.name} — {s.studentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStudent && (
                <div className="mt-4 space-y-2">
                  <div>
                    <Label className="text-sm">Student ID</Label>
                    <div className="text-sm font-medium">{selectedStudent.studentId}</div>
                  </div>
                  <div>
                    <Label className="text-sm">Name</Label>
                    <div className="text-sm font-medium">{selectedStudent.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm">Campus</Label>
                    <div className="text-sm font-medium">{selectedStudent.campus}</div>
                  </div>
                  <div>
                    <Label className="text-sm">Grade / Section</Label>
                    <div className="text-sm font-medium">{selectedStudent.grade}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Form</CardTitle>
              <CardDescription>Choose transfer type and fill details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as TransferType)}>
                <TabsList>
                  <TabsTrigger value="campus">Campus Transfer</TabsTrigger>
                  <TabsTrigger value="shift">Shift Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="campus">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>New Campus</Label>
                      <Select onValueChange={(v) => setNewCampus(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select new campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAMPUSES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>New Shift</Label>
                      <Select onValueChange={(v) => setNewShift(v as Shift)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Morning</SelectItem>
                          <SelectItem value="A">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>New Student ID (preview)</Label>
                    <Input readOnly value={previewNewId} />
                  </div>

                  <div className="mt-4">
                    <Label>Reason for Transfer</Label>
                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                  </div>

                  <div className="mt-4">
                    <Label>Effective Date</Label>
                    <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button onClick={createRequest}>Request Transfer</Button>
                    <Button variant="ghost" onClick={() => { setNewCampus(undefined); setNewShift(undefined); setReason("") }}>Reset</Button>
                  </div>
                </TabsContent>

                <TabsContent value="shift">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Shift</Label>
                      <Input readOnly value={selectedStudent ? "Morning (M)" : ""} />
                    </div>
                    <div>
                      <Label>New Shift</Label>
                      <Select onValueChange={(v) => setNewShift(v as Shift)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select new shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Morning</SelectItem>
                          <SelectItem value="A">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>New Student ID (preview)</Label>
                    <Input readOnly value={previewNewId} />
                  </div>

                  <div className="mt-4">
                    <Label>Reason for Shift Change</Label>
                    <Select onValueChange={(v) => setReason(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose or type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parent Request">Parent Request</SelectItem>
                        <SelectItem value="Transportation Issues">Transportation Issues</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {reason === "Other" && <Textarea className="mt-2" value={reason} onChange={(e) => setReason(e.target.value)} />}
                  </div>

                  <div className="mt-4">
                    <Label>Effective Date</Label>
                    <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button onClick={createRequest}>Request Shift Transfer</Button>
                    <Button variant="ghost" onClick={() => { setNewShift(undefined); setReason("") }}>Reset</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Approval / Requests list */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Requests & Approvals</CardTitle>
                <CardDescription>Simulate approvals from campus heads below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests.length === 0 && <div className="text-sm text-muted-foreground">No transfer requests yet.</div>}

                {requests.map((r) => (
                  <div key={r.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.studentName} • {r.studentIdBefore}</div>
                        <div className="text-sm text-muted-foreground">Type: {r.type} • Status: {r.status} • Created: {format(new Date(r.createdAt), "yyyy-MM-dd HH:mm")}</div>
                      </div>
                      <div className="flex gap-2">
                        {r.status === "Requested" && (
                          <>
                            <Button size="sm" onClick={() => approve(r.id, "currentHead", "Head A")}>Approve (Current Head)</Button>
                            {r.type === "campus" && <Button size="sm" onClick={() => approve(r.id, "newHead", "Head B")}>Approve (New Head)</Button>}
                            <Button size="sm" variant="destructive" onClick={() => reject(r.id, "currentHead", "Rejected by admin")}>Reject</Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <div>New ID Preview: <span className="font-medium">{r.newStudentIdPreview}</span></div>
                      <div>Reason: {r.reason || "-"}</div>
                      <div>Effective Date: {r.effectiveDate || "-"}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
