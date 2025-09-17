"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { PersonalDetailsStep } from "./student-form/personal-details-step"
import { StudentPreview } from "./student-form/student-preview"
import { ContactDetailsStep } from "./student-form/contect-details-step"
import { AcademicDetailsStep } from "./student-form/acadmic-details-step"
import { useToast } from "@/hooks/use-toast"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      1: ["studentPhoto", "name", "gender", "dob", "placeOfBirth", "religion", "motherTongue"],
      2: ["emergencyContact", "zakatStatus", "familyIncome", "houseOwned", "address"],
      3: ["currentState", "campus", "currentGrade", "section"],
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
    setInvalidFields([])
    setCurrentStep(step)
  }

  const renderCurrentStep = () => {
    if (showPreview) {
      return <StudentPreview formData={formData} uploadedImages={uploadedImages} onBack={() => setShowPreview(false)} />
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
                <Progress value={(currentStep / totalSteps) * 100} className="h-2 rounded-full" />
                <div className="flex items-center justify-between mt-3 gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepChange(step.id)}
                      className={`flex items-center gap-3 text-sm px-2 py-1 rounded-lg transition-all focus:outline-none ${
                        currentStep === step.id
                          ? "bg-primary text-white font-medium"
                          : currentStep > step.id
                            ? "bg-green-50 text-green-700"
                            : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          currentStep === step.id
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
