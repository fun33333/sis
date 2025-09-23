"use client"

import React, { useMemo, useState } from "react"
import { CAMPUSES } from "@/data/mockData"
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
  // CSV student type
  type CsvStudent = {
    [key: string]: any;
    "Student Name": string;
    "Campus": string;
    "Current Grade/Class": string;
    "Section": string;
    "Year of Admission": string | number;
    "Student ID"?: string;
    "GR No"?: string;
    "Composite key"?: string;
  };
  type Student = {
    studentId: string;
    name: string;
    campus: string;
    grade: string;
    academicYear?: number;
  };
  const [students, setStudents] = useState<Student[]>([]);

  // Fetch students from csvjson.json on mount
  React.useEffect(() => {
    fetch("/csvjson.json")
      .then((res) => res.json())
      .then((data: CsvStudent[]) => {
        const mapped = data.map((s) => ({
          studentId: (s["Student ID"] || s["GR No"] || s["Composite key"] || s["Student Name"]+s["Father Name"]+s["Father Contact Number"] || "").toString(),
          name: s["Student Name"] || "",
          campus: s["Campus"] || "",
          grade: s["Current Grade/Class"] || "",
          academicYear: Number(s["Year of Admission"] || new Date().getFullYear()),
        }));
        setStudents(mapped);
      });
  }, []);
  const [search, setSearch] = useState("");
  const filteredStudents = useMemo(() => {
    if (!search) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, students]);


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
      className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col items-center border-[16px] border-[#d4af37]"
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #fefefe 50%, #fdf6e3 100%)",
      }}
    >
      {/* Decorative Corner Borders */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-[10px] border-l-[10px] border-[#d4af37] rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-20 h-20 border-t-[10px] border-r-[10px] border-[#d4af37] rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-[10px] border-l-[10px] border-[#d4af37] rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-[10px] border-r-[10px] border-[#d4af37] rounded-br-xl"></div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Image src="/vercel.svg" alt="Watermark" width={500} height={500} />
      </div>

      {/* Close Button */}
      <button
        className="absolute top-5 right-6 text-gray-500 hover:text-gray-800 text-3xl font-bold"
        onClick={() => setShowCertificate(false)}
      >
        &times;
      </button>

      {/* Header */}
      <div className="flex justify-between items-center w-full px-12 mt-8 relative z-10">
        <div className="flex items-center gap-4">
          <Image src="/vercel.svg" alt="Logo" width={70} height={70} />
          <span className="font-extrabold text-3xl text-[#1d3557] tracking-widest uppercase">
            SIS School
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#1d3557] font-bold text-lg uppercase tracking-wide">
            Transfer Certificate
          </span>
          <div className="h-14 w-14 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white font-extrabold shadow-xl">
            TC
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-10 text-center relative z-10">
        <h2 className="text-5xl font-extrabold text-[#1d3557] tracking-[0.25em] uppercase mb-4">
          Certificate of Transfer
        </h2>
        <div className="w-40 h-1.5 mx-auto bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        <p className="text-[#457b9d] text-lg italic mt-6">
          This certificate is proudly presented to
        </p>
      </div>

      {/* Student Name */}
      <h3 className="text-4xl font-bold text-[#1d3557] my-6 text-center uppercase relative z-10">
        {selectedStudent.name}
      </h3>
      <div className="w-1/3 border-t-4 border-yellow-600 mb-12"></div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-[#1d3557] text-lg w-4/5 bg-[#fffaf0] rounded-2xl shadow-inner py-8 px-14 relative z-10 border border-yellow-300">
        <p>
          <span className="font-semibold">Student ID:</span>{" "}
          {selectedStudent.studentId}
        </p>
        <p>
          <span className="font-semibold">New Student ID:</span> {previewNewId}
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
          <span className="font-semibold">Transfer Date:</span> {effectiveDate}
        </p>
      </div>

      {/* Statement */}
      <p className="text-[#1d3557] text-lg text-center px-16 leading-relaxed my-12 relative z-10">
        This is to certify that{" "}
        <span className="font-semibold">{selectedStudent.name}</span> has been
        officially transferred from{" "}
        <span className="font-semibold">{selectedStudent.campus}</span> to{" "}
        <span className="font-semibold">
          {newCampus || selectedStudent.campus}
        </span>{" "}
        effective <span className="font-semibold">{effectiveDate}</span>.
      </p>

      {/* Signatures */}
      <div className="flex justify-between items-center w-full mt-10 px-24 relative z-10">
        <div className="text-center">
          <div className="h-12 border-b-2 border-gray-700 w-64 mx-auto mb-2"></div>
          <p className="font-bold text-[#1d3557] tracking-wide">Principal</p>
        </div>
        <div className="text-center">
          <div className="h-12 border-b-2 border-gray-700 w-64 mx-auto mb-2"></div>
          <p className="font-bold text-[#1d3557] tracking-wide">Administrator</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-12 mt-14 mb-10 relative z-10">
        <button
          className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-12 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition"
          onClick={() => window.print()}
        >
          Save / Print
        </button>
        <button
          className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-12 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition"
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
                        <span className="font-medium text-base">{s.name}</span>
                        <span className="text-xs ml-4 font-mono tracking-wider">{s.studentId}</span>
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