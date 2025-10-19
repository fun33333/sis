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

  const totalSteps = steps.length

  // Load data on component mount
  useEffect(() => {
    loadCurrentUserCampus();
    if (editData?.campus) {
      loadLevels(editData.campus);
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

  // Load levels based on selected campus (only unassigned levels)
  const loadLevels = async (campusId: number) => {
    try {
      console.log('Loading levels for campus:', campusId);
      
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
        
        // Get levels that already have coordinators assigned
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
            .filter((coord: any) => coord.level && coord.is_currently_active)
            .map((coord: any) => coord.level);
        } else {
          console.error('Coordinators API error:', coordinatorsResponse.status, coordinatorsResponse.statusText);
        }
        
        // Filter out levels that already have coordinators
        const unassignedLevels = allLevels.filter((level: any) => 
          !assignedLevelIds.includes(level.id)
        );
        
        console.log('All levels:', allLevels);
        console.log('Assigned level IDs:', assignedLevelIds);
        console.log('Unassigned levels:', unassignedLevels);
        
        setLevels(unassignedLevels);
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
      loadLevels(parseInt(value));
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
      3: [
        "campus",
        "level",
        "joining_date",
      ],
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
      const submitData = {
        ...formData,
        campus: parseInt(formData.campus),
        level: parseInt(formData.level),
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
        toast({
          title: "Success",
          description: isEdit ? 'Coordinator updated successfully! 🎉' : 'Coordinator added successfully! 🎉',
        });
        
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
        let errorMessage = 'Failed to save coordinator';
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          
          // Handle validation errors
          if (errorData.email && Array.isArray(errorData.email)) {
            errorMessage = `Email error: ${errorData.email[0]}`;
          } else if (errorData.cnic && Array.isArray(errorData.cnic)) {
            errorMessage = `CNIC error: ${errorData.cnic[0]}`;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            // Handle other validation errors
            const fieldErrors = Object.keys(errorData).map(field => 
              `${field}: ${Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field]}`
            ).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Network/Request error:', error);
      let errorMessage = 'An error occurred while saving';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
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
                />
              )}
            </div>

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