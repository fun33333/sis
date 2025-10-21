"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { PersonalInfoStep } from "./coordinator-form/personal-info-step"
import { EducationStep } from "./coordinator-form/education-step"
import { WorkAssignmentStep } from "./coordinator-form/work-assignment-step"
import { CoordinatorPreview } from "./coordinator-form/coordinator-preview"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, getCurrentUserRole } from "@/lib/permissions"
import { useFormErrorHandler } from "@/hooks/use-error-handler"
import { ErrorDisplay } from "@/components/ui/error-display"
import { toast as sonnerToast } from "sonner"

const steps = [
  { id: 1, title: "Personal" },
  { id: 2, title: "Education" },
  { id: 3, title: "Work Assignment" },
]

export function CoordinatorForm({ 
  onSuccess, 
  onCancel, 
  editData, 
  isEdit = false 
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  editData?: any;
  isEdit?: boolean;
}) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<any>({
    full_name: '',
    dob: '',
    gender: '',
    contact_number: '',
    email: '',
    cnic: '',
    permanent_address: '',
    education_level: '',
    institution_name: '',
    year_of_passing: new Date().getFullYear(),
    total_experience_years: 0,
    campus: null,
    level: null,
    assigned_levels: [],
    shift: 'morning',
    joining_date: '',
    is_currently_active: true,
    can_assign_class_teachers: true,
    ...editData
  })
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [duplicateErrors, setDuplicateErrors] = useState<{[key: string]: string}>({})
  const [campuses, setCampuses] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [currentUserCampus, setCurrentUserCampus] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState<{name: string, code: string, level?: string} | null>(null)
  
  // Use form error handler
  const { handleFormError, clearAllErrors, getFieldError } = useFormErrorHandler({
    onFieldError: (field, message) => {
      setDuplicateErrors(prev => ({ ...prev, [field]: message }))
    },
    onGeneralError: (message) => {
      setGeneralError(message)
    }
  })

  const totalSteps = steps.length

  // Load data on component mount
  useEffect(() => {
    loadCurrentUserCampus();
    if (editData?.campus) {
      loadLevels(editData.campus, editData.shift);
    }
  }, []);

  // Load current user campus
  const loadCurrentUserCampus = async () => {
    try {
      const user = getCurrentUser();
      const userRole = getCurrentUserRole();
      
      console.log('Current user:', user);
      console.log('User role:', userRole);
      
      if (userRole === 'principal') {
        // For principal, try to get campus from user data or load from API
        if ((user as any)?.campus) {
          console.log('Principal campus from user data:', (user as any).campus);
          setCurrentUserCampus((user as any).campus);
          setCampuses([(user as any).campus]);
        } else {
          console.log('Principal campus not in user data, loading from API...');
          // Load campus data from API for principal
          try {
            const token = localStorage.getItem('sis_access_token');
            const response = await fetch('http://localhost:8000/api/campus/', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });
            if (response.ok) {
              const data = await response.json();
              const allCampuses = data.results || data;
              console.log('All campuses for principal:', allCampuses);
              
              // Filter to show only principal's campus
              // We need to get principal's campus ID from user data or API
              // For now, let's try to get it from the user object
              const userCampusId = (user as any)?.campus_id || (user as any)?.campus?.id;
              if (userCampusId) {
                const principalCampus = allCampuses.find((campus: any) => campus.id === userCampusId);
                if (principalCampus) {
                  console.log('Principal campus found:', principalCampus);
                  setCurrentUserCampus(principalCampus);
                  setCampuses([principalCampus]);
                } else {
                  console.log('Principal campus not found, showing all campuses');
                  setCampuses(allCampuses);
                }
              } else {
                console.log('No campus ID found for principal, showing all campuses');
                setCampuses(allCampuses);
              }
            }
          } catch (error) {
            console.error('Error loading campuses for principal:', error);
          }
        }
      } else {
        // For other roles, load all campuses
        console.log('Loading all campuses...');
        
        try {
          const token = localStorage.getItem('sis_access_token');
          const response = await fetch('http://localhost:8000/api/campus/', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          console.log('Campus API response:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Campus data:', data);
            setCampuses(data.results || data);
          } else {
            console.error('Campus API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            // Show user-friendly error message
            toast({
              title: "Backend Error",
              description: "Cannot connect to backend server. Please make sure the backend is running.",
              variant: "destructive"
            });
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          toast({
            title: "Connection Error",
            description: "Cannot connect to backend server. Please make sure the backend is running on port 8000.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error loading user campus:', error);
      toast({
        title: "Error",
        description: "Failed to load campus information",
        variant: "destructive"
      });
    }
  };

  // Load levels based on selected campus and shift (only unassigned levels)
  const loadLevels = async (campusId: number, shift?: string) => {
    try {
      console.log('Loading levels for campus:', campusId, 'shift:', shift);
      
      // Get all levels for the campus
      const token = localStorage.getItem('sis_access_token');
      const response = await fetch(`http://localhost:8000/api/levels/?campus=${campusId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Levels API response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Levels data:', data);
        const allLevels = data.results || data;
        
        // Get levels that already have coordinators assigned for this shift
        const coordinatorsResponse = await fetch(`http://localhost:8000/api/coordinators/?campus=${campusId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        let assignedLevelIds: number[] = [];
        
        if (coordinatorsResponse.ok) {
          const coordinatorsData = await coordinatorsResponse.json();
          const coordinators = coordinatorsData.results || coordinatorsData;
          assignedLevelIds = coordinators
            .filter((coord: any) => {
              if (!coord.level || !coord.is_currently_active) return false;
              
              // For shift filtering, check if coordinator can handle this shift
              if (shift === 'both') {
                // If coordinator has 'both' shift, they can handle any level
                return coord.shift === 'both';
              } else {
                // If coordinator has specific shift, they can only handle that shift
                return coord.shift === shift || coord.shift === 'both';
              }
            })
            .map((coord: any) => coord.level);
        } else {
          console.error('Coordinators API error:', coordinatorsResponse.status, coordinatorsResponse.statusText);
        }
        
        // Filter levels by shift and remove assigned ones
        let filteredLevels = allLevels.filter((level: any) => {
          // Filter by shift
          if (shift && shift !== 'both') {
            return level.shift === shift || level.shift === 'both';
          }
          return true;
        });
        
        // Remove levels that already have coordinators assigned
        const unassignedLevels = filteredLevels.filter((level: any) => 
          !assignedLevelIds.includes(level.id)
        );
        
        // Ensure we only show 3 levels: Pre-Primary, Primary, Secondary
        const standardLevels = unassignedLevels.filter((level: any) => 
          ['Pre-Primary', 'Primary', 'Secondary'].includes(level.name)
        );
        
        console.log('All levels:', allLevels);
        console.log('Filtered by shift:', filteredLevels);
        console.log('Assigned level IDs:', assignedLevelIds);
        console.log('Standard levels (3 only):', standardLevels);
        
        setLevels(standardLevels);
      } else {
        console.error('Levels API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading levels:', error);
      toast({
        title: "Error",
        description: "Failed to load levels",
        variant: "destructive"
      });
    }
  };

  // Check for duplicate email/CNIC
  const checkDuplicates = async (email: string, cnic: string) => {
    try {
      const token = localStorage.getItem('sis_access_token');
      const duplicateErrors: {[key: string]: string} = {};

      // Check email duplicate
      if (email && email.trim()) {
        const emailResponse = await fetch(`http://localhost:8000/api/coordinators/?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          const existingCoordinators = emailData.results || emailData;
          const duplicateEmail = existingCoordinators.find((coord: any) => 
            coord.email === email && (!isEdit || coord.id !== editData?.id)
          );
          
          if (duplicateEmail) {
            duplicateErrors.email = "This email is already registered with another coordinator. Please use a different email address.";
          }
        }
      }

      // Check CNIC duplicate
      if (cnic && cnic.trim()) {
        const cnicResponse = await fetch(`http://localhost:8000/api/coordinators/?cnic=${encodeURIComponent(cnic)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (cnicResponse.ok) {
          const cnicData = await cnicResponse.json();
          const existingCoordinators = cnicData.results || cnicData;
          const duplicateCnic = existingCoordinators.find((coord: any) => 
            coord.cnic === cnic && (!isEdit || coord.id !== editData?.id)
          );
          
          if (duplicateCnic) {
            duplicateErrors.cnic = "This CNIC is already registered with another coordinator. Please use a different CNIC.";
          }
        }
      }

      setDuplicateErrors(duplicateErrors);
      return Object.keys(duplicateErrors).length === 0;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return true; // Allow submission if check fails
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (invalidFields.includes(field)) {
      setInvalidFields((prev) => prev.filter((f) => f !== field))
    }

    // Clear duplicate error for this field
    if (duplicateErrors[field]) {
      setDuplicateErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Load levels when campus changes
    if (field === 'campus' && value) {
      loadLevels(parseInt(value), formData.shift);
      setFormData((prev: any) => ({ ...prev, level: null })); // Reset level selection
    }
    
    // Reload levels when shift changes (if campus is already selected)
    if (field === 'shift' && formData.campus) {
      loadLevels(parseInt(formData.campus), value);
      setFormData((prev: any) => ({ ...prev, level: null })); // Reset level selection
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
        "cnic",
        "permanent_address",
      ],
      2: [
        "education_level",
        "institution_name",
        "year_of_passing",
        "total_experience_years",
      ],
      3: formData.shift === 'both'
        ? ["campus", "assigned_levels", "shift", "joining_date"]
        : ["campus", "level", "shift", "joining_date"],
    }

    const required = requiredFields[currentStep] || []
    const invalid: string[] = []

    for (const field of required) {
      const value = formData[field]

      // If the field is a boolean (like is_currently_active), both true and false are valid selections
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
        description: invalid.join(", "),
        variant: "destructive"
      })
      return
    }

    // Check for duplicates on step 1 (personal info)
    if (currentStep === 1) {
      const isDuplicateFree = await checkDuplicates(formData.email, formData.cnic);
      if (!isDuplicateFree) {
        toast({
          title: "Duplicate Information",
          description: "Email or CNIC already exists. Please check the error messages below.",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowPreview(true)
    }
  }

  const handleSave = async () => {
    const invalid = validateCurrentStep()
    if (invalid.length > 0) {
      toast({
        title: "Please fill required fields",
        description: invalid.join(", "),
        variant: "destructive"
      })
      return
    }

    // Check for duplicates before going to preview
    const isDuplicateFree = await checkDuplicates(formData.email, formData.cnic);
    if (!isDuplicateFree) {
      toast({
        title: "Duplicate Information",
        description: "Email or CNIC already exists. Please check the error messages below.",
        variant: "destructive"
      });
      return;
    }

    // Go to preview instead of submitting directly
    setShowPreview(true)
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepChange = (step: number) => {
    // Only allow going to previous steps or current step
    if (step <= currentStep) {
      setCurrentStep(step)
    } else {
      toast({
        title: "Step Locked",
        description: "Please complete the current step before proceeding to the next step.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      const url = isEdit ? `http://localhost:8000/api/coordinators/${editData?.id}/` : 'http://localhost:8000/api/coordinators/';
      const method = isEdit ? 'PUT' : 'POST';
      
      // Prepare form data for submission
      const submitData: any = {
        ...formData,
        campus: parseInt(formData.campus),
        level: formData.shift === 'both' ? null : parseInt(formData.level),
        assigned_levels: formData.shift === 'both' ? (Array.isArray(formData.assigned_levels) ? formData.assigned_levels.map((id: any) => parseInt(id)) : []) : [],
        year_of_passing: parseInt(formData.year_of_passing),
        total_experience_years: parseInt(formData.total_experience_years),
      };
      
      // Check if principal is trying to create coordinator with their own email/CNIC
      const currentUser = getCurrentUser();
      if (currentUser && !isEdit) {
        if (submitData.email === currentUser.email) {
          toast({
            title: "Error",
            description: "You cannot create a coordinator with your own email address. Please use a different email.",
            variant: "destructive"
          });
          return;
        }
        
        if (currentUser.cnic && submitData.cnic === currentUser.cnic) {
          toast({
            title: "Error", 
            description: "You cannot create a coordinator with your own CNIC. Please use a different CNIC.",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log('Submitting coordinator data:', submitData);
      
      const token = localStorage.getItem('sis_access_token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        
        // Show success popup modal
        setSubmitError('') // Clear any errors
        const coordinatorName = responseData.full_name || formData.full_name || "Coordinator"
        const employeeCode = responseData.employee_code || "Pending"
        let levelName = "N/A"
        if (formData.shift === 'both') {
          const selectedIds: number[] = Array.isArray(formData.assigned_levels) ? formData.assigned_levels.map((x: any) => parseInt(x)) : []
          const selectedLevels = levels.filter((l) => selectedIds.includes(l.id))
          if (selectedLevels.length > 0) {
            levelName = selectedLevels
              .map((l) => {
                const shiftLabel = (l.shift_display || (l.shift || '')).toString()
                const code = l.code ? ` ${l.code}` : ''
                return `${l.name} (${shiftLabel})${code ? ` •${code}` : ''}`
              })
              .join(', ')
          }
        } else {
          const match = levels.find(l => l.id === parseInt(formData.level))
          if (match) {
            const shiftLabel = (match.shift_display || (match.shift || '')).toString()
            levelName = `${match.name} (${shiftLabel})${match.code ? ` • ${match.code}` : ''}`
          }
        }
        
        setSubmitSuccess({
          name: coordinatorName,
          code: employeeCode,
          level: levelName
        })
        
        sonnerToast.success(`Coordinator ${isEdit ? 'Updated' : 'Added'} Successfully!`, {
          description: `${coordinatorName} (${employeeCode})${!isEdit ? ` • Level: ${levelName}` : ''}`,
        })
        
        // Reset form and go to first step
        if (!isEdit) {
          setFormData({
            full_name: '',
            dob: '',
            gender: '',
            contact_number: '',
            email: '',
            cnic: '',
            permanent_address: '',
            education_level: '',
            institution_name: '',
            year_of_passing: new Date().getFullYear(),
            total_experience_years: 0,
            campus: null,
            level: null,
            joining_date: '',
            is_currently_active: true,
            can_assign_class_teachers: true,
          });
          setCurrentStep(1);
          setShowPreview(false);
          setLevels([]);
        }
        
        onSuccess?.();
      } else {
        const errorText = await response.text();
        let errorMessage = 'Failed to create coordinator. Please try again.';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.email && Array.isArray(errorData.email) && errorData.email[0].includes('already exists')) {
            errorMessage = 'This email is already registered. Please use a different email address.';
          } else if (errorData.cnic && Array.isArray(errorData.cnic) && errorData.cnic[0].includes('already exists')) {
            errorMessage = 'This CNIC is already registered. Please check your CNIC number.';
          } else if (errorData.level && Array.isArray(errorData.level)) {
            errorMessage = 'This level already has a coordinator assigned. Please choose a different level.';
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors.join(', ')
              : errorData.non_field_errors;
          } else if (typeof errorData === 'object') {
            const fieldErrors = Object.values(errorData);
            if (fieldErrors.length > 0) {
              const firstError = Array.isArray(fieldErrors[0]) ? fieldErrors[0][0] : fieldErrors[0];
              errorMessage = firstError;
            }
          }
        } catch {}
        
        setSubmitError(errorMessage)
        sonnerToast.error("Failed to save coordinator", { description: errorMessage })
      }
    } catch (error) {
      console.error('Network/Request error:', error);
      const networkError = "Network error. Please check your connection and try again."
      setSubmitError(networkError)
      sonnerToast.error("Error", { description: networkError });
    } finally {
      setIsSubmitting(false);
    }
  }

    if (showPreview) {
                return (
      <CoordinatorPreview
        formData={formData}
        onEdit={() => setShowPreview(false)}
        onSubmit={handleSubmit}
        onCancel={onCancel || (() => {})}
        isEdit={isEdit}
        campuses={campuses}
        levels={levels}
        isSubmitting={isSubmitting}
      />
    )
  }

              return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                  {submitSuccess.level && (
                    <p className="text-green-600 text-xs mt-1">
                      Level: <strong>{submitSuccess.level}</strong>
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
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-white border-b-2 border-gray-200 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold" style={{ color: '#365486' }}>
                  {isEdit ? 'Edit Coordinator' : 'Add New Coordinator'}
                </CardTitle>
                <CardDescription className="mt-2" style={{ color: '#365486' }}>
                  {isEdit 
                    ? 'Update coordinator information and settings' 
                    : 'Fill in the details to add a new coordinator to the system'
                  }
                </CardDescription>
          </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: '#365486' }}>
                  {Math.round((currentStep / totalSteps) * 100)}%
        </div>
                <div className="text-sm" style={{ color: '#365486' }}>Complete</div>
      </div>
    </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Progress Bar - Exactly like the image */}
            <div className="bg-white px-8 py-6 border-b">
              <div className="flex items-center justify-between mb-4">
            <div>
                  <h3 className="text-lg font-bold text-gray-800">Progress</h3>
                  <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
            </div>
                <div className="text-sm text-gray-500">
                  Add Coordinator
            </div>
          </div>
              
              {/* Horizontal Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(currentStep / totalSteps) * 100}%`,
                    backgroundColor: '#365486'
                  }}
                ></div>
        </div>
              
              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => handleStepChange(step.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentStep === step.id
                            ? "text-white"
                            : step.id < currentStep
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                              : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                        style={currentStep === step.id ? { backgroundColor: '#365486' } : {}}
                      disabled={step.id > currentStep}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep === step.id
                            ? "bg-white"
                            : step.id < currentStep
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-500"
                        }`}
                        style={currentStep === step.id ? { color: '#365486' } : {}}
                      >
                        {step.id < currentStep ? "✓" : step.id}
                      </div>
                      <span>{step.title}</span>
                    </button>
                  </div>
                  ))}
                </div>
              </div>

            {/* Step Content */}
            <div className="p-8">
              {currentStep === 1 && (
                <PersonalInfoStep
                  formData={formData}
                  onInputChange={handleInputChange}
                  invalidFields={invalidFields}
                  duplicateErrors={duplicateErrors}
                />
              )}

              {currentStep === 2 && (
                <EducationStep
                  formData={formData}
                  onInputChange={handleInputChange}
                  invalidFields={invalidFields}
                />
              )}

              {currentStep === 3 && (
                <WorkAssignmentStep
                  formData={formData}
                  onInputChange={handleInputChange}
                  invalidFields={invalidFields}
                  campuses={campuses}
                  levels={levels}
                  onShiftChange={(shift) => {
                    if (formData.campus) {
                      loadLevels(parseInt(formData.campus), shift);
                      setFormData((prev: any) => ({ ...prev, level: null }));
                    }
                  }}
                />
              )}
            </div>

            {/* Error Display */}
            {generalError && (
              <div className="px-8 pb-4">
                <ErrorDisplay 
                  error={{ title: "Error", message: generalError, type: "error" }}
                  variant="compact"
                  onDismiss={() => setGeneralError('')}
                />
              </div>
            )}

            {/* Enhanced Navigation */}
            <div className="bg-gray-50 px-8 py-6 border-t">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 py-2 border-2 border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={currentStep === totalSteps ? handleSave : handleNext}
                    className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEdit ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                        {currentStep === totalSteps ? 'Save & Create' : 'Next Step'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
