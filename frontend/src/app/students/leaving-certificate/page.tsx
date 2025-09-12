"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { mockStudents } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"

export default function LeavingCertificatePage() {
  const router = useRouter()
  const params = useSearchParams()
  const initialStudentId = params?.get("studentId") || ""
  const { toast } = useToast()

  // local copy of students so we can update in-memory (append-only leavings)
  const [students, setStudents] = useState(() => mockStudents.map((s) => ({ ...s, leavings: (s as any).leavings || [] })))

  const [lookup, setLookup] = useState(initialStudentId)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const student = useMemo(() => students.find((s) => s.studentId === lookup), [students, lookup])

  const [dateOfLeaving, setDateOfLeaving] = useState("")
  const [lastClassPassed, setLastClassPassed] = useState("")
  const [remarks, setRemarks] = useState("")
  const [reason, setReason] = useState("")
  const [approvedBy, setApprovedBy] = useState("")
  const [approvalDate, setApprovalDate] = useState(new Date().toISOString().slice(0, 10))
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [previewing, setPreviewing] = useState(false)
  const sigRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (student) {
      // prefill some fields when a student is selected
      setLastClassPassed(student.grade || "")
      setDateOfLeaving(new Date().toISOString().slice(0, 10))
      setRemarks("")
      setReason("")
      setApprovedBy("")
      setSignaturePreview(null)
      setErrors([])
    }
  }, [student])

  const handleLookup = () => {
    // lookup-specific errors (keep separate from form validation errors)
    setLookupError(null)
    setErrors([])
    if (!lookup) {
      setLookupError("Enter Student ID or GR No")
      return
    }
    const found = students.find((s) => s.studentId.toLowerCase() === lookup.toLowerCase())
    if (!found) {
      setLookupError("Student not found")
      return
    }
    // found -> clear any previous lookup error; student selected via lookup state
    setLookupError(null)
  }

  // auto-run lookup if the page was opened with a studentId in query params
  useEffect(() => {
    if (initialStudentId) {
      // ensure lookup state already set, then perform lookup
      setLookup(initialStudentId)
      // run lookup after current render
      setTimeout(() => handleLookup(), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStudentId])

  const validate = () => {
    const err: string[] = []
    if (!student) err.push("Select a student first")
    if (!dateOfLeaving) err.push("Date of leaving is required")
    if (student && dateOfLeaving) {
      const adm = new Date(student.enrollmentDate)
      const leave = new Date(dateOfLeaving)
      if (leave < adm) err.push("Date of leaving must be on or after date of admission")
    }
    if (!reason) err.push("Select a reason")
    if (!approvedBy.trim()) err.push("Approved By is required")
    if (!approvalDate) err.push("Approval date is required")
    setErrors(err)
    return err.length === 0
  }

  const isFormValid = useMemo(() => {
    if (!student) return false
    if (!dateOfLeaving) return false
    if (!reason) return false
    if (!approvedBy.trim()) return false
    if (!approvalDate) return false
    const adm = new Date(student.enrollmentDate)
    const leave = new Date(dateOfLeaving)
    if (leave < adm) return false
    return true
  }, [student, dateOfLeaving, reason, approvedBy, approvalDate])

  const mappedStatus = (r: string) => {
    if (r === "Withdrawn" || r === "Change of Home") return "Withdrawn"
    return "Leaving"
  }

  const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSignaturePreview(String(ev.target?.result || ""))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setErrors([])
    if (!validate()) return
    if (!student) return

    const entry = {
      date: dateOfLeaving,
      lastClassPassed,
      remarks,
      reason,
      approvedBy,
      approvalDate,
      signature: signaturePreview,
      createdAt: new Date().toISOString(),
    }

    setStudents((prev) => prev.map((s) => {
      if (s.studentId === student.studentId) {
        const leavings = [...(s.leavings || []), entry]
        const status = mappedStatus(reason)
        return { ...s, status, leavings }
      }
      return s
    }))

    setPreviewing(false)
    toast({ title: "Leaving saved", description: "Student status updated and leaving record appended." })
  }

  const handlePrint = () => {
    const w = window.open("", "_blank")
    if (!w) return
    const content = document.getElementById("leaving-certificate-print")?.innerHTML || ""
    w.document.write(`
      <html>
        <head>
          <title>Leaving Certificate</title>
          <style>body{font-family: Arial, sans-serif; padding:40px;} .cert{border:1px solid #333;padding:24px;border-radius:6px;}</style>
        </head>
        <body>
          ${content}
          <script>window.print()</script>
        </body>
      </html>
    `)
    w.document.close()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // show preview first
    if (!validate()) return
    setPreviewing(true)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Leaving Certificate</h2>
        <Button variant="ghost" onClick={() => router.back()}>Back</Button>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Lookup Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter Student ID or GR No" value={lookup} onChange={(e) => setLookup(e.target.value)} />
            <Button onClick={handleLookup}>Lookup</Button>
          </div>
          {errors.length > 0 && (
            <div className="text-sm text-red-600 mt-2">
              {errors.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}
        </CardContent>
      </Card>

      {!student && (
        <div className="text-muted-foreground">No student selected. Use lookup above or open this route with ?studentId=GR123</div>
      )}

      {student && (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student ID / GR No</Label>
                  <Input value={student.studentId} readOnly />
                </div>
                <div>
                  <Label>Student Name</Label>
                  <Input value={student.name} readOnly />
                </div>
                <div>
                  <Label>Current Campus</Label>
                  <Input value={student.campus} readOnly />
                </div>
                <div>
                  <Label>Current Grade/Class & Section</Label>
                  <Input value={student.grade} readOnly />
                </div>
                <div>
                  <Label>Date of Admission</Label>
                  <Input value={new Date(student.enrollmentDate).toISOString().slice(0, 10)} readOnly />
                </div>

                <div>
                  <Label>Date of Leaving *</Label>
                  <Input type="date" value={dateOfLeaving} onChange={(e) => setDateOfLeaving(e.target.value)} />
                </div>

                <div>
                  <Label>Last Class Passed</Label>
                  <Input value={lastClassPassed} onChange={(e) => setLastClassPassed(e.target.value)} />
                </div>

                <div>
                  <Label>Performance / Conduct Remarks</Label>
                  <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>

                <div>
                  <Label>Reason for Leaving *</Label>
                  <select className="w-full p-2 border rounded" value={reason} onChange={(e) => setReason(e.target.value)}>
                    <option value="">-- Select reason --</option>
                    <option value="Change of Home">Change of Home</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Academic Dismissal">Academic Dismissal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {reason === 'other' && (
                  <div className="md:col-span-2">
                    <Label>Reason Details</Label>
                    <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Describe reason" />
                  </div>
                )}

                <div>
                  <Label>Approved By (Principal / Admin) *</Label>
                  <Input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
                </div>

                <div>
                  <Label>Approval Date *</Label>
                  <Input type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <Label>Signature (optional)</Label>
                  <input ref={sigRef} type="file" accept="image/*" onChange={handleSignature} />
                  {signaturePreview && <img src={signaturePreview} alt="signature" className="h-16 mt-2" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit">Preview Leaving Certificate</Button>
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <div className="ml-auto">
              <Button onClick={() => { if (validate()) { setPreviewing(true) } }} disabled={!isFormValid}>Save & Update Status</Button>
            </div>
          </div>
        </form>
      )}

      {previewing && student && (
        <div className="mt-6">
          <div id="leaving-certificate-print">
            <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow cert">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Institution Name</h3>
                <p className="text-sm text-muted-foreground">Official Leaving Certificate</p>
                <Separator className="my-4" />
              </div>
              <div>
                <p>This is to certify that <strong>{student.name}</strong> (GR: {student.studentId}) of <strong>{student.campus}</strong>, Grade {student.grade} has formally left the institution.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Date of Admission:</strong> {new Date(student.enrollmentDate).toLocaleDateString()}</p>
                    <p><strong>Date of Leaving:</strong> {new Date(dateOfLeaving).toLocaleDateString()}</p>
                    <p><strong>Last Class Passed:</strong> {lastClassPassed}</p>
                    <p><strong>Reason:</strong> {reason === 'other' ? remarks : reason}</p>
                  </div>
                  <div>
                    <p><strong>Approved By:</strong> {approvedBy}</p>
                    <p><strong>Approval Date:</strong> {new Date(approvalDate).toLocaleDateString()}</p>
                    {signaturePreview && <div className="mt-2"><img src={signaturePreview} alt="signature" className="h-16" /></div>}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-2">
                <Button onClick={handlePrint}>Print</Button>
                <Button variant="outline" onClick={() => setPreviewing(false)}>Close Preview</Button>
                <Button className="bg-secondary" onClick={handleSave} disabled={!isFormValid}>Save & Update Status</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
