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
  { id: 1, title: "Personal" },
  { id: 2, title: "Education" },
  { id: 3, title: "Experience" },
  { id: 4, title: "Current Role" },
]

export function TeacherForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<any>({
    // Personal Information
    full_name: '',
    dob: '',
    gender: '',
    contact_number: '',
    email: '',
    permanent_address: '',
    current_address: '',
    marital_status: '',
    cnic: '',
    
    // Education Information
    education_level: '',
    institution_name: '',
    year_of_passing: new Date().getFullYear(),
    education_subjects: '',
    education_grade: '',
    additional_education_level: '',
    additional_institution_name: '',
    additional_year_of_passing: '',
    additional_education_subjects: '',
    additional_education_grade: '',
    
    // Experience Information
    previous_institution_name: '',
    previous_position: '',
    experience_from_date: '',
    experience_to_date: '',
    experience_subjects_classes_taught: '',
    previous_responsibilities: '',
    total_experience_years: 0,
    additional_institution_name_exp: '',
    additional_position: '',
    additional_experience_from_date: '',
    additional_experience_to_date: '',
    additional_experience_subjects_classes: '',
    additional_responsibilities: '',
    
    // Current Role Information
    joining_date: '',
    current_role_title: '',
    current_campus: '',
    current_subjects: '',
    current_classes_taught: '',
    current_extra_responsibilities: '',
    role_start_date: '',
    role_end_date: '',
    is_currently_active: true,
    shift: 'morning',
    is_class_teacher: false,
    assigned_classroom: null,
    save_status: 'draft'
  })
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = steps.length

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
  }

  const validateCurrentStep = () => {
    const requiredFields: { [step: number]: string[] } = {
      1: [
        "full_name",
        "dob",
        "gender",
        "contact_number",
        "email",
        "permanent_address",
        "current_address",
        "marital_status",
        "cnic"
      ],
      2: [],
      3: [],
      4: [
        "joining_date",
        "current_campus",
        "shift"
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
        description: `Missing: ${invalid.join(", ")}`,
        variant: "destructive"
      })
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowPreview(true)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true)
    try {
      // Prepare data for API submission
      const submitData = {
        ...formData,
        // Convert campus to integer
        current_campus: formData.current_campus ? parseInt(formData.current_campus) : null,
        // Convert numeric fields
        year_of_passing: formData.year_of_passing ? parseInt(formData.year_of_passing) : null,
        additional_year_of_passing: formData.additional_year_of_passing ? parseInt(formData.additional_year_of_passing) : null,
        total_experience_years: formData.total_experience_years ? parseFloat(formData.total_experience_years) : null,
        // Convert boolean fields
        is_currently_active: Boolean(formData.is_currently_active),
        is_class_teacher: Boolean(formData.is_class_teacher),
        // Remove assigned_classroom if it's not a valid PK (integer) or if no classrooms exist
        assigned_classroom: null, // Set to null since classrooms don't exist in database yet
      }

      console.log('Submitting teacher data:', submitData)

      const response = await fetch('http://127.0.0.1:8000/api/teachers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sis_access_token')}`
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Teacher created successfully:', result)
        
        // Show success alert
        alert('✅ Success! This teacher has been added successfully!')
        
        // Reset form to initial state
        setFormData({
          full_name: '',
          dob: '',
          gender: '',
          contact_number: '',
          email: '',
          permanent_address: '',
          current_address: '',
          marital_status: '',
          cnic: '',
          education_level: '',
          institution_name: '',
          year_of_passing: new Date().getFullYear(),
          education_subjects: '',
          education_grade: '',
          additional_education_level: '',
          additional_institution_name: '',
          additional_year_of_passing: '',
          additional_education_subjects: '',
          additional_education_grade: '',
          previous_institution_name: '',
          previous_position: '',
          experience_from_date: '',
          experience_to_date: '',
          experience_subjects_classes_taught: '',
          previous_responsibilities: '',
          total_experience_years: 0,
          additional_institution_name_exp: '',
          additional_position: '',
          additional_experience_from_date: '',
          additional_experience_to_date: '',
          additional_experience_subjects_classes: '',
          additional_responsibilities: '',
          joining_date: '',
          current_role_title: '',
          current_campus: '',
          current_subjects: '',
          current_classes_taught: '',
          current_extra_responsibilities: '',
          role_start_date: '',
          role_end_date: '',
          is_currently_active: true,
          shift: 'morning',
          is_class_teacher: false,
          assigned_classroom: null,
          save_status: 'draft'
        })
        
        // Reset to first step and close preview
        setCurrentStep(1)
        setShowPreview(false)
        setInvalidFields([])
        
        toast({
          title: "Success! 🎉",
          description: "Teacher has been added successfully!",
        })
      } else {
        const errorData = await response.text()
        console.error('Error creating teacher:', errorData)
        toast({
          title: "Error",
          description: `Failed to create teacher: ${errorData}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting teacher:', error)
      toast({
        title: "Error",
        description: "An error occurred while creating the teacher",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
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
      return <TeacherPreview formData={formData} onBack={() => setShowPreview(false)} onSubmit={handleSubmit} />
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
