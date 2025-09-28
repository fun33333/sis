"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { PersonalInfoStep } from "./teacher-form/personal-info-step"
import { EducationStep } from "./teacher-form/education-step"
import CurrentRoleStep from "./teacher-form/current-role-step"
import { ExperienceStep } from "./teacher-form/experience-step"
import { TeacherPreview } from "./teacher-form/teacher-preview"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Educational Qualifications" },
  { id: 3, title: "Work Experience" },
  { id: 4, title: "Current Role" },
]

export function TeacherForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [invalidFields, setInvalidFields] = useState<string[]>([])

  const totalSteps = steps.length

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
  }

  const validateCurrentStep = () => {
    const requiredFields: { [step: number]: string[] } = {
      1: [
        "imageFile",
        "campus",
        "fullName",
        "dob",
        "gender",
        "contactNumber",
        "emergencyContactNumber",
        "email",
        "permanentAddress",
        "temporaryAddress",
        "maritalStatus",
        "cnic",
        "cnicIssueDate",
        "cnicExpiryDate",
        "bFormNumber",
      ],
      2: [
        "education",
        "instituteName",
        "educationQualification",
        "fieldSpecialization",
        "passingYear",
        "passingYearGrade",
      ],
      3: [
        "lastWorkExperience",
        "lastOrganizationName",
        "position",
        "teacherRoleType",
        "fromDate",
        "toDate",
        "teacherSubjects",
      ],
      4: [
        "currentRoleDetails",
        "shift",
        "classAssigned",
        "subjectsAssigned",
        "isClassTeacher",
      ],
    }

    const required = requiredFields[currentStep] || []
    const invalid: string[] = []

    for (const field of required) {
      const value = formData[field]

      // If the field is a boolean (like isClassTeacher), both true and false are valid selections
      if (typeof value === "boolean") {
        continue
      }

      // If the field is an array (checkbox groups), require at least one selected item
      if (Array.isArray(value)) {
        if (value.length === 0) {
          invalid.push(field)
        }
        continue
      }

      if (value == null || (typeof value === "string" && value.trim() === "")) {
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
    if (step > currentStep) {
      // Agar forward jump kar raha hai to pehle validate karo
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
      return <TeacherPreview formData={formData} onBack={() => setShowPreview(false)} />
    }

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />
      case 2:
        return <EducationStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />
      case 3:
        return <ExperienceStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />
      case 4:
        return <CurrentRoleStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />
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
                <div className="text-sm text-muted-foreground">Add Teacher</div>
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
