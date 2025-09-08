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
import { Toaster } from "@/components/ui/toaster"
import {
  Users,
  Building2,
  GraduationCap,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  FileText,
  Eye,
  List,
  UserPlus,
} from "lucide-react"

type FormType = "students" | "campus" | "teachers"

export default function AdminPanel() {
  const { toast } = useToast()
  const [activeForm, setActiveForm] = useState<FormType>("students")
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [showStudentList, setShowStudentList] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({})
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [errorFields, setErrorFields] = useState<string[]>([])

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
            "secondaryPhone",
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
            "reasonForTransfer",
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
          fields: ["campusName", "campusCode", "description", "status", "governingBody"],
        },
        {
          id: 2,
          title: "Facilities",
          fields: ["totalClassrooms", "scienceLabs", "computerLabs", "library", "facilities"],
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
    const currentStepFields = currentForm.steps[currentStep - 1].fields
    const invalid: string[] = []

    for (const field of currentStepFields) {
      const value = formData[field]

      // Check if field is required and empty
      if (!value || (typeof value === "string" && value.trim() === "")) {
        // Special case for image upload
        if (field === "studentPhoto" && !uploadedImages[field]) {
          invalid.push(field)
        }
        // For other fields, check if they have values
        if (field !== "studentPhoto") {
          invalid.push(field)
        }
      }
    }

    setInvalidFields(invalid)
    return invalid.length === 0
  }

  const handleStepChange = (step: number) => {
    setInvalidFields([])
    setCurrentStep(step)
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPreview(true);
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
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                  <p className="text-sm font-medium">{formData.emergencyContact || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Secondary Phone</Label>
                  <p className="text-sm font-medium">{formData.secondaryPhone || "Not provided"}</p>
                </div>
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
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reason for Transfer</Label>
                  <p className="text-sm font-medium">{formData.reasonForTransfer || "Not provided"}</p>
                </div>
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
                    className="border-2 focus:border-primary"
                    value={formData.emergencyContact || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, emergencyContact: value })
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryPhone">Secondary Phone Number *</Label>
                  <Input
                    id="secondaryPhone"
                    placeholder="Enter secondary phone number"
                    className="border-2 focus:border-primary"
                    value={formData.secondaryPhone || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, secondaryPhone: value })
                    }}
                    required
                  />
                </div>
              </div>

              <Separator />
              <h4 className="font-medium text-lg">Father Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father Name</Label>
                  <Input
                    id="fatherName"
                    placeholder="Enter father's full name (leave empty if not available)"
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("fatherName") ? "border-red-500" : ""
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
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("fatherCNIC") ? "border-red-500" : ""
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
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("fatherContact") ? "border-red-500" : ""
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
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("fatherOccupation") ? "border-red-500" : ""
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
                        className={`border-2 focus:border-primary ${
                          errorFields.includes("guardianName") ? "border-red-500" : ""
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianCNIC">Guardian CNIC *</Label>
                      <Input
                        id="guardianCNIC"
                        placeholder="Enter guardian's CNIC"
                        className={`border-2 focus:border-primary ${
                          errorFields.includes("guardianCNIC") ? "border-red-500" : ""
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
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianOccupation">Guardian Occupation *</Label>
                    <Input
                      id="guardianOccupation"
                      placeholder="Enter guardian's occupation"
                      className={`border-2 focus:border-primary ${
                        errorFields.includes("guardianOccupation") ? "border-red-500" : ""
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
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("motherName") ? "border-red-500" : ""
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
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("motherCNIC") ? "border-red-500" : ""
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
                      className={`border-2 focus:border-primary ${
                        errorFields.includes("motherStatus") ? "border-red-500" : ""
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
                    className={`border-2 focus:border-primary ${
                      errorFields.includes("motherContact") ? "border-red-500" : ""
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
                  className={`border-2 focus:border-primary ${
                    errorFields.includes("motherOccupation") ? "border-red-500" : ""
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
                      <SelectItem value="main">Main Campus</SelectItem>
                      <SelectItem value="north">North Campus</SelectItem>
                      <SelectItem value="south">South Campus</SelectItem>
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
              <div className="space-y-2">
                <Label htmlFor="reasonForTransfer">Reason for Transfer *</Label>
                <Textarea
                  id="reasonForTransfer"
                  placeholder="Enter reason for transfer"
                  className="border-2 focus:border-primary min-h-[100px]"
                  value={formData.reasonForTransfer || ""}
                  onChange={(e) => setFormData({ ...formData, reasonForTransfer: e.target.value })}
                  required
                />
              </div>
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
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="text-sm font-medium">{formData.status || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Governing Body</Label>
                  <p className="text-sm font-medium">{formData.governingBody || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm font-medium">{formData.description || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Facilities</h4>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Additional Facilities</Label>
                  <p className="text-sm font-medium">{formData.facilities || "Not provided"}</p>
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
                    description: "Campus information saved successfully!",
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, campusName: value })
                    }}
                    required
                  />
                  {invalidFields.includes('campusName') && (
                    <span className="text-red-500 text-xs">Please fill this field.</span>
                  )}
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
                  {invalidFields.includes('campusCode') && (
                    <span className="text-red-500 text-xs">Please fill this field.</span>
                  )}
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
                  {invalidFields.includes('description') && (
                    <span className="text-red-500 text-xs">Please fill this field.</span>
                  )}
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
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
                  {invalidFields.includes('status') && (
                    <span className="text-red-500 text-xs">Please fill this field.</span>
                  )}
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
                  {invalidFields.includes('governingBody') && (
                    <span className="text-red-500 text-xs">Please fill this field.</span>
                  )}
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
                    className="border-2 focus:border-primary"
                    value={formData.totalClassrooms || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, totalClassrooms: value })
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scienceLabs">Science Labs *</Label>
                  <Input
                    id="scienceLabs"
                    placeholder="Enter number of science labs"
                    className="border-2 focus:border-primary"
                    value={formData.scienceLabs || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, scienceLabs: value })
                    }}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="computerLabs">Computer Labs *</Label>
                  <Input
                    id="computerLabs"
                    placeholder="Enter number of computer labs"
                    className="border-2 focus:border-primary"
                    value={formData.computerLabs || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, computerLabs: value })
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="library">Library *</Label>
                  <Select
                    value={formData.library}
                    onValueChange={(value) => setFormData({ ...formData, library: value })}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select library availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facilities">Additional Facilities *</Label>
                <Textarea
                  id="facilities"
                  placeholder="Enter additional facilities (playground, cafeteria, etc.)"
                  className="border-2 focus:border-primary min-h-[100px]"
                  value={formData.facilities || ""}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  required
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
                  className="border-2 focus:border-primary"
                  value={formData.fullName || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                    setFormData({ ...formData, fullName: value })
                  }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    className="border-2 focus:border-primary"
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    required
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    placeholder="Enter contact number"
                    className="border-2 focus:border-primary"
                    value={formData.contactNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setFormData({ ...formData, contactNumber: value })
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    className="border-2 focus:border-primary"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Educational Qualifications</CardTitle>
              <CardDescription>Enter educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="education">Education *</Label>
                <Textarea
                  id="education"
                  placeholder="Enter educational qualifications (degrees, certifications, etc.)"
                  className="border-2 focus:border-primary min-h-[150px]"
                  value={formData.education || ""}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Enter work experience and current role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Enter work experience details"
                  className="border-2 focus:border-primary min-h-[100px]"
                  value={formData.experience || ""}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role *</Label>
                  <Input
                    id="currentRole"
                    placeholder="Enter current role/position"
                    className="border-2 focus:border-primary"
                    value={formData.currentRole || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                      setFormData({ ...formData, currentRole: value })
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects *</Label>
                  <Input
                    id="subjects"
                    placeholder="Enter subjects taught"
                    className="border-2 focus:border-primary"
                    value={formData.subjects || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s,]/g, "")
                      setFormData({ ...formData, subjects: value })
                    }}
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

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          <div className="w-80 space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Forms</CardTitle>
                <CardDescription>Select a form to manage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(forms).map(([key, form]) => {
                  const Icon = form.icon
                  return (
                    <Button
                      key={key}
                      variant={activeForm === key ? "default" : "ghost"}
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
              </CardContent>
            </Card>

            {!showPreview && !showStudentList && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription>
                    Step {currentStep} of {totalSteps}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
                  <div className="space-y-2">
                    {currentForm.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 text-sm ${
                          currentStep === step.id
                            ? "text-primary font-medium"
                            : currentStep > step.id
                              ? "text-green-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            currentStep === step.id
                              ? "bg-primary text-white"
                              : currentStep > step.id
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {step.title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex-1">
            <div className="space-y-6">
              {/* Form content */}
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
      <Toaster />
    </div>
  )
}
