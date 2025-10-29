"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { GeneralInfoStep } from "./campus-form/general-info-step"
import { FacilitiesStep } from "./campus-form/facilities-step"
import { ContactStep } from "./campus-form/contect-step"
import { CampusPreview } from "./campus-form/campus-preview"
import { useToast } from "@/hooks/use-toast"
import { ProgressBar } from "@/components/ui/progress-bar"

const steps = [
  { id: 1, title: "General Information" },
  { id: 2, title: "Facilities" },
  { id: 3, title: "Contact & Info" },
]

export function CampusForm() {
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
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
      1: ["campus_name", "city", "postal_code", "status", "address_full", "shift_available"], // Required fields for Step 1
      2: [], // No required fields in facilities step
      3: [], // No required fields in contact step
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
    // Only allow navigation to current step or previous completed steps
    if (step <= currentStep) {
      setInvalidFields([])
      setCurrentStep(step)
    }
  }

  const renderCurrentStep = () => {
    if (showPreview) {
      return (
        <div>
          <CampusPreview
            formData={formData}
            onBack={() => setShowPreview(false)}
            onSaved={() => {
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
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg">Add Campus</CardTitle>
              </div>
              <ProgressBar 
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepChange}
                showClickable={true}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      {renderCurrentStep()}

      {!showPreview && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button onClick={handleNext}>
            {currentStep === totalSteps ? "Preview" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}