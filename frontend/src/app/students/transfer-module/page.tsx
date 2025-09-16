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
import Image from "next/image"

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

type Student = {
  studentId: string;
  name: string;
  campus: string;
  grade: string;
  academicYear?: number;
};

function generateNewStudentId(campusName: string, shift: Shift, student: Student) {
  const code = campusCodeFromName(campusName);
  const year = admissionYearShort(student.academicYear || new Date().getFullYear());
  const serial = serialFromStudentId(student.studentId);
  return `${code}-${shift}-${year}-${serial}`;
}

export default function TransferModulePage() {
  // Certificate preview modal state
  const [showCertificate, setShowCertificate] = useState(false);

  // local copy of students (in-memory)
  const [students, setStudents] = useState(() => mockStudents.slice(0, 200)); // keep list manageable
  // Search/filter state for student dropdown
  const [search, setSearch] = useState("");
  const filteredStudents = useMemo(() => {
    if (!search) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, students]);
  // Dropdown always open, so no need for selectOpen state


  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const selectedStudent = useMemo(
    () => students.find((s) => s.studentId === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const [tab, setTab] = useState<TransferType>("campus");

  // campus transfer fields
  const [newCampus, setNewCampus] = useState<string | undefined>(undefined);
  const [newShift, setNewShift] = useState<Shift | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const [requests, setRequests] = useState<TransferRequest[]>([]);

  const previewNewId = useMemo(() => {
    if (!selectedStudent) return "";
    const campus = newCampus ?? selectedStudent?.campus;
    const shift = newShift ?? ("M" as Shift);
    return generateNewStudentId(campus, shift, selectedStudent);
  }, [selectedStudent, newCampus, newShift]);

  // Removed unused createRequest function to resolve ESLint error

  const approve = (requestId: string, which: "currentHead" | "newHead", approverName = "Head") => {
    setRequests((rs) =>
      rs.map((r) => {
        if (r.id !== requestId) return r;
        const updated = { ...r };
        // mark approval
        (updated.approvals[which] as typeof updated.approvals.currentHead) = {
          approved: true,
          by: approverName,
          at: new Date().toISOString(),
        };
        // if campus transfer require both approvals
        const both = (updated.approvals.currentHead?.approved || false) && (updated.approvals.newHead?.approved || false);
        if (r.type === "campus" ? both : updated.approvals.currentHead?.approved) {
          updated.status = "Approved";
          // finalize: update student record in-memory
          setStudents((ss) =>
            ss.map((s) => {
              if (s.studentId !== r.studentIdBefore) return s;
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
              };
            })
          );
        }
        return updated;
      })
    );
  }

  const reject = (requestId: string, which: "currentHead" | "newHead", reasonText: string) => {
    setRequests((rs) =>
      rs.map((r) => {
        if (r.id !== requestId) return r;
        const updated = { ...r };
        (updated.approvals[which] as typeof updated.approvals.currentHead) = {
          approved: false,
          by: "Head",
          at: new Date().toISOString(),
          reason: reasonText,
        };
        updated.status = "Rejected";
        return updated;
      })
    );
  }

  return (
    <div className="p-6">
      {/* Certificate Preview Modal */}
      {showCertificate && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            id="certificate-preview"
            className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-4xl relative flex flex-col items-center"
            style={{
              background: "linear-gradient(135deg, #f8f9fa 0%, #edf2f4 100%)",
            }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCertificate(false)}
            >
              &times;
            </button>

            {/* Header Section */}
            <div className="flex justify-between items-center w-full mb-6">
              <div className="flex items-center gap-2">
                <Image src="/vercel.svg" alt="Logo" width={50} height={50} />
                <span className="font-bold text-xl text-[#274c77]">SIS School</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#274c77] font-bold text-lg tracking-wide">
                  TRANSFER CERTIFICATE
                </span>
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow">
                  TC
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-extrabold text-[#274c77] mb-2 tracking-wider uppercase">
              Certificate of Transfer
            </h2>
            <p className="text-[#457b9d] text-lg mb-6 italic">
              This certificate is proudly presented to
            </p>

            {/* Student Name */}
            <h3 className="text-3xl font-bold text-[#1d3557] mb-2">
              {selectedStudent.name}
            </h3>
            <div className="w-2/3 border-t-2 border-gray-400 mb-6"></div>

            {/* Details Section */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-[#274c77] text-base w-full px-10">
              <p>
                <span className="font-semibold">Student ID:</span>{" "}
                {selectedStudent.studentId}
              </p>
              <p>
                <span className="font-semibold">New Student ID:</span>{" "}
                {previewNewId}
              </p>
              <p>
                <span className="font-semibold">Campus:</span>{" "}
                {selectedStudent.campus}
              </p>
              <p>
                <span className="font-semibold">Grade / Section:</span>{" "}
                {selectedStudent.grade}
              </p>
              <p className="col-span-2">
                <span className="font-semibold">Transfer Date:</span>{" "}
                {effectiveDate}
              </p>
            </div>

            {/* Statement */}
            <div className="w-full border-t border-gray-300 my-6"></div>
            <p className="text-[#274c77] text-lg text-center px-6">
              This is to certify that{" "}
              <span className="font-semibold">{selectedStudent.name}</span> has been
              transferred from{" "}
              <span className="font-semibold">{selectedStudent.campus}</span> to{" "}
              <span className="font-semibold">
                {newCampus || selectedStudent.campus}
              </span>{" "}
              effective <span className="font-semibold">{effectiveDate}</span>.
            </p>

            {/* Signatures */}
            <div className="flex justify-between items-center w-full mt-10 px-12">
              <div className="text-center">
                <div className="h-10 border-b-2 border-gray-500 w-40 mx-auto mb-1"></div>
                <p className="font-bold text-[#1d3557]">Principal</p>
              </div>
              <div className="text-center">
                <div className="h-10 border-b-2 border-gray-500 w-40 mx-auto mb-1"></div>
                <p className="font-bold text-[#1d3557]">Administrator</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6 mt-10">
              <button
                className="bg-[#6096ba] text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-[#274c77] transition"
                onClick={() => window.print()}
              >
                Save / Print
              </button>
              <button
                className="bg-gray-500 text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-[#274c77] transition"
                onClick={() => {
                  const cert = document.getElementById("certificate-preview");
                  if (!cert) return;
                  import("html2canvas").then((html2canvas) => {
                    html2canvas.default(cert).then((canvas: HTMLCanvasElement) => {
                      const link = document.createElement("a");
                      link.download = `transfer-certificate-${selectedStudent.name}.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                    });
                  });
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 text-[#274c77]">
        <h2 className="text-2xl font-bold">Student Transfer Module</h2>
        <div className="text-sm text-muted-foreground">Follow the form to request Campus or Shift transfers</div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[700px]">
        <div className="col-span-4 h-full flex flex-col">
          <Card className="bg-[#e7ecef] h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-[#274c77] font-semibold font-size-lg">
                Select Student
              </CardTitle>
              <CardDescription className="text-[#274c77]">
                Auto-fill student information
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Student Select Dropdown */}
              <Label className="text-sm font-bold text-[#274c77]">Student</Label>

              {/* Custom Dropdown: Only Search Bar and Student List */}
              <div className="bg-[#e7ecef] rounded-md mt-2 flex flex-col h-[550px] border border-[#274c77] px-4">
                {/* Search Bar Fixed at Top */}
                <div className="sticky top-0 z-10 bg-[#e7ecef] px-2 pt-2 pb-2 border-b border-[#274c77]">
                  <Input
                    type="text"
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border px-2 py-1 text-[#274c77] placeholder-[#274c77] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Student List with Scrollbar */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="px-3 py-2 text-[#274c77]">No students found</div>
                  ) : (
                    filteredStudents.map((s) => (
                      <div
                        key={s.studentId}
                        className="cursor-pointer px-3 py-2 text-[#274c77] bg-[#e7ecef] hover:bg-[#274c77] hover:text-white rounded flex items-center justify-between"
                        onClick={() => setSelectedStudentId(s.studentId)}
                      >
                        <span className="font-medium text-sm">{s.name}</span>
                        <span className="text-xs ml-4">{s.studentId}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Student details removed from left column. Now shown below form buttons. */}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8 h-full flex flex-col">
          <Card className="bg-[#6096ba]/20 text-black rounded-xl shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Transfer Form</CardTitle>
              <CardDescription className="text-black">
                Choose transfer type and fill details
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <Tabs value={tab} onValueChange={(v) => setTab(v as TransferType)}>
                {/* Tabs */}
                <TabsList className="bg-white/20 rounded-md p-1">
                  <TabsTrigger
                    value="campus"
                    className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80"
                  >
                    Campus Transfer
                  </TabsTrigger>
                  <TabsTrigger
                    value="shift"
                    className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80"
                  >
                    Shift Transfer
                  </TabsTrigger>
                </TabsList>

                {/* Campus Transfer */}
                <TabsContent value="campus" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black mb-1 block">New Campus</Label>
                      <Select onValueChange={(v) => setNewCampus(v)}>
                        <SelectTrigger className="w-full bg-transparent border border-black/50 text-black placeholder:text-gray-500">
                          <SelectValue placeholder="Select new campus" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          {CAMPUSES.map((c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="hover:bg-black/10 focus:bg-black/20"
                            >
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-black mb-1 block">New Shift</Label>
                      <Select onValueChange={(v) => setNewShift(v as Shift)}>
                        <SelectTrigger className="w-full bg-transparent border border-black/50 text-black placeholder:text-gray-500">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          <SelectItem value="M" className="hover:bg-black/10">
                            Morning
                          </SelectItem>
                          <SelectItem value="A" className="hover:bg-black/10">
                            Afternoon
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="text-black mb-1 block">New Student ID (preview)</Label>
                    <Input
                      readOnly
                      value={previewNewId}
                      className="bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                    />
                  </div>

                  <div className="mt-4">
                    <Label className="text-black mb-1 block">Reason for Transfer</Label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                    />
                  </div>

                  <div className="mt-4">
                    <Label className="text-black mb-1 block">Effective Date</Label>
                    <Input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button className="bg-black text-white hover:bg-gray-800 transition-colors duration-300">
                      Request Transfer
                    </Button>
                    <Button
                      variant="ghost"
                      className="bg-gray-200 text-black hover:bg-gray-300 transition-colors duration-300"
                      onClick={() => {
                        setNewCampus(undefined);
                        setNewShift(undefined);
                        setReason("");
                      }}
                    >
                      Reset
                    </Button>
                    {/* Right Side Preview Button */}
                    <div className="ms-auto flex justify-end">
                      <Button
                        className="bg-black text-white hover:bg-gray-800 transition-colors duration-300"
                        onClick={() => setShowCertificate(true)}
                      >
                        Preview Certificate
                      </Button>
                    </div>
                  </div>
                  {/* Selected Student Details: Landscape Card below form buttons */}
                  {selectedStudent && (
                    <div className="mt-4 bg-[#e7ecef] p-3 rounded-md flex items-center gap-6 border border-[#274c77]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">ID:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.studentId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">Name:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">Campus:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.campus}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">Grade/Section:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.grade}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Shift Transfer */}
                <TabsContent value="shift" className="mt-4">
                  {/* Selected Student Details: Landscape Card */}
                  {selectedStudent && (
                    <div className="mt-4 bg-[#e7ecef] p-3 rounded-md flex items-center gap-6 border border-[#274c77]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">ID:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.studentId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">Name:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">Campus:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.campus}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#274c77]">Grade/Section:</span>
                        <span className="font-medium text-[#274c77]">{selectedStudent.grade}</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black mb-1 block">Current Shift</Label>
                      <Input
                        readOnly
                        value={selectedStudent ? "Morning (M)" : ""}
                        className="bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label className="text-black mb-1 block">New Shift</Label>
                      <Select onValueChange={(v) => setNewShift(v as Shift)}>
                        <SelectTrigger className="w-full bg-transparent border border-black/50 text-black placeholder:text-gray-500">
                          <SelectValue placeholder="Select new shift" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          <SelectItem value="M" className="hover:bg-black/10">
                            Morning
                          </SelectItem>
                          <SelectItem value="A" className="hover:bg-black/10">
                            Afternoon
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="text-black mb-1 block">New Student ID (preview)</Label>
                    <Input
                      readOnly
                      value={previewNewId}
                      className="bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                    />
                  </div>

                  <div className="mt-4">
                    <Label className="text-black mb-1 block">Reason for Shift Change</Label>
                    <Select onValueChange={(v) => setReason(v)}>
                      <SelectTrigger className="w-full bg-transparent border border-black/50 text-black placeholder:text-gray-500">
                        <SelectValue placeholder="Choose or type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        <SelectItem value="Parent Request" className="hover:bg-black/10">
                          Parent Request
                        </SelectItem>
                        <SelectItem value="Transportation Issues" className="hover:bg-black/10">
                          Transportation Issues
                        </SelectItem>
                        <SelectItem value="Other" className="hover:bg-black/10">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {reason === "Other" && (
                      <Textarea
                        className="mt-2 bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="mt-4">
                    <Label className="text-black mb-1 block">Effective Date</Label>
                    <Input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="bg-transparent border border-black/50 text-black placeholder:text-gray-500"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button className="bg-black text-white hover:bg-gray-800 transition-colors duration-300">
                      Request Shift Transfer
                    </Button>
                    <Button
                      variant="ghost"
                      className="bg-gray-200 text-black hover:bg-gray-300 transition-colors duration-300"
                      onClick={() => {
                        setNewShift(undefined);
                        setReason("");
                      }}
                    >
                      Reset
                    </Button>
                    {/* Right Side Preview Button */}
                    <div className="ms-auto flex justify-end">
                      <Button
                        className="bg-black text-white hover:bg-gray-800 transition-colors duration-300"
                        onClick={() => setShowCertificate(true)}
                      >
                        Preview Certificate
                      </Button>
                    </div>
                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>




          {/* Approval / Requests list */}
          <div className="mt-6 flex-1 flex flex-col">
            <Card className="bg-[#e7ecef] text-black">
              <CardHeader>
                <CardTitle className="text-black">Transfer Requests & Approvals</CardTitle>
                <CardDescription className="text-black">
                  Simulate approvals from campus heads below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests.length === 0 && (
                  <div className="text-sm text-black">No transfer requests yet.</div>
                )}

                {requests.map((r) => (
                  <div key={r.id} className="border rounded p-3 bg-white text-black">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {r.studentName} • {r.studentIdBefore}
                        </div>
                        <div className="text-sm">
                          Type: {r.type} • Status: {r.status} • Created:{" "}
                          {format(new Date(r.createdAt), "yyyy-MM-dd HH:mm")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {r.status === "Requested" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-black text-white hover:bg-gray-800"
                              onClick={() => approve(r.id, "currentHead", "Head A")}
                            >
                              Approve (Current Head)
                            </Button>
                            {r.type === "campus" && (
                              <Button
                                size="sm"
                                className="bg-black text-white hover:bg-gray-800"
                                onClick={() => approve(r.id, "newHead", "Head B")}
                              >
                                Approve (New Head)
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                reject(r.id, "currentHead", "Rejected by admin")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <div>
                        New ID Preview:{" "}
                        <span className="font-medium">{r.newStudentIdPreview}</span>
                      </div>
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