"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { PersonalDetailsStep } from "./student-form/personal-details-step"
import { StudentPreview } from "./student-form/student-preview"
import { ContactDetailsStep } from "./student-form/contect-details-step"
import { AcademicDetailsStep } from "./student-form/acadmic-details-step"
import { useToast } from "@/hooks/use-toast"
import { toast as sonnerToast } from "sonner"

const steps = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Contact Details" },
  { id: 3, title: "Academic Details" },
]

export function StudentForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({})
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>

  const totalSteps = steps.length

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
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
    const requiredFields: { [step: number]: string[] } = {
      1: ["name", "gender", "dob", "religion", "motherTongue"],
      2: ["emergencyContact"],
      // Step 3 (Academic) - require the fields that actually exist in AcademicDetailsStep
      3: [
        "campus",
        "currentGrade",
        "section",
        "shift",
        "admissionYear",
        "lastClassPassed",
      ],
    }

    const required = requiredFields[currentStep] || []
    const invalid: string[] = []

    for (const field of required) {
      if (field === "studentPhoto") {
        if (!uploadedImages[field]) invalid.push(field)
        continue
      }

      const value = formData[field]
      if (!value || (typeof value === "string" && value.trim() === "")) {
        invalid.push(field)
      }
    }

    // Add conditional validation for step 2
    if (currentStep === 2) {
      // Guardian fields are required if father status is "dead"
      if (formData.fatherStatus === "dead") {
        const guardianFields = ["guardianName", "guardianRelation", "guardianCNIC", "guardianPhone", "guardianProfession"]
        for (const field of guardianFields) {
          const value = formData[field]
          if (!value || (typeof value === "string" && value.trim() === "")) {
            invalid.push(field)
          }
        }
      }

      // Siblings count is required if sibling in alkhair is "yes"
      if (formData.siblingInAlkhair === "yes") {
        const value = formData.siblingsCount
        if (!value || (typeof value === "string" && value.trim() === "")) {
          invalid.push("siblingsCount")
        }
      }
    }

    setInvalidFields(invalid)
    return invalid
  }

  const handleNext = () => {
    const invalid = validateCurrentStep()
    if (invalid.length > 0) {
      toast({
        title: "Please fill required fields",
        description: invalid.join(", "),
      })
      return
    }

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

  const handleStepChange = (step: number) => {
    if (step > currentStep) {
      // agar forward jump kar raha hai to validate karo
      const invalid = validateCurrentStep()
      if (invalid.length > 0) {
        toast({
          title: "Please fill required fields",
          description: invalid.join(", "),
        })
        return
      }
    }
    setInvalidFields([])
    setCurrentStep(step)
  }

  const renderCurrentStep = () => {
    if (showPreview) {
      return (
        <StudentPreview 
          formData={formData} 
          uploadedImages={uploadedImages} 
          onBack={() => setShowPreview(false)}
          onError={(error) => setSubmitError(error)}
          onSaved={() => {
            setShowPreview(false)
            setFormData({})
            setUploadedImages({})
            setCurrentStep(1)
            setSubmitError('') // Clear any errors
            
            // Show success popup modal
            const studentName = formData.name || "Student"
            const studentId = formData.studentId || "Pending"
            const grade = formData.currentGrade || "N/A"
            
            sonnerToast.success("✅ Student Added Successfully!", {
              description: (
                <div className="space-y-1">
                  <p className="font-semibold">Student: {studentName}</p>
                  <p>Student ID: {studentId}</p>
                  <p>Grade: {grade}</p>
                </div>
              ),
              duration: 5000,
            })
          }}
        />
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsStep
            formData={formData}
            uploadedImages={uploadedImages}
            invalidFields={invalidFields}
            onInputChange={handleInputChange}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            fileInputRef={fileInputRef}
          />
        )
      case 2:
        return (
          <ContactDetailsStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />
        )
      case 3:
        return (
          <AcademicDetailsStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Popup Modal */}
      {submitError && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="border-red-500 bg-white shadow-2xl max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xl">⚠</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 text-lg">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{submitError}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSubmitError('')}
                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                >
                  ✕
                </Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setSubmitError('')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  OK
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {!showPreview && (
        <Card className="border-2">
          <CardHeader>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription className="text-sm">
                    Step {currentStep} of {totalSteps}
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">Add Student</div>
              </div>
              <div className="mt-4">
                <ProgressBar 
                  steps={steps} 
                  currentStep={currentStep}
                  onStepClick={handleStepChange}
                  showClickable={true}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {renderCurrentStep()}

      {!showPreview && (
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
  )
}
