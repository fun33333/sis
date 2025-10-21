"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { PersonalInfoStep } from "./teacher-form/personal-info-step"
import { EducationStep } from "./teacher-form/education-step"
import CurrentRoleStep from "./teacher-form/current-role-step"
import { ExperienceStep } from "./teacher-form/experience-step"
import { TeacherPreview } from "./teacher-form/teacher-preview"
import { useToast } from "@/hooks/use-toast"
import { toast as sonnerToast } from "sonner"
import { getClassrooms } from "@/lib/api"
import { useFormErrorHandler } from "@/hooks/use-error-handler"
import { ErrorDisplay } from "@/components/ui/error-display"

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
    // Personal Information (8 fields - 6 required, 2 optional)
    full_name: '',
    dob: '',
    gender: '',
    contact_number: '',
    email: '',
    current_address: '',
    cnic: '',
    marital_status: '',
    
    // Optional Personal Information
    permanent_address: '',
    
    // Education Information (5 optional fields)
    education_level: '',
    institution_name: '',
    year_of_passing: new Date().getFullYear(),
    education_subjects: '',
    education_grade: '',
    
    // Experience Information (7 optional fields)
    previous_institution_name: '',
    previous_position: '',
    experience_from_date: '',
    experience_to_date: '',
    experience_subjects_classes_taught: '',
    previous_responsibilities: '',
    total_experience_years: 0,
    
    // Current Role Information (5 fields - 3 required, 2 optional)
    current_campus: '6', // Default to Campus 6 for principal
    joining_date: '',
    shift: 'morning',
    current_subjects: '',
    current_classes_taught: '',
    current_extra_responsibilities: '',
    
    // System fields
    is_currently_active: true,
    
    // Class teacher fields
    is_class_teacher: false,
    class_teacher_level: '',
    class_teacher_grade: '',
    class_teacher_section: '',
    assigned_classroom: '',
    assigned_classrooms: []
  })
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState<{name: string, code: string, classroom?: string} | null>(null)
  
  // Use form error handler
  useFormErrorHandler({
    onGeneralError: (message) => {
      setGeneralError(message)
    }
  })

  const totalSteps = steps.length

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
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
        "current_address",
        "cnic"
      ],
      2: [], // All education fields are optional
      3: [], // All experience fields are optional
      4: [
        "current_campus",
        "joining_date",
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

  const handleNext = async () => {
    const invalid = validateCurrentStep()
    if (invalid.length > 0) {
      toast({
        title: "Please fill required fields",
        description: `Missing: ${invalid.join(", ")}`,
        variant: "destructive"
      })
      return
    }

    // Additional validation for step 1 (personal info)
    if (currentStep === 1) {
      // Check if validation is still in progress
      const isValidationInProgress = Object.values(isValidating).some(validating => validating)
      if (isValidationInProgress) {
        toast({
          title: "Please wait",
          description: "Validation is in progress. Please wait a moment.",
          variant: "destructive"
        })
        return
      }

      // Check for real-time validation errors
      const hasErrors = Object.values(fieldErrors).some(error => error !== '')
      if (hasErrors) {
        toast({
          title: "Please fix validation errors",
          description: "Please correct the highlighted fields before proceeding.",
          variant: "destructive"
        })
        return
      }

      // Check for uniqueness errors specifically
      if (fieldErrors.email || fieldErrors.cnic) {
        toast({
          title: "Duplicate Information",
          description: "Email or CNIC already exists. Please use different values.",
          variant: "destructive"
        })
        return
      }

      // Additional synchronous validation for required fields
      if (!formData.email || !formData.cnic) {
        toast({
          title: "Required fields missing",
          description: "Please fill in email and CNIC fields.",
          variant: "destructive"
        })
        return
      }

      // Force validation of email and CNIC before proceeding
      if (formData.email && formData.cnic) {
        // Trigger immediate validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(formData.email)) {
          toast({
            title: "Invalid email format",
            description: "Please enter a valid email address.",
            variant: "destructive"
          })
          return
        }

        const cleanCNIC = formData.cnic.replace(/\D/g, '')
        if (cleanCNIC.length !== 13) {
          toast({
            title: "Invalid CNIC format",
            description: "CNIC must be exactly 13 digits.",
            variant: "destructive"
          })
          return
        }
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowPreview(true)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Check for validation errors before submission
    const hasErrors = Object.values(fieldErrors).some(error => error !== '')
    if (hasErrors) {
      toast({
        title: "Please fix validation errors",
        description: "Please correct the highlighted fields before submitting.",
        variant: "destructive"
      })
      return
    }
    
    // Check for uniqueness errors specifically
    if (fieldErrors.email || fieldErrors.cnic) {
      toast({
        title: "Duplicate Information",
        description: "Email or CNIC already exists. Please use different values.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    setSubmitError('') // Clear any previous errors
    try {
      // Resolve assigned classroom just-in-time if needed
      let resolvedAssignedClassroom: number | null = formData.assigned_classroom ? parseInt(formData.assigned_classroom) : null
      try {
        if (!resolvedAssignedClassroom && formData.class_teacher_level && formData.class_teacher_grade && formData.class_teacher_section) {
          const data: any = await getClassrooms(formData.class_teacher_grade)
          const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          const match = list.find((c: any) => (c.grade === parseInt(formData.class_teacher_grade) || c.grade === formData.class_teacher_grade) && c.section === formData.class_teacher_section)
          if (match) resolvedAssignedClassroom = match.id
        }
      } catch {}

      // Prepare data for API submission
      const submitData = {
        ...formData,
        // Convert campus to integer
        current_campus: formData.current_campus ? parseInt(formData.current_campus) : null,
        // Convert numeric fields
        year_of_passing: formData.year_of_passing ? parseInt(formData.year_of_passing) : null,
        total_experience_years: formData.total_experience_years ? parseFloat(formData.total_experience_years) : null,
        // Convert boolean fields
        is_currently_active: Boolean(formData.is_currently_active),
        // Class-teacher consistency
        is_class_teacher: Boolean(formData.is_class_teacher || (formData.class_teacher_level && formData.class_teacher_grade && formData.class_teacher_section)),
        assigned_classroom: resolvedAssignedClassroom,
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
        // Success toast with teacher name, employee code, and classroom (if any)
        const teacherName = result?.full_name || formData.full_name || "Teacher"
        const employeeCode = result?.employee_code || "Pending"
        const classroomName = result?.classroom_name || (formData.class_teacher_section ? `Grade ${formData.class_teacher_grade} - ${formData.class_teacher_section}` : "N/A")
        
        // Reset form to initial state
        setFormData({
          // Personal Information (8 fields - 6 required, 2 optional)
          full_name: '',
          dob: '',
          gender: '',
          contact_number: '',
          email: '',
          current_address: '',
          cnic: '',
          marital_status: '',
          
          // Optional Personal Information
          permanent_address: '',
          
          // Education Information (5 optional fields)
          education_level: '',
          institution_name: '',
          year_of_passing: new Date().getFullYear(),
          education_subjects: '',
          education_grade: '',
          
          // Experience Information (7 optional fields)
          previous_institution_name: '',
          previous_position: '',
          experience_from_date: '',
          experience_to_date: '',
          experience_subjects_classes_taught: '',
          previous_responsibilities: '',
          total_experience_years: 0,
          
          // Current Role Information (5 fields - 3 required, 2 optional)
          current_campus: '6', // Default to Campus 6 for principal
          joining_date: '',
          shift: 'morning',
          current_subjects: '',
          current_classes_taught: '',
          current_extra_responsibilities: '',
          
          // System fields
          is_currently_active: true
        })
        
        // Reset to first step and close preview
        setCurrentStep(1)
        setShowPreview(false)
        setInvalidFields([])
        setFieldErrors({})
        setIsValidating({})
        
        // Show success popup modal
        setSubmitError('') // Clear any errors
        setSubmitSuccess({
          name: teacherName,
          code: employeeCode,
          classroom: formData.is_class_teacher ? classroomName : undefined
        })
        sonnerToast.success("Teacher Added Successfully!", {
          description: `${teacherName} (${employeeCode})${formData.is_class_teacher ? ` • Classroom: ${classroomName}` : ''}`,
        })
      } else {
        const errorData = await response.json();
        
        // Handle specific error cases with user-friendly messages
        let errorMessage = 'Failed to create teacher. Please try again.';
        
        if (errorData.email && Array.isArray(errorData.email) && errorData.email[0].includes('already exists')) {
          errorMessage = 'This email is already registered. Please use a different email address.';
        } else if (errorData.cnic && Array.isArray(errorData.cnic) && errorData.cnic[0].includes('already exists')) {
          errorMessage = 'This CNIC is already registered. Please check your CNIC number.';
        } else if (errorData.assigned_classroom && Array.isArray(errorData.assigned_classroom)) {
          // Unique constraint from backend: one teacher per classroom
          errorMessage = 'This classroom is already assigned to another class teacher. Please choose a different section.';
        } else if (errorData.email && Array.isArray(errorData.email)) {
          errorMessage = `Email error: ${errorData.email[0]}`;
        } else if (errorData.cnic && Array.isArray(errorData.cnic)) {
          errorMessage = `CNIC error: ${errorData.cnic[0]}`;
        } else if (errorData.experience_from_date && Array.isArray(errorData.experience_from_date)) {
          errorMessage = errorData.experience_from_date[0];
        } else if (errorData.experience_to_date && Array.isArray(errorData.experience_to_date)) {
          errorMessage = errorData.experience_to_date[0];
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.values(errorData);
          if (fieldErrors.length > 0) {
            const firstError = Array.isArray(fieldErrors[0]) ? fieldErrors[0][0] : fieldErrors[0];
            errorMessage = firstError;
          }
        }
        
        // Show error in UI card
        setSubmitError(errorMessage)
        sonnerToast.error("Failed to save teacher", { description: errorMessage })
      }
    } catch (error) {
      console.error('Error submitting teacher:', error)
      const networkError = "Network error. Please check your connection and try again."
      setSubmitError(networkError)
      toast({
        title: "Error",
        description: networkError,
        variant: "destructive"
      });
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
        return <PersonalInfoStep formData={formData} invalidFields={invalidFields} onInputChange={handleInputChange} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} isValidating={isValidating} setIsValidating={setIsValidating} />
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

      {/* Success Popup Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="border-green-500 bg-white shadow-2xl max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 text-lg">Success!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    <strong>{submitSuccess.name}</strong> has been added successfully!
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Employee Code: <strong>{submitSuccess.code}</strong>
                  </p>
                  {submitSuccess.classroom && (
                    <p className="text-green-600 text-xs mt-1">
                      Classroom: <strong>{submitSuccess.classroom}</strong>
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSubmitSuccess(null)}
                  className="text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  ✕
                </Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setSubmitSuccess(null)}
                  className="bg-green-600 hover:bg-green-700 text-white"
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

      {/* Error Display */}
      {generalError && (
        <div className="mt-4">
          <ErrorDisplay 
            error={{ title: "Error", message: generalError, type: "error" }}
            variant="compact"
            onDismiss={() => setGeneralError('')}
          />
        </div>
      )}

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
