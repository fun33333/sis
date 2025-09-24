"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { GeneralInfoStep } from "./campus-form/general-info-step"
import { FacilitiesStep } from "./campus-form/facilities-step"
import { ContactStep } from "./campus-form/contect-step"
import { CampusPreview } from "./campus-form/campus-preview"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: 1, title: "General Information" },
  { id: 2, title: "Facilities" },
  { id: 3, title: "Contact & Misc" },
]

export function CampusForm() {
  const [submitting, setSubmitting] = useState(false);
  // this submit is kept for backwards compatibility but the preview handles the final save.
  const handleSubmit = async () => {
    // noop: final save happens from preview save button to ensure payload normalization
  };
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
        "campusName",
        "registrationNumber",
        "languagesOfInstruction",
        "gradesOffered",
        "academicYearStartMonth",
        "address",
        "city",
        "district",
        "postalCode",
        "campusEstablishedYear",
        "shiftAvailable",
        "educationLevelAvailable",
        "currentGradeClass",
        "totalStudentCapacity",
        "currentStudentEnrollment",
        "campusStatus",
        "totalStaffMembers",
        "totalTeachers",
        "totalCoordinators",
        "totalMaids",
        "totalGuards"
      ],
      2: [
        "totalRooms",
        "totalClassrooms",
        "averageClassSize",
        "averageCurrentClassCapacity",
        "computerLabs",
        "scienceLabs",
        "teacherTransportFacility",
        "canteenFacility",
        "mealPrograms",
        "boysWashrooms",
        "girlsWashrooms",
        "maleTeacherWashrooms",
        "femaleTeacherWashrooms",
        "facilities",
       "anyOtherRoom",
       "sportsFacilities"

      ],
      3: [
        "address",
        "city",
        "district",
        "postalCode",
        "primaryPhone",
        "secondaryPhone",
        "officialEmail",
        "campusHeadName",
        "campusHeadPhone",
        "campusHeadEmail",
        "campusHeadCoordinatorName",
        "campusHeadCoordinatorPhone",
        "campusHeadCoordinatorEmail"
      ], 
    }

    const required = requiredFields[currentStep] || []
    const invalid: string[] = []

    for (const field of required) {
      const value = formData[field];
      // Accept 0 and non-empty string as valid
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        invalid.push(field);
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
      return (
        <div>
          <CampusPreview
            formData={formData}
            onBack={() => setShowPreview(false)}
            onSaved={() => {
              // brief UX: show the progress card's submitting state for a short moment
              setSubmitting(true)
              setTimeout(() => {
                setSubmitting(false)
                setShowPreview(false)
                setFormData({})
                setCurrentStep(1)
              }, 300)
            }}
          />

        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <GeneralInfoStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />;
      case 2:
        return <FacilitiesStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />;
      case 3:
        return <ContactStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} />;
      default:
        return null;
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
                <div className="text-sm text-muted-foreground">Add Campus</div>
              </div>
              <div className="mt-4">
                <Progress value={(currentStep / totalSteps) * 100} className="h-2 rounded-full" />
                <div className="flex items-center justify-between mt-3 gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        // Only allow going back or staying on current step
                        if (step.id <= currentStep) {
                          handleStepChange(step.id)
                        }
                      }}
                      disabled={step.id > currentStep}
                      className={`flex items-center gap-3 text-sm px-2 py-1 rounded-lg transition-all focus:outline-none ${currentStep === step.id
                          ? "bg-primary text-white font-medium"
                          : currentStep > step.id
                            ? "bg-green-50 text-green-700"
                            : "text-muted-foreground"
                        } ${step.id > currentStep ? "opacity-50 cursor-not-allowed" : ""}`}
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
