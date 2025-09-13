"use client"

// import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2, GraduationCap, Upload, X, ArrowLeft, ArrowRight, Save, FileText, Eye, List, UserPlus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"


type FormType = "students" | "campus" | "teachers"

export default function AdminPanel() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeForm, setActiveForm] = useState<FormType>("campus")
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [showStudentList, setShowStudentList] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({})
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [errorFields, setErrorFields] = useState<string[]>([])
  // temporary local teacher state used for inline preview editing
  const [teacher, setTeacher] = useState<any>({})

 // Inline error component for fields
 const ErrorText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-red-600 mt-1 flex items-center gap-2">
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 9v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span>{children}</span>
  </p>
)

  const forms = {
    students: {
      title: "Add Students",
      icon: Users,
      steps: [
        {
          id: 1,
          title: "Personal Details",
          fields: ["studentPhoto", "name", "gender", "dob", "placeOfBirth", "religion", "motherTongue"],
        },
        {
          id: 2,
          title: "Contact Details",
          fields: [
            "emergencyContact",
            "fatherName",
            "fatherCNIC",
            "fatherContact",
            "fatherOccupation",
            "guardianName",
            "guardianCNIC",
            "guardianOccupation",
            "motherName",
            "motherCNIC",
            "motherStatus",
            "motherContact",
            "motherOccupation",
            "zakatStatus",
            "address",
            "familyIncome",
            "houseOwned",
            "rent",
          ],
        },
        {
          id: 3,
          title: "Academic Details",
          fields: [
            "currentState",
            "campus",
            "currentGrade",
            "section",

            "toYear",
            "fromYear",
            "lastClassPassed",
            "lastSchoolName",
            "oldGRNo",
            "grNumber",
          ],
        },
      ],
    },
    campus: {
      title: "Add Campus",
      icon: Building2,
      steps: [
        {
          id: 1,
          title: "General Information",
          fields: [
            "campusName",
            "campusCode",
            "description",
            "status",
            "governingBody",
            "registrationNumber",
            "address",
            "gradesOffered",
            "languagesOfInstruction",
            "academicYearStart",
            "academicYearEnd",
          ],
        },
        {
          id: 2,
          title: "Campus Details",
          fields: [
            "campusCapacity",
            "classesPerGrade",
            "averageClassSize",
            "totalStudents",
            "totalTeachers",
            "totalRooms",
            "totalClassrooms",
            "scienceLabs",
            "computerLabs",
            "library",
            "toilets",
            "facilities",
          ],
        },
        {
          id: 3,
          title: "Contact & Misc",
          fields: [
            "powerBackup",
            "internetAvailability",
            "establishedDate",
            "staffHRContact",
            "admissionOfficeContact",
          ],
        },
      ],
    },
    teachers: {
      title: "Add Teachers",
      icon: GraduationCap,
      steps: [
        { id: 1, title: "Personal Information", fields: ["fullName", "dob", "gender", "contactNumber", "email"] },
        { id: 2, title: "Educational Qualifications", fields: ["education"] },
        { id: 3, title: "Work Experience", fields: ["experience", "currentRole", "subjects"] },
      ],
    },
  }

  const currentForm = forms[activeForm]
  const totalSteps = currentForm.steps.length

  const requiredFieldsMap: { [form in FormType]?: { [step: number]: string[] } } = {
    students: {
      1: ["studentPhoto", "name", "gender", "dob", "placeOfBirth", "religion", "motherTongue"],
      2: ["emergencyContact", "zakatStatus", "familyIncome", "houseOwned", "address"],
      3: ["currentState", "campus", "currentGrade", "section"],
    },
    campus: {
      1: [
        "campusName",
        "campusCode",
        "registrationNumber",
        "description",
        "status",
        "governingBody",
        "address",
        "gradesOffered",
        "languagesOfInstruction",
        "academicYearStart",
        "academicYearEnd"
      ],
      2: [
        "campusCapacity",
        "classesPerGrade",
        "averageClassSize",
        "totalStudents",
        "totalTeachers",
        "totalRooms",
        "totalClassrooms",
        "computerLabs",
        "library",
        "facilities"
      ],
      3: [] // Contact & Misc (optional fields: powerBackup, internetAvailability, establishedDate, staffHRContact, admissionOfficeContact)
    },
    teachers: {
      1: ["fullName", "dob", "gender", "contactNumber", "email"],
      2: ["education"],
      3: ["experience", "currentRole", "subjects"],
    },
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImages((prev) => ({ ...prev, [imageKey]: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (imageKey: string) => {
    setUploadedImages((prev) => {
      const newImages = { ...prev }
      delete newImages[imageKey]
      return newImages
    })
  }

  const validateCurrentStep = () => {
    const requiredForStep = requiredFieldsMap[activeForm]?.[currentStep] || []
    const invalid: string[] = []
    const newErrorFields: string[] = []

    for (const field of requiredForStep) {
      // Special case for studentPhoto
      if (field === "studentPhoto") {
        if (!uploadedImages[field]) invalid.push(field)
        continue
      }

      // Special case for toilets: consider valid if male or female counts provided
      if (field === "toilets") {
        const male = formData.maleToilets
        const female = formData.femaleToilets
        if (!male && !female) {
          invalid.push(field)
        }
        continue
      }

      const value = formData[field]
      if (!value || (typeof value === "string" && value.trim() === "")) {
        invalid.push(field)
      }
    }

    // Conditional: determine houseOwned value robustly (formData or DOM)
    let houseOwnedValue = formData.houseOwned
    try {
      if (!houseOwnedValue) {
        const el = document.querySelector('[id=\"houseOwned\"]') as HTMLSelectElement | null
        if (el) houseOwnedValue = el.value
      }
    } catch (e) { }

    if (activeForm === "students" && currentStep === 2 && houseOwnedValue === "no") {
      if (!formData.rent || (typeof formData.rent === "string" && formData.rent.trim() === "")) {
        if (!invalid.includes("rent")) invalid.push("rent")
      }
    }

    // Special-case: if both father and mother missing, guardian fields are required (only for students form)
    if (activeForm === "students" && currentStep === 2) {
      let fatherPresent = Boolean(formData.fatherName)
      let motherPresent = Boolean(formData.motherName)
      try {
        if (!fatherPresent) {
          const f = (document.getElementById("fatherName") as HTMLInputElement | null)?.value
          fatherPresent = Boolean(f && f.trim() !== "")
        }
        if (!motherPresent) {
          const m = (document.getElementById("motherName") as HTMLInputElement | null)?.value
          motherPresent = Boolean(m && m.trim() !== "")
        }
      } catch (e) { }

      if (!fatherPresent && !motherPresent) {
        const guardianRequired = ["guardianName", "guardianCNIC", "guardianOccupation"]
        guardianRequired.forEach((g) => {
          const v = formData[g]
          if (!v || (typeof v === "string" && v.trim() === "")) {
            if (!invalid.includes(g)) invalid.push(g)
            if (!newErrorFields.includes(g)) newErrorFields.push(g)
          }
        })
      }
    }

    setInvalidFields(invalid)
    setErrorFields(newErrorFields)
    return invalid
  }

  const handleStepChange = (step: number) => {
    setInvalidFields([])
    setErrorFields([])
    setCurrentStep(step)
  }

  const humanizeField = (field: string) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b([a-z])/g, (s) => s.toUpperCase())
  }

  const handleNext = () => {
    const invalid = validateCurrentStep()
    if (invalid.length > 0) {
      // show toast with human readable fields
      toast({
        title: "Please fill required fields",
        description: invalid.map(humanizeField).join(", "),
      })
      // Fallback alert for environments where toast may be hidden
      try {
        window.alert("Please fill required fields: " + invalid.map(humanizeField).join(", "))
      } catch (e) { }
      // focus/scroll first invalid field
      const first = invalid[0]
      try {
        if (first === "studentPhoto") {
          fileInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
          fileInputRef.current?.focus()
        } else {
          const el = document.getElementById(first) as HTMLElement | null
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
            try { el.focus() } catch (e) { }
          }
        }
      } catch (e) {
        // ignore
      }
      return
    }
    setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }))
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowPreview(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setFormData({})
    setUploadedImages({})
    setCompletedSteps({})
    setCurrentStep(1)
    setShowPreview(false)
    setShowStudentList(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    // Clear the field from invalid list when user starts typing
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
    if (errorFields.includes(field)) {
      setErrorFields((prev) => prev.filter((f) => f !== field))
    }
  }

  const renderCurrentForm = () => {
    if (activeForm === "students") {
      return renderStudentForm()
    } else if (activeForm === "campus") {
      return renderCampusForm()
    } else if (activeForm === "teachers") {
      return renderTeachersForm()
    }
  }

  const renderStudentForm = () => {
    if (showStudentList) {
      return (
        <Card className="border-2 text-[#274c77]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#274c77]">
              <List className="h-5 w-5" />
              Student List
            </CardTitle>
            <CardDescription className="text-[#274c77]">Manage existing students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <p className="text-[#274c77] mb-4">No students added yet</p>
              <Button 
                onClick={() => setShowStudentList(false)} 
                className="bg-[#274c77] text-white hover:bg-[#1e3a5f]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Student
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

 if (showPreview) {
      return (
        <Card className="border-2 text-[#274c77]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#274c77]">
              <Eye className="h-5 w-5" />
              Student Information Preview
            </CardTitle>
            <CardDescription className="text-[#274c77]">Review all information before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadedImages.studentPhoto && (
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <Label className="text-sm font-medium text-[#274c77] block mb-2">Student Photo</Label>
                  <img
                    src={uploadedImages.studentPhoto || "/placeholder.svg"}
                    alt="Student"
                    className="w-32 h-32 rounded-lg object-cover border-2 mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Personal Details Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2 text-[#274c77]">Personal Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[#274c77]">Full Name</Label>
                  <p className="text-sm font-medium text-[#274c77]">{formData.name || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#274c77]">Gender</Label>
                  <p className="text-sm font-medium text-[#274c77]">{formData.gender || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#274c77]">Date of Birth</Label>
                  <p className="text-sm font-medium text-[#274c77]">{formData.dob || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#274c77]">Place of Birth</Label>
                  <p className="text-sm font-medium text-[#274c77]">{formData.placeOfBirth || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#274c77]">Religion</Label>
                  <p className="text-sm font-medium text-[#274c77]">{formData.religion || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#274c77]">Mother Tongue</Label>
                  <p className="text-sm font-medium text-[#274c77]">{formData.motherTongue || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Contact Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Enter emergency contact number"
                    className={`border-2 focus:border-primary ${invalidFields.includes('emergencyContact') ? 'border-red-500' : ''}`}
                    value={formData.emergencyContact || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, emergencyContact: value })
                    }}
                    required
                  />
                  {invalidFields.includes('emergencyContact') && (
                    <ErrorText>This field is required.</ErrorText>
                  )}
                </div>
                {/* secondaryPhone removed per request */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Father's Name</Label>
                  <p className="text-sm font-medium">{formData.fatherName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Father's CNIC</Label>
                  <p className="text-sm font-medium">{formData.fatherCNIC || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Father's Contact</Label>
                  <p className="text-sm font-medium">{formData.fatherContact || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Father's Occupation</Label>
                  <p className="text-sm font-medium">{formData.fatherOccupation || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Guardian Name</Label>
                  <p className="text-sm font-medium">{formData.guardianName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Guardian CNIC</Label>
                  <p className="text-sm font-medium">{formData.guardianCNIC || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Guardian Occupation</Label>
                  <p className="text-sm font-medium">{formData.guardianOccupation || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mother's Name</Label>
                  <p className="text-sm font-medium">{formData.motherName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mother's CNIC</Label>
                  <p className="text-sm font-medium">{formData.motherCNIC || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mother Status</Label>
                  <p className="text-sm font-medium">{formData.motherStatus || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mother's Contact</Label>
                  <p className="text-sm font-medium">{formData.motherContact || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mother's Occupation</Label>
                  <p className="text-sm font-medium">{formData.motherOccupation || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Zakat Status</Label>
                  <p className="text-sm font-medium">{formData.zakatStatus || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Family Income</Label>
                  <p className="text-sm font-medium">{formData.familyIncome || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">House Owned</Label>
                  <p className="text-sm font-medium">{formData.houseOwned || "Not provided"}</p>
                </div>
                {formData.houseOwned === "no" && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Monthly Rent</Label>
                    <p className="text-sm font-medium">{formData.rent || "Not provided"}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="text-sm font-medium">{formData.address || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Academic Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current State</Label>
                  <p className="text-sm font-medium">{formData.currentState || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campus</Label>
                  <p className="text-sm font-medium">{formData.campus || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Grade/Class</Label>
                  <p className="text-sm font-medium">{formData.currentGrade || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Section</Label>
                  <p className="text-sm font-medium">{formData.section || "Not provided"}</p>
                </div>
                {/* Reason for Transfer removed per request */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">To Year</Label>
                  <p className="text-sm font-medium">{formData.toYear || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">From Year</Label>
                  <p className="text-sm font-medium">{formData.fromYear || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Class Passed</Label>
                  <p className="text-sm font-medium">{formData.lastClassPassed || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last School Name</Label>
                  <p className="text-sm font-medium">{formData.lastSchoolName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Old GR No</Label>
                  <p className="text-sm font-medium">{formData.oldGRNo || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">GR Number</Label>
                  <p className="text-sm font-medium">{formData.grNumber || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t">
              <Button onClick={() => setShowPreview(false)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
              <Button
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => {
                  toast({
                    title: "Success!",
                    description: "Student information saved successfully!",
                  })
                  resetForm()
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Save to Drafts
              </Button>
              <Button variant="outline" onClick={() => setShowStudentList(true)}>
                <List className="h-4 w-4 mr-2" />
                View Student List
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Student
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <Card className="form-card">
            <CardHeader>
              <CardTitle className="form-title">Personal Details</CardTitle>
              <CardDescription className="form-description">Enter the student's personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="form-label">Student Photo *</Label>
                {uploadedImages.studentPhoto ? (
                  <div className="relative inline-block">
                    <img
                      src={uploadedImages.studentPhoto || "/placeholder.svg"}
                      alt="Student"
                      className="w-32 h-32 rounded-lg object-cover border-2"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage("studentPhoto")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-4 p-6 border-2 border-dashed border-border rounded-lg hover:border-primary cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload Student Photo</p>
                      <p className="text-xs text-muted-foreground">Click to upload or drag and drop (JPG, PNG)</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "studentPhoto")}
                />
                {invalidFields.includes('studentPhoto') && (
                  <ErrorText>Student photo is required.</ErrorText>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="form-label">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter student's full name"
                    className={`form-input ${invalidFields.includes('name') ? 'border-red-500' : ''}`}
                    value={formData.name || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, name: value })
                    }}
                    required
                  />
                  {invalidFields.includes('name') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="form-label">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('gender') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('gender') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="form-label">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    className={`form-input ${invalidFields.includes('dob') ? 'border-red-500' : ''}`}
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                  {invalidFields.includes('dob') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth" className="form-label">Place of Birth *</Label>
                  <Input
                    id="placeOfBirth"
                    placeholder="Enter city, state/province"
                    className={`form-input ${invalidFields.includes('placeOfBirth') ? 'border-red-500' : ''}`}
                    value={formData.placeOfBirth || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s,]/g, "")
                      setFormData({ ...formData, placeOfBirth: value })
                    }}
                    required
                  />
                  {invalidFields.includes('placeOfBirth') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="religion" className="form-label">Religion *</Label>
                  <Input
                    id="religion"
                    placeholder="Enter religion"
                    className={`form-input ${invalidFields.includes('religion') ? 'border-red-500' : ''}`}
                    value={formData.religion || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, religion: value })
                    }}
                    required
                  />
                  {invalidFields.includes('religion') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherTongue" className="form-label">Mother Tongue *</Label>
                  <Input
                    id="motherTongue"
                    placeholder="Enter mother tongue"
                    className={`form-input ${invalidFields.includes('motherTongue') ? 'border-red-500' : ''}`}
                    value={formData.motherTongue || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, motherTongue: value })
                    }}
                    required
                  />
                  {invalidFields.includes('motherTongue') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card className="form-card">
            <CardHeader>
              <CardTitle className="form-title">Contact Details</CardTitle>
              <CardDescription className="form-description">Enter contact and family information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="form-label">Emergency Contact Number *</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Enter emergency contact number"
                    className={`form-input ${invalidFields.includes('emergencyContact') ? 'border-red-500' : ''}`}
                    value={formData.emergencyContact || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, emergencyContact: value })
                    }}
                    required
                  />
                  {invalidFields.includes('emergencyContact') && (
                    <span className="text-red-500 text-xs">This field is required.</span>
                  )}
                </div>
                {/* secondaryPhone removed per request */}
              </div>

              <Separator className="form-separator" />
              <h4 className="form-section-title">Father Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName" className="form-label">Father Name</Label>
                  <Input
                    id="fatherName"
                    placeholder="Enter father's full name (leave empty if not available)"
                    className={`form-input ${errorFields.includes("fatherName") ? "border-red-500" : ""
                      }`}
                    value={formData.fatherName || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, fatherName: value })
                      if (errorFields.includes("fatherName")) {
                        setErrorFields(errorFields.filter((field) => field !== "fatherName"))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherCNIC" className="form-label">Father CNIC</Label>
                  <Input
                    id="fatherCNIC"
                    placeholder="Enter father's CNIC (leave empty if not available)"
                    className={`form-input ${errorFields.includes("fatherCNIC") ? "border-red-500" : ""
                      }`}
                    value={formData.fatherCNIC || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9-]/g, "")
                      setFormData({ ...formData, fatherCNIC: value })
                      if (errorFields.includes("fatherCNIC")) {
                        setErrorFields(errorFields.filter((field) => field !== "fatherCNIC"))
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherContact" className="form-label">Father Contact Number</Label>
                  <Input
                    id="fatherContact"
                    placeholder="Enter father's contact number (leave empty if not available)"
                    className={`form-input ${errorFields.includes("fatherContact") ? "border-red-500" : ""
                      }`}
                    value={formData.fatherContact || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, fatherContact: value })
                      if (errorFields.includes("fatherContact")) {
                        setErrorFields(errorFields.filter((field) => field !== "fatherContact"))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherOccupation" className="form-label">Father Occupation</Label>
                  <Input
                    id="fatherOccupation"
                    placeholder="Enter father's occupation (leave empty if not available)"
                    className={`form-input ${errorFields.includes("fatherOccupation") ? "border-red-500" : ""
                      }`}
                    value={formData.fatherOccupation || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, fatherOccupation: value })
                      if (errorFields.includes("fatherOccupation")) {
                        setErrorFields(errorFields.filter((field) => field !== "fatherOccupation"))
                      }
                    }}
                  />
                </div>
              </div>

              {!formData.fatherName && !formData.motherName && (
                <>
                  <Separator className="form-separator" />
                  <h4 className="form-section-title">Guardian Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianName" className="form-label">Guardian Name *</Label>
                      <Input
                        id="guardianName"
                        placeholder="Enter guardian's name"
                        className={`form-input ${errorFields.includes("guardianName") ? "border-red-500" : ""
                          }`}
                        value={formData.guardianName || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                          setFormData({ ...formData, guardianName: value })
                          if (errorFields.includes("guardianName")) {
                            setErrorFields(errorFields.filter((field) => field !== "guardianName"))
                          }
                        }}
                        required
                      />
                      {errorFields.includes("guardianName") && <ErrorText>This field is required.</ErrorText>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianCNIC" className="form-label">Guardian CNIC *</Label>
                      <Input
                        id="guardianCNIC"
                        placeholder="Enter guardian's CNIC"
                        className={`form-input ${errorFields.includes("guardianCNIC") ? "border-red-500" : ""
                          }`}
                        value={formData.guardianCNIC || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9-]/g, "")
                          setFormData({ ...formData, guardianCNIC: value })
                          if (errorFields.includes("guardianCNIC")) {
                            setErrorFields(errorFields.filter((field) => field !== "guardianCNIC"))
                          }
                        }}
                        required
                      />
                      {errorFields.includes("guardianCNIC") && <ErrorText>This field is required.</ErrorText>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianOccupation" className="form-label">Guardian Occupation *</Label>
                    <Input
                      id="guardianOccupation"
                      placeholder="Enter guardian's occupation"
                      className={`form-input ${errorFields.includes("guardianOccupation") ? "border-red-500" : ""
                        }`}
                      value={formData.guardianOccupation || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                        setFormData({ ...formData, guardianOccupation: value })
                        if (errorFields.includes("guardianOccupation")) {
                          setErrorFields(errorFields.filter((field) => field !== "guardianOccupation"))
                        }
                      }}
                      required
                    />
                    {errorFields.includes("guardianOccupation") && <ErrorText>This field is required.</ErrorText>}
                  </div>
                </>
              )}

              <Separator className="form-separator" />
              <h4 className="form-section-title">Mother Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherName" className="form-label">Mother Name</Label>
                  <Input
                    id="motherName"
                    placeholder="Enter mother's full name (leave empty if not available)"
                    className={`form-input ${errorFields.includes("motherName") ? "border-red-500" : ""
                      }`}
                    value={formData.motherName || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, motherName: value })
                      if (errorFields.includes("motherName")) {
                        setErrorFields(errorFields.filter((field) => field !== "motherName"))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherCNIC" className="form-label">Mother CNIC</Label>
                  <Input
                    id="motherCNIC"
                    placeholder="Enter mother's CNIC (leave empty if not available)"
                    className={`form-input ${errorFields.includes("motherCNIC") ? "border-red-500" : ""
                      }`}
                    value={formData.motherCNIC || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9-]/g, "")
                      setFormData({ ...formData, motherCNIC: value })
                      if (errorFields.includes("motherCNIC")) {
                        setErrorFields(errorFields.filter((field) => field !== "motherCNIC"))
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherStatus" className="form-label">Mother Status</Label>
                  <Select
                    value={formData.motherStatus}
                    onValueChange={(value) => setFormData({ ...formData, motherStatus: value })}
                  >
                    <SelectTrigger
                      className={`form-select ${errorFields.includes("motherStatus") ? "border-red-500" : ""
                        }`}
                    >
                      <SelectValue placeholder="Select mother's status (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherContact" className="form-label">Mother Contact Number</Label>
                  <Input
                    id="motherContact"
                    placeholder="Enter mother's contact number (optional)"
                    className={`form-input ${errorFields.includes("motherContact") ? "border-red-500" : ""
                      }`}
                    value={formData.motherContact || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, motherContact: value })
                      if (errorFields.includes("motherContact")) {
                        setErrorFields(errorFields.filter((field) => field !== "motherContact"))
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherOccupation" className="form-label">Mother Occupation</Label>
                <Input
                  id="motherOccupation"
                  placeholder="Enter mother's occupation (optional)"
                  className={`form-input ${errorFields.includes("motherOccupation") ? "border-red-500" : ""
                    }`}
                  value={formData.motherOccupation || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                    setFormData({ ...formData, motherOccupation: value })
                    if (errorFields.includes("motherOccupation")) {
                      setErrorFields(errorFields.filter((field) => field !== "motherOccupation"))
                    }
                  }}
                />
              </div>

              <Separator className="form-separator" />
              <h4 className="form-section-title">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zakatStatus" className="form-label">Zakat Status *</Label>
                  <Select
                    value={formData.zakatStatus}
                    onValueChange={(value) => setFormData({ ...formData, zakatStatus: value })}
                    required
                  >
                    <SelectTrigger className="form-select">
                      <SelectValue placeholder="Select zakat status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applicable">Applicable</SelectItem>
                      <SelectItem value="not-applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyIncome" className="form-label">Family Income *</Label>
                  <Input
                    id="familyIncome"
                    placeholder="Enter monthly family income"
                    className="form-input"
                    value={formData.familyIncome || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, familyIncome: value })
                    }}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="houseOwned" className="form-label">House Owned *</Label>
                  <Select
                    value={formData.houseOwned}
                    onValueChange={(value) => setFormData({ ...formData, houseOwned: value })}
                    required
                  >
                    <SelectTrigger className="form-select">
                      <SelectValue placeholder="Select house ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.houseOwned === "no" && (
                  <div className="space-y-2">
                    <Label htmlFor="rent" className="form-label">Monthly Rent *</Label>
                    <Input
                      id="rent"
                      placeholder="Enter monthly rent amount (e.g., 8000)"
                      className="form-input"
                      value={formData.rent || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setFormData({ ...formData, rent: value })
                      }}
                      required
                    />
                    {invalidFields.includes('rent') && <ErrorText>This field is required.</ErrorText>}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="form-label">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete residential address"
                  className="form-textarea min-h-[100px]"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card className="form-card">
            <CardHeader>
              <CardTitle className="form-title">Academic Details</CardTitle>
              <CardDescription className="form-description">Enter academic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentState" className="form-label">Current State *</Label>
                  <Select
                    value={formData.currentState}
                    onValueChange={(value) => setFormData({ ...formData, currentState: value })}
                    required
                  >
                    <SelectTrigger className="form-select">
                      <SelectValue placeholder="Select current state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="not-active">Not Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campus" className="form-label">Campus *</Label>
                  <Select
                    value={formData.campus}
                    onValueChange={(value) => setFormData({ ...formData, campus: value })}
                    required
                  >
                    <SelectTrigger className="form-select">
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Campus 1</SelectItem>
                      <SelectItem value="2">Campus 2</SelectItem>
                      <SelectItem value="2">Campus 3</SelectItem>
                      <SelectItem value="4">Campus 4</SelectItem>
                      <SelectItem value="5">Campus 5</SelectItem>
                      <SelectItem value="6">Campus 6</SelectItem>
                      <SelectItem value="7">Campus 7</SelectItem>
                      <SelectItem value="8">Campus 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentGrade" className="form-label">Current Grade/Class *</Label>
                  <Input
                    id="currentGrade"
                    placeholder="Enter current grade/class"
                    className="form-input"
                    value={formData.currentGrade || ""}
                    onChange={(e) => setFormData({ ...formData, currentGrade: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section" className="form-label">Section *</Label>
                  <Input
                    id="section"
                    placeholder="Enter section"
                    className="form-input"
                    value={formData.section || ""}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                  />
                </div>
              </div>
              {/* reasonForTransfer removed from form per request */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toYear" className="form-label">To Year *</Label>
                  <Input
                    id="toYear"
                    type="number"
                    placeholder="Enter year"
                    className="form-input"
                    value={formData.toYear || ""}
                    onChange={(e) => setFormData({ ...formData, toYear: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromYear" className="form-label">From Year *</Label>
                  <Input
                    id="fromYear"
                    type="number"
                    placeholder="Enter year"
                    className="form-input"
                    value={formData.fromYear || ""}
                    onChange={(e) => setFormData({ ...formData, fromYear: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastClassPassed" className="form-label">Last Class Passed *</Label>
                  <Input
                    id="lastClassPassed"
                    placeholder="Enter last class passed"
                    className="form-input"
                    value={formData.lastClassPassed || ""}
                    onChange={(e) => setFormData({ ...formData, lastClassPassed: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastSchoolName" className="form-label">Last School Name *</Label>
                  <Input
                    id="lastSchoolName"
                    placeholder="Enter last school name"
                    className="form-input"
                    value={formData.lastSchoolName || ""}
                    onChange={(e) => setFormData({ ...formData, lastSchoolName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oldGRNo" className="form-label">Old GR No *</Label>
                  <Input
                    id="oldGRNo"
                    placeholder="Enter old GR No"
                    className="form-input"
                    value={formData.oldGRNo || ""}
                    onChange={(e) => setFormData({ ...formData, oldGRNo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grNumber" className="form-label">GR Number *</Label>
                  <Input
                    id="grNumber"
                    placeholder="Enter GR Number"
                    className="form-input"
                    value={formData.grNumber || ""}
                    onChange={(e) => setFormData({ ...formData, grNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const renderCampusForm = () => {
    if (showPreview) {
      return (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Campus Information Preview
            </CardTitle>
            <CardDescription>Review all information before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">General Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campus Name</Label>
                  <p className="text-sm font-medium">{formData.campusName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campus Code</Label>
                  <p className="text-sm font-medium">{formData.campusCode || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                  <p className="text-sm font-medium">{formData.registrationNumber || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="text-sm font-medium">{formData.status || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Governing Body</Label>
                  <p className="text-sm font-medium">{formData.governingBody || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campus Address</Label>
                  <p className="text-sm font-medium">{formData.address || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Academic Year</Label>
                  <p className="text-sm font-medium">{formData.academicYearStart && formData.academicYearEnd ? `${formData.academicYearStart} - ${formData.academicYearEnd}` : "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Grades Offered</Label>
                  <p className="text-sm font-medium">{formData.gradesOffered || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Languages of Instruction</Label>
                  <p className="text-sm font-medium">{formData.languagesOfInstruction || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm font-medium">{formData.description || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Campus Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campus Capacity</Label>
                  <p className="text-sm font-medium">{formData.campusCapacity || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Classes per Grade</Label>
                  <p className="text-sm font-medium">{formData.classesPerGrade || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Average Class Size</Label>
                  <p className="text-sm font-medium">{formData.averageClassSize || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Students</Label>
                  <p className="text-sm font-medium">{formData.totalStudents || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Teachers</Label>
                  <p className="text-sm font-medium">{formData.totalTeachers || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Rooms</Label>
                  <p className="text-sm font-medium">{formData.totalRooms || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Classrooms</Label>
                  <p className="text-sm font-medium">{formData.totalClassrooms || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Science Labs</Label>
                  <p className="text-sm font-medium">{formData.scienceLabs || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Computer Labs</Label>
                  <p className="text-sm font-medium">{formData.computerLabs || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Library</Label>
                  <p className="text-sm font-medium">{formData.library || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Toilets</Label>
                  <p className="text-sm font-medium">
                    {formData.maleToilets || formData.femaleToilets ?
                      `Male: ${formData.maleToilets || '0'}, Female: ${formData.femaleToilets || '0'}`
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Power Backup</Label>
                  <p className="text-sm font-medium">{formData.powerBackup || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Internet Availability</Label>
                  <p className="text-sm font-medium">{formData.internetAvailability || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Established Date</Label>
                  <p className="text-sm font-medium">{formData.establishedDate || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">HR Contact</Label>
                  <p className="text-sm font-medium">{formData.staffHRContact || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Admission Contact</Label>
                  <p className="text-sm font-medium">{formData.admissionOfficeContact || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Power Backup</Label>
                  <p className="text-sm font-medium">{formData.powerBackup || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Additional Facilities</Label>
                  <p className="text-sm font-medium">{formData.facilities || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Contact & Misc</h4>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">HR Contact</Label>
                  <p className="text-sm font-medium">{formData.staffHRContact || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Admission Contact</Label>
                  <p className="text-sm font-medium">{formData.admissionOfficeContact || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t">
              <Button onClick={() => setShowPreview(false)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
              <Button
                className="bg-white text-black hover:cursor-pointer"
                variant={"outline"}
                onClick={() => {
                  // Check if all required fields across all steps are filled
                  const stepsCount = currentForm.steps.length
                  const allRequired: string[] = []
                  for (let s = 1; s <= stepsCount; s++) {
                    const req = requiredFieldsMap[activeForm]?.[s] || []
                    allRequired.push(...req)
                  }
                  const missingFields = allRequired.filter(field => !formData[field])
                  
                  if (missingFields.length === 0) {
                    toast({
                      title: "Success!",
                      description: "Campus information saved successfully!",
                    });
                    resetForm();
                  } else {
                    toast({
                      title: "Warning",
                      description: "Some required fields are missing. Please save as draft instead.",
                      variant: "destructive"
                    });
                  }
                }}
                >
                <Save className="h-4 w-4 mr-2 text-black" />
                Save
              </Button>
              <Button className="bg-white text-black hover:cursor-pointer"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Draft Saved",
                    description: "Campus information saved as draft. You can complete it later.",
                  });
                  resetForm();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Save to Drafts
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Enter basic campus information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campusName" className="form-label">Campus Name *</Label>
                  <Input
                    id="campusName"
                    placeholder="Enter campus name"
                    className={`form-input ${invalidFields.includes('campusName') ? 'border-red-500' : ''}`}
                    value={formData.campusName || ""}
                    onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                    required
                  />
                  {invalidFields.includes('campusName') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campusCode" className="form-label">Campus Code *</Label>
                  <Input
                    id="campusCode"
                    placeholder="Enter campus code"
                    className={`form-input ${invalidFields.includes('campusCode') ? 'border-red-500' : ''}`}
                    value={formData.campusCode || ""}
                    onChange={(e) => setFormData({ ...formData, campusCode: e.target.value })}
                    required
                  />
                  {invalidFields.includes('campusCode') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="form-label">Registration Number / License No *</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Enter registration number"
                    className={`form-input ${invalidFields.includes('registrationNumber') ? 'border-red-500' : ''}`}
                    value={formData.registrationNumber || ""}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                  />
                  {invalidFields.includes('registrationNumber') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="form-label">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter campus description"
                  className={`form-textarea min-h-[100px] ${invalidFields.includes('description') ? 'border-red-500' : ''}`}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {invalidFields.includes('description') && <ErrorText>This field is required.</ErrorText>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="form-label">Status *</Label>
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('status') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="under-construction">Under Construction</SelectItem>
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('status') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governingBody" className="form-label">Governing Body *</Label>
                  <Input
                    id="governingBody"
                    placeholder="Enter governing body"
                    className={`form-input ${invalidFields.includes('governingBody') ? 'border-red-500' : ''}`}
                    value={formData.governingBody || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, governingBody: value })
                    }}
                    required
                  />
                  {invalidFields.includes('governingBody') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="form-label">Campus Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter campus address"
                  className={`form-textarea ${invalidFields.includes('address') ? 'border-red-500' : ''}`}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                {invalidFields.includes('address') && <ErrorText>This field is required.</ErrorText>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYearStart" className="form-label">Academic Year Start *</Label>
                  <Select
                    value={formData.academicYearStart || ""}
                    onValueChange={(value) => setFormData({ ...formData, academicYearStart: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('academicYearStart') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select start month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"].map(month => (
                          <SelectItem key={month.toLowerCase()} value={month.toLowerCase()}>{month}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('academicYearStart') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYearEnd" className="form-label">Academic Year End *</Label>
                  <Select
                    value={formData.academicYearEnd || ""}
                    onValueChange={(value) => setFormData({ ...formData, academicYearEnd: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('academicYearEnd') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select end month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"].map(month => (
                          <SelectItem key={month.toLowerCase()} value={month.toLowerCase()}>{month}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('academicYearEnd') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradesOffered" className="form-label">Grades Offered *</Label>
                  <Select
                    value={formData.gradesOffered || ""}
                    onValueChange={(value) => setFormData({ ...formData, gradesOffered: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('gradesOffered') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select grades" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Primary (1-5)", "Elementary (6-8)", "Secondary (9-10)", "Higher Secondary (11-12)", "All Levels"].map(grade => (
                        <SelectItem key={grade.toLowerCase()} value={grade.toLowerCase()}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('gradesOffered') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languagesOfInstruction" className="form-label">Language(s) of Instruction *</Label>
                  <Select
                    value={formData.languagesOfInstruction || ""}
                    onValueChange={(value) => setFormData({ ...formData, languagesOfInstruction: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('languagesOfInstruction') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="urdu">Urdu</SelectItem>
                      <SelectItem value="both">Both (English & Urdu)</SelectItem>
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('languagesOfInstruction') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card className="form-card">
            <CardHeader>
              <CardTitle className="form-title">Facilities</CardTitle>
              <CardDescription className="form-description">Enter campus facilities information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalClassrooms" className="form-label">Total Classrooms *</Label>
                  <Input
                    id="totalClassrooms"
                    placeholder="Enter number of classrooms"
                    className={`form-input ${invalidFields.includes('totalClassrooms') ? 'border-red-500' : ''}`}
                    value={formData.totalClassrooms || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, totalClassrooms: value })
                    }}
                    required
                  />
                  {invalidFields.includes('totalClassrooms') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scienceLabs" className="form-label">Science Labs *</Label>
                  <Input
                    id="scienceLabs"
                    placeholder="Enter number of science labs"
                    className={`form-input ${invalidFields.includes('scienceLabs') ? 'border-red-500' : ''}`}
                    value={formData.scienceLabs || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, scienceLabs: value })
                    }}
                    required
                  />
                  {invalidFields.includes('scienceLabs') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="computerLabs" className="form-label">Computer Labs *</Label>
                  <Input
                    id="computerLabs"
                    placeholder="Enter number of computer labs"
                    className={`form-input ${invalidFields.includes('computerLabs') ? 'border-red-500' : ''}`}
                    value={formData.computerLabs || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, computerLabs: value })
                    }}
                    required
                  />
                  {invalidFields.includes('computerLabs') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library" className="form-label">Library *</Label>
                  <Select
                    value={formData.library}
                    onValueChange={(value) => setFormData({ ...formData, library: value })}
                    required
                  >
                    <SelectTrigger className={`form-select ${invalidFields.includes('library') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select library availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('library') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campusCapacity" className="form-label">Campus Capacity (students) *</Label>
                  <Input
                    id="campusCapacity"
                    placeholder="Enter campus capacity"
                    className={`form-input ${invalidFields.includes('campusCapacity') ? 'border-red-500' : ''}`}
                    value={formData.campusCapacity || ""}
                    onChange={(e) => setFormData({ ...formData, campusCapacity: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('campusCapacity') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classesPerGrade" className="form-label">Classes per Grade *</Label>
                  <Input
                    id="classesPerGrade"
                    placeholder="Enter classes per grade"
                    className={`form-input ${invalidFields.includes('classesPerGrade') ? 'border-red-500' : ''}`}
                    value={formData.classesPerGrade || ""}
                    onChange={(e) => setFormData({ ...formData, classesPerGrade: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('classesPerGrade') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageClassSize" className="form-label">Average Class Size (current) *</Label>
                  <Input
                    id="averageClassSize"
                    placeholder="Enter average class size"
                    className={`form-input ${invalidFields.includes('averageClassSize') ? 'border-red-500' : ''}`}
                    value={formData.averageClassSize || ""}
                    onChange={(e) => setFormData({ ...formData, averageClassSize: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('averageClassSize') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalStudents" className="form-label">No of Students *</Label>
                  <Input
                    id="totalStudents"
                    placeholder="Enter total students"
                    className={`form-input ${invalidFields.includes('totalStudents') ? 'border-red-500' : ''}`}
                    value={formData.totalStudents || ""}
                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('totalStudents') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalTeachers" className="form-label">No of Teachers *</Label>
                  <Input
                    id="totalTeachers"
                    placeholder="Enter total teachers"
                    className={`form-input ${invalidFields.includes('totalTeachers') ? 'border-red-500' : ''}`}
                    value={formData.totalTeachers || ""}
                    onChange={(e) => setFormData({ ...formData, totalTeachers: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('totalTeachers') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalRooms" className="form-label">No of Rooms *</Label>
                  <Input
                    id="totalRooms"
                    placeholder="Enter total rooms"
                    className={`form-input ${invalidFields.includes('totalRooms') ? 'border-red-500' : ''}`}
                    value={formData.totalRooms || ""}
                    onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('totalRooms') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maleToilets" className="form-label">Toilets (Male)</Label>
                  <Input
                    id="maleToilets"
                    placeholder="Number of male toilets"
                    className={`form-input ${invalidFields.includes('maleToilets') ? 'border-red-500' : ''}`}
                    value={formData.maleToilets || ""}
                    onChange={(e) => setFormData({ ...formData, maleToilets: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="femaleToilets" className="form-label">Toilets (Female)</Label>
                  <Input
                    id="femaleToilets"
                    placeholder="Number of female toilets"
                    className={`form-input ${invalidFields.includes('femaleToilets') ? 'border-red-500' : ''}`}
                    value={formData.femaleToilets || ""}
                    onChange={(e) => setFormData({ ...formData, femaleToilets: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilities" className="form-label">Additional Facilities *</Label>
                <Textarea
                  id="facilities"
                  placeholder="Enter additional facilities (playground, cafeteria, etc.)"
                  className={`form-textarea min-h-[100px] ${invalidFields.includes('facilities') ? 'border-red-500' : ''}`}
                  value={formData.facilities || ""}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  required
                />
                {invalidFields.includes('facilities') && <ErrorText>This field is required.</ErrorText>}
              </div>
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Contact & Misc</CardTitle>
              <CardDescription>Optional contact and miscellaneous information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="powerBackup">Power Backup</Label>
                  <Select
                    value={formData.powerBackup || ""}
                    onValueChange={(value) => setFormData({ ...formData, powerBackup: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internetAvailability">Internet Availability</Label>
                  <Select
                    value={formData.internetAvailability || ""}
                    onValueChange={(value) => setFormData({ ...formData, internetAvailability: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="establishedDate">Established Date</Label>
                  <Input
                    id="establishedDate"
                    type="date"
                    value={formData.establishedDate || ""}
                    onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffHRContact">Staff HR Contact</Label>
                  <Input
                    id="staffHRContact"
                    placeholder="Enter staff HR contact"
                    value={formData.staffHRContact || ""}
                    onChange={(e) => setFormData({ ...formData, staffHRContact: e.target.value })}
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionOfficeContact">Admission Office Contact</Label>
                <Input
                  id="admissionOfficeContact"
                  placeholder="Enter admission office contact"
                  value={formData.admissionOfficeContact || ""}
                  onChange={(e) => setFormData({ ...formData, admissionOfficeContact: e.target.value })}
                  className="border-2 focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  const renderTeachersForm = () => {
    if (showPreview) {
      return (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Eye className="h-5 w-5" />
              Teacher Information Preview
            </CardTitle>
            <CardDescription>Review all information before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2 text-[#274c77]">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground text-[#274c77]">Full Name</Label>
                  <p className="text-sm font-medium">{formData.fullName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground text-[#274c77]">Date of Birth</Label>
                  <p className="text-sm font-medium">{formData.dob || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground text-[#274c77]">Gender</Label>
                  <p className="text-sm font-medium">{formData.gender || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground text-[#274c77]">Contact Number</Label>
                  <p className="text-sm font-medium">{formData.contactNumber || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground text-[#274c77]">Email</Label>
                  <p className="text-sm font-medium">{formData.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2 text-[#274c77]">Educational Qualifications</h4>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Education</Label>
                <p className="text-sm font-medium">{formData.education || "Not provided"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Work Experience</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Role</Label>
                  <p className="text-sm font-medium">{formData.currentRole || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subjects</Label>
                  <p className="text-sm font-medium">{formData.subjects || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                  <p className="text-sm font-medium">{formData.experience || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t">
              <Button onClick={() => setShowPreview(false)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
              <Button
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => {
                  toast({
                    title: "Success!",
                    description: "Teacher information saved successfully!",
                  })
                  resetForm()
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Save to Drafts
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    }

    // Teacher Form Steps - converted to structured entries (educationEntries, experienceEntries) + summary

    // helper accessors stored on formData to keep compatibility with preview keys
    const educationEntries = formData.educationEntries || []
    const experienceEntries = formData.experienceEntries || []

    const addEducationEntry = () => {
      const entry = { id: `edu-${Date.now()}`, level: "Graduation", institution: "", year: "", subjects: "", grade: "" }
      const next = [...educationEntries, entry]
      setFormData({ ...formData, educationEntries: next, education: next.map((e: any) => `${e.level} - ${e.institution}`).join("; ") })
    }

    const updateEducationEntry = (id: string, patch: Partial<any>) => {
      const next = educationEntries.map((e: any) => (e.id === id ? { ...e, ...patch } : e))
      setFormData({ ...formData, educationEntries: next, education: next.map((e: any) => `${e.level} - ${e.institution}`).join("; ") })
    }

    const removeEducationEntry = (id: string) => {
      const next = educationEntries.filter((e: any) => e.id !== id)
      setFormData({ ...formData, educationEntries: next, education: next.map((e: any) => `${e.level} - ${e.institution}`).join("; ") })
    }

    const addExperienceEntry = () => {
      const entry = { id: `exp-${Date.now()}`, institution: "", position: "", from: "", to: "", subjects: "", responsibilities: "" }
      const next = [...experienceEntries, entry]
      setFormData({ ...formData, experienceEntries: next, experience: next.map((x: any) => `${x.position || ''} @ ${x.institution}`).join("; ") })
    }

    const updateExperienceEntry = (id: string, patch: Partial<any>) => {
      const next = experienceEntries.map((x: any) => (x.id === id ? { ...x, ...patch } : x))
      setFormData({ ...formData, experienceEntries: next, experience: next.map((x: any) => `${x.position || ''} @ ${x.institution}`).join("; ") })
    }

    const removeExperienceEntry = (id: string) => {
      const next = experienceEntries.filter((x: any) => x.id !== id)
      setFormData({ ...formData, experienceEntries: next, experience: next.map((x: any) => `${x.position || ''} @ ${x.institution}`).join("; ") })
    }

    const totalExperienceYears = (experienceEntries as any[]).reduce((sum, x) => {
      try {
        if (!x.from || !x.to) return sum
        const fromY = new Date(x.from).getFullYear()
        const toY = new Date(x.to).getFullYear()
        return sum + Math.max(0, toY - fromY)
      } catch (e) {
        return sum
      }
    }, 0)

    switch (currentStep) {
      case 1:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter teacher's personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter teacher's full name"
                  className={`border-2 focus:border-primary ${invalidFields.includes('fullName') ? 'border-red-500' : ''}`}
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                  required
                />
                {invalidFields.includes('fullName') && <ErrorText>This field is required.</ErrorText>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    className={`border-2 focus:border-primary ${invalidFields.includes('dob') ? 'border-red-500' : ''}`}
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                  {invalidFields.includes('dob') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender || ""} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('gender') ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {invalidFields.includes('gender') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    placeholder="Enter contact number"
                    className={`border-2 focus:border-primary ${invalidFields.includes('contactNumber') ? 'border-red-500' : ''}`}
                    value={formData.contactNumber || ""}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/[^0-9]/g, "") })}
                    required
                  />
                  {invalidFields.includes('contactNumber') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    className={`border-2 focus:border-primary ${invalidFields.includes('email') ? 'border-red-500' : ''}`}
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {invalidFields.includes('email') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="permanentAddress">Permanent Address</Label>
                <Textarea id="permanentAddress" placeholder="Permanent address" value={formData.permanentAddress || ""} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAddress">Current Address (if different)</Label>
                <Textarea id="currentAddress" placeholder="Current address" value={formData.currentAddress || ""} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select value={formData.maritalStatus || ""} onValueChange={(v) => setFormData({ ...formData, maritalStatus: v })}>
                  <SelectTrigger className="border-2 focus:border-primary">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Educational Qualifications</CardTitle>
              <CardDescription>Add one or more education entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(educationEntries.length === 0) && (
                <div className="text-sm text-muted-foreground">No education entries yet — add one.</div>
              )}
              {educationEntries.map((ed: any) => (
                <Card key={ed.id} className="bg-muted/5">
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{ed.level || 'Education'}</div>
                      <div>
                        <Button size="sm" variant="outline" onClick={() => removeEducationEntry(ed.id)}>Remove</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Level</Label>
                        <Select value={ed.level || ""} onValueChange={(v) => updateEducationEntry(ed.id, { level: v })}>
                          <SelectTrigger className="border-2 focus:border-primary">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Secondary">Secondary</SelectItem>
                            <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                            <SelectItem value="Graduation">Graduation</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="M.Phil">M.Phil</SelectItem>
                            <SelectItem value="Ph.D.">Ph.D.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={ed.institution || ""}
                          onChange={(e) => updateEducationEntry(ed.id, { institution: e.target.value })}
                          className={`${invalidFields.includes('education') && (!ed.institution || ed.institution.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('education') && (!ed.institution || ed.institution.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>

                      <div>
                        <Label>Year of Passing</Label>
                        <Input
                          value={ed.year || ""}
                          onChange={(e) => updateEducationEntry(ed.id, { year: e.target.value })}
                          className={`${invalidFields.includes('education') && (!ed.year || ed.year.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('education') && (!ed.year || ed.year.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>
                      <div>
                        <Label>Subjects / Specialization</Label>
                        <Input
                          value={ed.subjects || ""}
                          onChange={(e) => updateEducationEntry(ed.id, { subjects: e.target.value })}
                          className={`${invalidFields.includes('education') && (!ed.subjects || ed.subjects.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('education') && (!ed.subjects || ed.subjects.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>

                      <div className="col-span-2">
                        <Label>Grade / Percentage</Label>
                        <Input
                          value={ed.grade || ""}
                          onChange={(e) => updateEducationEntry(ed.id, { grade: e.target.value })}
                          className={`${invalidFields.includes('education') && (!ed.grade || ed.grade.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('education') && (!ed.grade || ed.grade.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div>
                <Button onClick={addEducationEntry}>+ Add Education</Button>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Add one or more work experience entries and finalize summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(experienceEntries.length === 0) && (
                <div className="text-sm text-muted-foreground">No experience entries yet — add one.</div>
              )}

              {experienceEntries.map((ex: any) => (
                <Card key={ex.id} className="bg-muted/5">
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{ex.position || 'Experience'}</div>
                      <div>
                        <Button size="sm" variant="outline" onClick={() => removeExperienceEntry(ex.id)}>Remove</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={ex.institution || ""}
                          onChange={(e) => updateExperienceEntry(ex.id, { institution: e.target.value })}
                          className={`${invalidFields.includes('experience') && (!ex.institution || ex.institution.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('experience') && (!ex.institution || ex.institution.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>
                      <div>
                        <Label>Position / Designation</Label>
                        <Input
                          value={ex.position || ""}
                          onChange={(e) => updateExperienceEntry(ex.id, { position: e.target.value })}
                          className={`${invalidFields.includes('experience') && (!ex.position || ex.position.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('experience') && (!ex.position || ex.position.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>

                      <div>
                        <Label>From</Label>
                        <Input
                          type="date"
                          value={ex.from || ""}
                          onChange={(e) => updateExperienceEntry(ex.id, { from: e.target.value })}
                          className={`${invalidFields.includes('experience') && (!ex.from || ex.from.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('experience') && (!ex.from || ex.from.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>
                      <div>
                        <Label>To</Label>
                        <Input
                          type="date"
                          value={ex.to || ""}
                          onChange={(e) => updateExperienceEntry(ex.id, { to: e.target.value })}
                          className={`${invalidFields.includes('experience') && (!ex.to || ex.to.trim() === '') ? 'border-red-500' : ''}`}
                        />
                        {invalidFields.includes('experience') && (!ex.to || ex.to.trim() === '') && (
                          <ErrorText>This field is required.</ErrorText>
                        )}
                      </div>

                      <div>
                        <Label>Subjects / Classes Taught</Label>
                        <Input value={ex.subjects || ""} onChange={(e) => updateExperienceEntry(ex.id, { subjects: e.target.value })} />
                      </div>
                      <div>
                        <Label>Total Years (auto)</Label>
                        <Input readOnly value={ex.from && ex.to ? String(Math.max(0, new Date(ex.to).getFullYear() - new Date(ex.from).getFullYear())) : ""} />
                      </div>

                      <div className="col-span-2">
                        <Label>Responsibilities / Assignments</Label>
                        <Textarea value={ex.responsibilities || ""} onChange={(e) => updateExperienceEntry(ex.id, { responsibilities: e.target.value })} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div>
                <Button onClick={addExperienceEntry}>+ Add Experience</Button>
              </div>

              {/* Summary fields (currentRole, classes/sections, subjects taught, additional responsibilities) */}
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input id="currentRole" value={formData.currentRole || ""} onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="classesSections">Classes & Sections Taught</Label>
                    <Select value={formData.classesSections || ""} onValueChange={(v) => setFormData({ ...formData, classesSections: v })}>
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select</SelectItem>
                        <SelectItem value="Nursery - A">Nursery - A</SelectItem>
                        <SelectItem value="1st - A">1st - A</SelectItem>
                        <SelectItem value="1st - B">1st - B</SelectItem>
                        <SelectItem value="All">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor="subjectsTaught">Subjects Taught</Label>
                  <Input id="subjectsTaught" value={formData.subjectsTaught || formData.subjects || ""} onChange={(e) => setFormData({ ...formData, subjectsTaught: e.target.value, subjects: e.target.value })} placeholder="Comma separated" />
                </div>

                <div className="mt-3">
                  <Label htmlFor="additionalResponsibilities">Additional Responsibilities</Label>
                  <Textarea id="additionalResponsibilities" value={formData.additionalResponsibilities || ""} onChange={(e) => setFormData({ ...formData, additionalResponsibilities: e.target.value })} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Years of Experience</Label>
                    <Input readOnly value={String(totalExperienceYears)} />
                  </div>
                  <div className="flex items-end">
                    <Button className="ml-auto bg-secondary hover:bg-secondary/90" onClick={() => {
                      // keep summary fields in formData for preview/save
                      setFormData({ ...formData, totalExperienceYears, currentRole: formData.currentRole || "", subjects: formData.subjectsTaught || formData.subjects || "" })
                      // simple success toast could be shown by caller
                      alert('Summary updated')
                    }}>Update Summary</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 w-[20%] h-screen bg-[#274c77] z-10 overflow-y-auto">
        <div className="p-6">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/logo.png" 
              alt="School Logo" 
              className="w-16 h-16 object-contain mb-3"
            />
            <h1 className="text-lg font-bold text-white text-center leading-tight">
              School Management System
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <Link href="/main-dashboard-sms" className="w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-14 text-white font-semibold text-base hover:bg-white/10 hover:border-l-4 hover:border-white transition-all duration-300 ease-in-out"
              >
                <TrendingUp className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>

            {Object.entries(forms).map(([key, form]) => {
              const Icon = form.icon
              return (
                <Button
                  key={key}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-14 text-white font-semibold text-base hover:bg-white/10 hover:border-l-4 hover:border-white transition-all duration-300 ease-in-out"
                  onClick={() => {
                    setActiveForm(key as FormType)
                    resetForm()
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {form.title}
                </Button>
              )
            })}

{/* Quick-select dropdown for Add Students */}
{activeForm === "students" && (
  <div className="pt-4">
    <Label htmlFor="quickName" className="text-sm text-white font-semibold">
      Students Portal
    </Label>
    <Select
      onValueChange={(value) => {
        if (value === "student-list") router.push("/students/student-list")
        if (value === "update-student") router.push("/students/update-student")
        if (value === "transfer-modal") router.push("/students/transfer-module")
        if (value === "student-termination") router.push("/students/termination-certificate")
        if (value === "student-leaving") router.push("/students/leaving-certificate")
        if (value === "student-profile") router.push("/students/profile")
      }}
    >
      <SelectTrigger className="border-2 border-white/30 focus:border-white bg-transparent text-white w-full">
        <SelectValue placeholder="More About Student Portal" className="text-white" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="student-list">Student List</SelectItem>
        <SelectItem value="transfer-modal">Student Transfer Module</SelectItem>
        <SelectItem value="student-termination">Termination Certificate</SelectItem>
        <SelectItem value="student-leaving">Leaving Certificate</SelectItem>
        <SelectItem value="student-profile">Student Profile</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

{/* Quick-select dropdown for Teachers */}
{activeForm === "teachers" && (
  <div className="pt-4">
    <Label htmlFor="teacherQuick" className="text-sm text-white font-semibold">
      Teachers Portal
    </Label>
    <Select
      onValueChange={(value) => {
        if (value === "teacher-list") router.push("/teachers/list")
        if (value === "teacher-profile") router.push("/teachers/profile")
      }}
    >
      <SelectTrigger className="border-2 border-white/30 focus:border-white bg-transparent text-white w-full">
        <SelectValue placeholder="More About Teacher Portal" className="text-white" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="teacher-list">Teacher List</SelectItem>
        <SelectItem value="teacher-profile">Teacher Profile</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

{/* Quick-select dropdown for Campus */}
{activeForm === "campus" && (
  <div className="pt-4">
    <Label htmlFor="campusQuick" className="text-sm text-white font-semibold">
      Campus Portal
    </Label>
    <Select
      onValueChange={(value) => {
        if (value === "campus-list") router.push("/campus/list")
        if (value === "campus-profile") router.push("/campus/profile")
      }}
    >
      <SelectTrigger className="border-2 border-white/30 focus:border-white bg-transparent text-white w-full">
        <SelectValue placeholder="More About Campus Portal" className="text-white" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="campus-list">Campus List</SelectItem>
        <SelectItem value="campus-profile">Campus Profile</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-[20%] min-h-screen">
        <div className="p-6">
          {/* Dynamic Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {/* {React.createElement(currentForm.icon, { className: "h-8 w-8 text-[#274c77]" })} */}
              <h1 
                className="text-5xl font-bold italic"
                style={{
                  background: "linear-gradient(135deg, #274c77 0%, #a3cef1 50%, #e7ecef 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                {currentForm.title}
              </h1>
            </div>
          </div>

          <div className="space-y-6">
            {renderCurrentForm()}

            {!showPreview && !showStudentList && (
              <div className="flex justify-between">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={handleNext} className="flex items-center gap-2">
                  {currentStep === totalSteps ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Preview
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress Section - Moved to Bottom */}
            {!showPreview && !showStudentList && (
              <Card className="border-0 bg-gray-100">
                <CardHeader>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-[#274c77]">Progress</CardTitle>
                        <CardDescription className="text-sm text-[#274c77]">Step {currentStep} of {totalSteps}</CardDescription>
                      </div>
                      <div className="text-sm text-[#274c77]">{currentForm.title}</div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(currentStep / totalSteps) * 100}%`,
                            background: "linear-gradient(90deg, #a3cef1 0%, #274c77 100%)"
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 gap-2">
                        {currentForm.steps.map((step, index) => (
                          <button
                            key={step.id}
                            onClick={() => handleStepChange(step.id)}
                            className={`flex items-center gap-3 text-sm px-2 py-1 rounded-lg transition-all focus:outline-none ${currentStep === step.id
                              ? "bg-[#274c77] text-white font-medium"
                              : currentStep > step.id
                                ? "bg-green-50 text-green-700"
                                : "text-muted-foreground"
                              }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${currentStep === step.id
                                ? "bg-[#274c77] text-white"
                                : currentStep > step.id
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                                }`}
                            >
                              {index + 1}
                            </div>
                            <span className="hidden sm:inline">{step.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

