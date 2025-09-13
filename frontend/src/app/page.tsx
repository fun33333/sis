"use client"

import type React from "react"
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
import { Users, Building2, GraduationCap, Upload, X, ArrowLeft, ArrowRight, Save, FileText, Eye, List, UserPlus, TrendingUp, } from "lucide-react"
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
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Student List
            </CardTitle>
            <CardDescription>Manage existing students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No students added yet</p>
              <Button onClick={() => setShowStudentList(false)}>
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
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Student Information Preview
            </CardTitle>
            <CardDescription>Review all information before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadedImages.studentPhoto && (
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <Label className="text-sm font-medium text-muted-foreground block mb-2">Student Photo</Label>
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
              <h4 className="font-semibold text-lg border-b pb-2">Personal Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-medium">{formData.name || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  <p className="text-sm font-medium">{formData.gender || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                  <p className="text-sm font-medium">{formData.dob || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Place of Birth</Label>
                  <p className="text-sm font-medium">{formData.placeOfBirth || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Religion</Label>
                  <p className="text-sm font-medium">{formData.religion || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mother Tongue</Label>
                  <p className="text-sm font-medium">{formData.motherTongue || "Not provided"}</p>
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
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter the student's personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Student Photo *</Label>
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
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter student's full name"
                    className={`border-2 focus:border-primary ${invalidFields.includes('name') ? 'border-red-500' : ''}`}
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
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('gender') ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                  <Input
                    id="placeOfBirth"
                    placeholder="Enter city, state/province"
                    className={`border-2 focus:border-primary ${invalidFields.includes('placeOfBirth') ? 'border-red-500' : ''}`}
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
                  <Label htmlFor="religion">Religion *</Label>
                  <Input
                    id="religion"
                    placeholder="Enter religion"
                    className={`border-2 focus:border-primary ${invalidFields.includes('religion') ? 'border-red-500' : ''}`}
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
                  <Label htmlFor="motherTongue">Mother Tongue *</Label>
                  <Input
                    id="motherTongue"
                    placeholder="Enter mother tongue"
                    className={`border-2 focus:border-primary ${invalidFields.includes('motherTongue') ? 'border-red-500' : ''}`}
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
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Enter contact and family information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <span className="text-red-500 text-xs">This field is required.</span>
                  )}
                </div>
                {/* secondaryPhone removed per request */}
              </div>

              <Separator />
              <h4 className="font-medium text-lg">Father Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father Name</Label>
                  <Input
                    id="fatherName"
                    placeholder="Enter father's full name (leave empty if not available)"
                    className={`border-2 focus:border-primary ${errorFields.includes("fatherName") ? "border-red-500" : ""
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
                  <Label htmlFor="fatherCNIC">Father CNIC</Label>
                  <Input
                    id="fatherCNIC"
                    placeholder="Enter father's CNIC (leave empty if not available)"
                    className={`border-2 focus:border-primary ${errorFields.includes("fatherCNIC") ? "border-red-500" : ""
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
                  <Label htmlFor="fatherContact">Father Contact Number</Label>
                  <Input
                    id="fatherContact"
                    placeholder="Enter father's contact number (leave empty if not available)"
                    className={`border-2 focus:border-primary ${errorFields.includes("fatherContact") ? "border-red-500" : ""
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
                  <Label htmlFor="fatherOccupation">Father Occupation</Label>
                  <Input
                    id="fatherOccupation"
                    placeholder="Enter father's occupation (leave empty if not available)"
                    className={`border-2 focus:border-primary ${errorFields.includes("fatherOccupation") ? "border-red-500" : ""
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
                  <Separator />
                  <h4 className="font-medium text-lg">Guardian Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianName">Guardian Name *</Label>
                      <Input
                        id="guardianName"
                        placeholder="Enter guardian's name"
                        className={`border-2 focus:border-primary ${errorFields.includes("guardianName") ? "border-red-500" : ""
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
                      <Label htmlFor="guardianCNIC">Guardian CNIC *</Label>
                      <Input
                        id="guardianCNIC"
                        placeholder="Enter guardian's CNIC"
                        className={`border-2 focus:border-primary ${errorFields.includes("guardianCNIC") ? "border-red-500" : ""
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
                    <Label htmlFor="guardianOccupation">Guardian Occupation *</Label>
                    <Input
                      id="guardianOccupation"
                      placeholder="Enter guardian's occupation"
                      className={`border-2 focus:border-primary ${errorFields.includes("guardianOccupation") ? "border-red-500" : ""
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

              <Separator />
              <h4 className="font-medium text-lg">Mother Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother Name</Label>
                  <Input
                    id="motherName"
                    placeholder="Enter mother's full name (leave empty if not available)"
                    className={`border-2 focus:border-primary ${errorFields.includes("motherName") ? "border-red-500" : ""
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
                  <Label htmlFor="motherCNIC">Mother CNIC</Label>
                  <Input
                    id="motherCNIC"
                    placeholder="Enter mother's CNIC (leave empty if not available)"
                    className={`border-2 focus:border-primary ${errorFields.includes("motherCNIC") ? "border-red-500" : ""
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
                  <Label htmlFor="motherStatus">Mother Status</Label>
                  <Select
                    value={formData.motherStatus}
                    onValueChange={(value) => setFormData({ ...formData, motherStatus: value })}
                  >
                    <SelectTrigger
                      className={`border-2 focus:border-primary ${errorFields.includes("motherStatus") ? "border-red-500" : ""
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
                  <Label htmlFor="motherContact">Mother Contact Number</Label>
                  <Input
                    id="motherContact"
                    placeholder="Enter mother's contact number (optional)"
                    className={`border-2 focus:border-primary ${errorFields.includes("motherContact") ? "border-red-500" : ""
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
                <Label htmlFor="motherOccupation">Mother Occupation</Label>
                <Input
                  id="motherOccupation"
                  placeholder="Enter mother's occupation (optional)"
                  className={`border-2 focus:border-primary ${errorFields.includes("motherOccupation") ? "border-red-500" : ""
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

              <Separator />
              <h4 className="font-medium text-lg">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zakatStatus">Zakat Status *</Label>
                  <Select
                    value={formData.zakatStatus}
                    onValueChange={(value) => setFormData({ ...formData, zakatStatus: value })}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select zakat status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applicable">Applicable</SelectItem>
                      <SelectItem value="not-applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyIncome">Family Income *</Label>
                  <Input
                    id="familyIncome"
                    placeholder="Enter monthly family income"
                    className="border-2 focus:border-primary"
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
                  <Label htmlFor="houseOwned">House Owned *</Label>
                  <Select
                    value={formData.houseOwned}
                    onValueChange={(value) => setFormData({ ...formData, houseOwned: value })}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
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
                    <Label htmlFor="rent">Monthly Rent *</Label>
                    <Input
                      id="rent"
                      placeholder="Enter monthly rent amount (e.g., 8000)"
                      className="border-2 focus:border-primary"
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
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete residential address"
                  className="border-2 focus:border-primary min-h-[100px]"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
              <CardDescription>Enter academic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentState">Current State *</Label>
                  <Select
                    value={formData.currentState}
                    onValueChange={(value) => setFormData({ ...formData, currentState: value })}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select current state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="not-active">Not Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campus">Campus *</Label>
                  <Select
                    value={formData.campus}
                    onValueChange={(value) => setFormData({ ...formData, campus: value })}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
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
                  <Label htmlFor="currentGrade">Current Grade/Class *</Label>
                  <Input
                    id="currentGrade"
                    placeholder="Enter current grade/class"
                    className="border-2 focus:border-primary"
                    value={formData.currentGrade || ""}
                    onChange={(e) => setFormData({ ...formData, currentGrade: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section *</Label>
                  <Input
                    id="section"
                    placeholder="Enter section"
                    className="border-2 focus:border-primary"
                    value={formData.section || ""}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                  />
                </div>
              </div>
              {/* reasonForTransfer removed from form per request */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toYear">To Year *</Label>
                  <Input
                    id="toYear"
                    type="number"
                    placeholder="Enter year"
                    className="border-2 focus:border-primary"
                    value={formData.toYear || ""}
                    onChange={(e) => setFormData({ ...formData, toYear: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromYear">From Year *</Label>
                  <Input
                    id="fromYear"
                    type="number"
                    placeholder="Enter year"
                    className="border-2 focus:border-primary"
                    value={formData.fromYear || ""}
                    onChange={(e) => setFormData({ ...formData, fromYear: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastClassPassed">Last Class Passed *</Label>
                  <Input
                    id="lastClassPassed"
                    placeholder="Enter last class passed"
                    className="border-2 focus:border-primary"
                    value={formData.lastClassPassed || ""}
                    onChange={(e) => setFormData({ ...formData, lastClassPassed: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastSchoolName">Last School Name *</Label>
                  <Input
                    id="lastSchoolName"
                    placeholder="Enter last school name"
                    className="border-2 focus:border-primary"
                    value={formData.lastSchoolName || ""}
                    onChange={(e) => setFormData({ ...formData, lastSchoolName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oldGRNo">Old GR No *</Label>
                  <Input
                    id="oldGRNo"
                    placeholder="Enter old GR No"
                    className="border-2 focus:border-primary"
                    value={formData.oldGRNo || ""}
                    onChange={(e) => setFormData({ ...formData, oldGRNo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grNumber">GR Number *</Label>
                  <Input
                    id="grNumber"
                    placeholder="Enter GR Number"
                    className="border-2 focus:border-primary"
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
                  <Label htmlFor="campusName">Campus Name *</Label>
                  <Input
                    id="campusName"
                    placeholder="Enter campus name"
                    className={`border-2 focus:border-primary ${invalidFields.includes('campusName') ? 'border-red-500' : ''}`}
                    value={formData.campusName || ""}
                    onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                    required
                  />
                  {invalidFields.includes('campusName') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campusCode">Campus Code *</Label>
                  <Input
                    id="campusCode"
                    placeholder="Enter campus code"
                    className={`border-2 focus:border-primary ${invalidFields.includes('campusCode') ? 'border-red-500' : ''}`}
                    value={formData.campusCode || ""}
                    onChange={(e) => setFormData({ ...formData, campusCode: e.target.value })}
                    required
                  />
                  {invalidFields.includes('campusCode') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number / License No *</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Enter registration number"
                    className={`border-2 focus:border-primary ${invalidFields.includes('registrationNumber') ? 'border-red-500' : ''}`}
                    value={formData.registrationNumber || ""}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                  />
                  {invalidFields.includes('registrationNumber') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter campus description"
                  className={`border-2 focus:border-primary min-h-[100px] ${invalidFields.includes('description') ? 'border-red-500' : ''}`}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {invalidFields.includes('description') && <ErrorText>This field is required.</ErrorText>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('status') ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="governingBody">Governing Body *</Label>
                  <Input
                    id="governingBody"
                    placeholder="Enter governing body"
                    className={`border-2 focus:border-primary ${invalidFields.includes('governingBody') ? 'border-red-500' : ''}`}
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
                <Label htmlFor="address">Campus Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter campus address"
                  className={`border-2 focus:border-primary ${invalidFields.includes('address') ? 'border-red-500' : ''}`}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                {invalidFields.includes('address') && <ErrorText>This field is required.</ErrorText>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYearStart">Academic Year Start *</Label>
                  <Select
                    value={formData.academicYearStart || ""}
                    onValueChange={(value) => setFormData({ ...formData, academicYearStart: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('academicYearStart') ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="academicYearEnd">Academic Year End *</Label>
                  <Select
                    value={formData.academicYearEnd || ""}
                    onValueChange={(value) => setFormData({ ...formData, academicYearEnd: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('academicYearEnd') ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="gradesOffered">Grades Offered *</Label>
                  <Select
                    value={formData.gradesOffered || ""}
                    onValueChange={(value) => setFormData({ ...formData, gradesOffered: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('gradesOffered') ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="languagesOfInstruction">Language(s) of Instruction *</Label>
                  <Select
                    value={formData.languagesOfInstruction || ""}
                    onValueChange={(value) => setFormData({ ...formData, languagesOfInstruction: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('languagesOfInstruction') ? 'border-red-500' : ''}`}>
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
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
              <CardDescription>Enter campus facilities information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalClassrooms">Total Classrooms *</Label>
                  <Input
                    id="totalClassrooms"
                    placeholder="Enter number of classrooms"
                    className={`border-2 focus:border-primary ${invalidFields.includes('totalClassrooms') ? 'border-red-500' : ''}`}
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
                  <Label htmlFor="scienceLabs">Science Labs *</Label>
                  <Input
                    id="scienceLabs"
                    placeholder="Enter number of science labs"
                    className={`border-2 focus:border-primary ${invalidFields.includes('scienceLabs') ? 'border-red-500' : ''}`}
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
                  <Label htmlFor="computerLabs">Computer Labs *</Label>
                  <Input
                    id="computerLabs"
                    placeholder="Enter number of computer labs"
                    className={`border-2 focus:border-primary ${invalidFields.includes('computerLabs') ? 'border-red-500' : ''}`}
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
                  <Label htmlFor="library">Library *</Label>
                  <Select
                    value={formData.library}
                    onValueChange={(value) => setFormData({ ...formData, library: value })}
                    required
                  >
                    <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes('library') ? 'border-red-500' : ''}`}>
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
                  <Label htmlFor="campusCapacity">Campus Capacity (students) *</Label>
                  <Input
                    id="campusCapacity"
                    placeholder="Enter campus capacity"
                    className={`border-2 focus:border-primary ${invalidFields.includes('campusCapacity') ? 'border-red-500' : ''}`}
                    value={formData.campusCapacity || ""}
                    onChange={(e) => setFormData({ ...formData, campusCapacity: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('campusCapacity') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classesPerGrade">Classes per Grade *</Label>
                  <Input
                    id="classesPerGrade"
                    placeholder="Enter classes per grade"
                    className={`border-2 focus:border-primary ${invalidFields.includes('classesPerGrade') ? 'border-red-500' : ''}`}
                    value={formData.classesPerGrade || ""}
                    onChange={(e) => setFormData({ ...formData, classesPerGrade: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('classesPerGrade') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageClassSize">Average Class Size (current) *</Label>
                  <Input
                    id="averageClassSize"
                    placeholder="Enter average class size"
                    className={`border-2 focus:border-primary ${invalidFields.includes('averageClassSize') ? 'border-red-500' : ''}`}
                    value={formData.averageClassSize || ""}
                    onChange={(e) => setFormData({ ...formData, averageClassSize: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('averageClassSize') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalStudents">No of Students *</Label>
                  <Input
                    id="totalStudents"
                    placeholder="Enter total students"
                    className={`border-2 focus:border-primary ${invalidFields.includes('totalStudents') ? 'border-red-500' : ''}`}
                    value={formData.totalStudents || ""}
                    onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('totalStudents') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalTeachers">No of Teachers *</Label>
                  <Input
                    id="totalTeachers"
                    placeholder="Enter total teachers"
                    className={`border-2 focus:border-primary ${invalidFields.includes('totalTeachers') ? 'border-red-500' : ''}`}
                    value={formData.totalTeachers || ""}
                    onChange={(e) => setFormData({ ...formData, totalTeachers: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('totalTeachers') && <ErrorText>This field is required.</ErrorText>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalRooms">No of Rooms *</Label>
                  <Input
                    id="totalRooms"
                    placeholder="Enter total rooms"
                    className={`border-2 focus:border-primary ${invalidFields.includes('totalRooms') ? 'border-red-500' : ''}`}
                    value={formData.totalRooms || ""}
                    onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                  {invalidFields.includes('totalRooms') && <ErrorText>This field is required.</ErrorText>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maleToilets">Toilets (Male)</Label>
                  <Input
                    id="maleToilets"
                    placeholder="Number of male toilets"
                    className={`border-2 focus:border-primary ${invalidFields.includes('maleToilets') ? 'border-red-500' : ''}`}
                    value={formData.maleToilets || ""}
                    onChange={(e) => setFormData({ ...formData, maleToilets: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="femaleToilets">Toilets (Female)</Label>
                  <Input
                    id="femaleToilets"
                    placeholder="Number of female toilets"
                    className={`border-2 focus:border-primary ${invalidFields.includes('femaleToilets') ? 'border-red-500' : ''}`}
                    value={formData.femaleToilets || ""}
                    onChange={(e) => setFormData({ ...formData, femaleToilets: e.target.value.replace(/[^0-9]/g, "") })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilities">Additional Facilities *</Label>
                <Textarea
                  id="facilities"
                  placeholder="Enter additional facilities (playground, cafeteria, etc.)"
                  className={`border-2 focus:border-primary min-h-[100px] ${invalidFields.includes('facilities') ? 'border-red-500' : ''}`}
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
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Teacher Information Preview
            </CardTitle>
            <CardDescription>Review all information before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-medium">{formData.fullName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                  <p className="text-sm font-medium">{formData.dob || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  <p className="text-sm font-medium">{formData.gender || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                  <p className="text-sm font-medium">{formData.contactNumber || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{formData.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Educational Qualifications</h4>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
            <Badge variant="secondary" className="text-sm">
              Educational Management System
            </Badge>
          </div>
        </div>
      </div>



      {/* leftside panel code */}


      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          <div className="w-80 space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">IAK SMS</CardTitle>
                <CardDescription>Select a form to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">


                <Link href="/main-dashboard-sms" className="w-full">
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12">
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
                      className="w-full justify-start gap-3 h-12"
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

                {/* Quick-select dropdown for Add Students (left panel) */}
                {activeForm === "students" && (
                  <div className="pt-2">
                    <Label htmlFor="quickName" className="text-sm">Students Portal</Label>
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
                      <SelectTrigger className={`border-2 focus:border-primary w-full`}>
                        <SelectValue placeholder="More About Student Portal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student-list">Student List</SelectItem>
                        {/* <SelectItem value="update-student">Update Student</SelectItem> */}
                        <SelectItem value="transfer-modal">Student Transfer Module</SelectItem>
                        <SelectItem value="student-termination">Termination Certificate</SelectItem>
                        <SelectItem value="student-leaving">Leaving Certificate</SelectItem>
                        <SelectItem value="student-profile">Student Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick-select dropdown for Teachers (left panel) */}
                {activeForm === "teachers" && (
                  <div className="pt-2">
                    <Label htmlFor="teacherQuick" className="text-sm">Teachers Portal</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === "teacher-list") router.push("/teachers/list")
                        if (value === "teacher-profile") router.push("/teachers/profile")
                      }}
                    >
                      <SelectTrigger className={`border-2 focus:border-primary w-full`}>
                        <SelectValue placeholder="More About Teacher Portal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher-list">Teacher List</SelectItem>
                        <SelectItem value="teacher-profile">Teacher Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick-select dropdown for Campus (left panel) */}
                {activeForm === "campus" && (
                  <div className="pt-2">
                    <Label htmlFor="campusQuick" className="text-sm">Campus Portal</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === "campus-list") router.push("/campus/list")
                        if (value === "campus-profile") router.push("/campus/profile")
                      }}
                    >
                      <SelectTrigger className={`border-2 focus:border-primary w-full`}>
                        <SelectValue placeholder="More About Campus Portal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="campus-list">Campus List</SelectItem>
                        <SelectItem value="campus-profile">Campus Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {!showPreview && !showStudentList && (
              <Card className="border-2 mb-4">
                <CardHeader>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Progress</CardTitle>
                        <CardDescription className="text-sm">Step {currentStep} of {totalSteps}</CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">{currentForm.title}</div>
                    </div>
                    <div className="mt-4">
                      <Progress value={(currentStep / totalSteps) * 100} className="h-2 rounded-full" />
                      <div className="flex items-center justify-between mt-3 gap-2">
                        {currentForm.steps.map((step, index) => (
                          <button
                            key={step.id}
                            onClick={() => handleStepChange(step.id)}
                            className={`flex items-center gap-3 text-sm px-2 py-1 rounded-lg transition-all focus:outline-none ${currentStep === step.id
                              ? "bg-primary text-white font-medium"
                              : currentStep > step.id
                                ? "bg-green-50 text-green-700"
                                : "text-muted-foreground"
                              }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${currentStep === step.id
                                ? "bg-primary text-white"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

