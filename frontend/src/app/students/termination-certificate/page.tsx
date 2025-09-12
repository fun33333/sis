"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

type Student = {
  id: string
  gr: string
  name: string
  campus: string
  grade: string
  section?: string
  admissionDate: string // ISO date
  status?: string
  terminations?: Array<any>
}

const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
    gr: "GR1001",
    name: "Ali Khan",
    campus: "Central Campus",
    grade: "8",
    section: "A",
    admissionDate: "2021-03-15",
    status: "Active",
    terminations: [],
  },
  {
    id: "2",
    gr: "GR1002",
    name: "Sara Ahmed",
    campus: "North Campus",
    grade: "10",
    section: "B",
    admissionDate: "2020-08-20",
    status: "Active",
    terminations: [],
  },
]

export default function TerminationCertificatePage() {
  const { toast } = useToast()

  const [lookup, setLookup] = useState("")
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS)
  const [student, setStudent] = useState<Student | null>(null)
  const [terminationDate, setTerminationDate] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [otherReason, setOtherReason] = useState<string>("")
  const [approvedBy, setApprovedBy] = useState<string>("")
  const [approvalDate, setApprovalDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [previewing, setPreviewing] = useState(false)
  const sigInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // if student's status changed externally, refresh local student object
    if (student) {
      const refreshed = students.find((s) => s.id === student.id) || null
      setStudent(refreshed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students])

  const findStudent = (term: string) => {
    const t = term.trim()
    if (!t) return null
    return (
      students.find((s) => s.gr.toLowerCase() === t.toLowerCase() || s.id === t) || null
    )
  }

  const handleLookup = () => {
    setErrors([])
    const found = findStudent(lookup)
    if (!found) {
      setErrors(["Student not found. Enter correct ID or GR No."])
      setStudent(null)
      return
    }
    setStudent(found)
    // prefill terminationDate with today
    setTerminationDate(new Date().toISOString().slice(0, 10))
  }

  const validate = () => {
    const errs: string[] = []
    if (!student) errs.push("Select a student first")
    if (!terminationDate) errs.push("Termination date is required")
    if (student && terminationDate) {
      const adm = new Date(student.admissionDate)
      const term = new Date(terminationDate)
      if (term < adm) errs.push("Termination date must be on or after admission date")
    }
    if (!reason) errs.push("Select a reason")
    if (reason === "other" && !otherReason.trim()) errs.push("Provide the reason details")
    if (!approvedBy.trim()) errs.push("Approved By is required")
    if (!approvalDate) errs.push("Approval date is required")
    setErrors(errs)
    return errs.length === 0
  }

  // pure validation (no side-effects) used for disabling buttons in render
  const isFormValid = useMemo(() => {
    const errs: string[] = []
    if (!student) errs.push("Select a student first")
    if (!terminationDate) errs.push("Termination date is required")
    if (student && terminationDate) {
      const adm = new Date(student.admissionDate)
      const term = new Date(terminationDate)
      if (term < adm) errs.push("Termination date must be on or after admission date")
    }
    if (!reason) errs.push("Select a reason")
    if (reason === "other" && !otherReason.trim()) errs.push("Provide the reason details")
    if (!approvedBy.trim()) errs.push("Approved By is required")
    if (!approvalDate) errs.push("Approval date is required")
    return errs.length === 0
  }, [student, terminationDate, reason, otherReason, approvedBy, approvalDate])

  const mappedStatusForReason = (r: string) => {
    if (r === "Withdrawn") return "Withdrawn"
    return "Terminated"
  }

  const handleSave = () => {
    setErrors([])
    if (!validate()) return
    if (!student) return

    const entry = {
      date: terminationDate,
      reason: reason === "other" ? otherReason : reason,
      approvedBy,
      approvalDate,
      signature: signaturePreview,
      createdAt: new Date().toISOString(),
    }

  setStudents((prev) => {
      const next = prev.map((s) => {
        if (s.id === student.id) {
          const terminations = [...(s.terminations || []), entry]
          const status = mappedStatusForReason(reason)
          return { ...s, status, terminations }
        }
        return s
      })
      return next
    })

    setPreviewing(false)
  toast({ title: "Saved", description: "Termination saved and student status updated." })
  }

  const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSignaturePreview(String(ev.target?.result || ""))
    reader.readAsDataURL(file)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const content = document.getElementById("termination-certificate-print")?.innerHTML || ""
    printWindow.document.write(`
      <html>
        <head>
          <title>Termination Certificate</title>
          <style>body{font-family: Arial, sans-serif; padding: 40px;} .cert{border:1px solid #333;padding:30px;border-radius:8px;}</style>
        </head>
        <body>
          ${content}
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Termination Certificate</h2>
        <Link href="/">Back</Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lookup Student</CardTitle>
          <CardDescription>Enter Student ID or GR No to load student information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="ID or GR No" value={lookup} onChange={(e) => setLookup(e.target.value)} />
            <Button onClick={handleLookup}>Lookup</Button>
            <Button variant="outline" onClick={() => { setLookup(""); setStudent(null); setErrors([]) }}>Clear</Button>
          </div>
          {errors.length > 0 && (
            <div className="text-red-600">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Autofilled after lookup (read-only after termination)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!student && <p className="text-muted-foreground">No student selected</p>}
            {student && (
              <div className="space-y-2">
                <div>
                  <Label>GR No / ID</Label>
                  <p className="font-medium">{student.gr} ({student.id})</p>
                </div>
                <div>
                  <Label>Student Name</Label>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <Label>Campus</Label>
                  <p className="font-medium">{student.campus}</p>
                </div>
                <div>
                  <Label>Grade & Section</Label>
                  <p className="font-medium">{student.grade} {student.section || ""}</p>
                </div>
                <div>
                  <Label>Date of Admission</Label>
                  <p className="font-medium">{student.admissionDate}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className={`font-medium ${student.status !== 'Active' ? 'text-red-600' : ''}`}>{student.status || 'Active'}</p>
                </div>
                {student.terminations && student.terminations.length > 0 && (
                  <div className="mt-2">
                    <Label>Previous Terminations (append-only)</Label>
                    <ul className="list-disc ml-6">
                      {student.terminations.map((t: any, idx: number) => (
                        <li key={idx} className="text-sm">{t.date} — {t.reason} (Approved by {t.approvedBy} on {t.approvalDate})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termination Details</CardTitle>
            <CardDescription>Enter termination information and approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Date of Termination *</Label>
              <Input type="date" value={terminationDate} onChange={(e) => setTerminationDate(e.target.value)} />
            </div>

            <div>
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={(v) => setReason(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Expelled">Expelled</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="Academic Dismissal">Academic Dismissal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reason === 'other' && (
              <div>
                <Label>Reason Details</Label>
                <Textarea value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
              </div>
            )}

            <div>
              <Label>Approved By *</Label>
              <Input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} placeholder="Name of Principal/Admin" />
            </div>

            <div>
              <Label>Approval Date *</Label>
              <Input type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} />
            </div>

            <div>
              <Label>Signature (optional)</Label>
              <input ref={sigInputRef} type="file" accept="image/*" onChange={handleSignature} />
              {signaturePreview && <img src={signaturePreview} alt="signature" className="h-16 mt-2" />}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => { if (validate()) setPreviewing(true) }}>Preview Certificate</Button>
              <Button variant="outline" onClick={() => { setPreviewing(false); setErrors([]) }}>Cancel Preview</Button>
              <Button className="bg-secondary hover:bg-secondary/90" onClick={handleSave} disabled={!isFormValid}>
                Save & Update Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {previewing && student && (
        <div className="mt-6">
          <div id="termination-certificate-print">
            <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow cert">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Institution Name</h3>
                <p className="text-sm text-muted-foreground">Official Termination Certificate</p>
                <Separator className="my-4" />
              </div>
              <div>
                <p>This certifies that <strong>{student.name}</strong> (GR: {student.gr}) of <strong>{student.campus}</strong>, Grade {student.grade} {student.section ? `- ${student.section}` : ''} has had their admission terminated.</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Date of Admission:</strong> {student.admissionDate}</p>
                    <p><strong>Date of Termination:</strong> {terminationDate}</p>
                    <p><strong>Reason:</strong> {reason === 'other' ? otherReason : reason}</p>
                  </div>
                  <div>
                    <p><strong>Approved By:</strong> {approvedBy}</p>
                    <p><strong>Approval Date:</strong> {approvalDate}</p>
                    {signaturePreview && <div className="mt-2"><img src={signaturePreview} alt="signature" className="h-16"/></div>}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-2">
                <Button onClick={handlePrint} className="bg-primary">Print</Button>
                <Button variant="outline" onClick={() => setPreviewing(false)}>Close Preview</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
