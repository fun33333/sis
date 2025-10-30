"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { apiPost, apiPostFormData } from "@/lib/api"
import { useState } from "react"
import { toast as sonnerToast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface CampusPreviewProps {
  formData: any
  onBack: () => void
  onSaved?: () => void
}

export function CampusPreview({ formData, onBack, onSaved }: CampusPreviewProps) {
  const [saving, setSaving] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: any } } = {
      active: { label: "Active", variant: "default" },
      inactive: { label: "Inactive", variant: "secondary" },
      under_construction: { label: "Under Construction", variant: "outline" },
    }
    const statusInfo = statusMap[status] || statusMap.active
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      sonnerToast.loading("Saving campus...")
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Prepare the data for API submission (mapping new field names to backend)
      const campusData = {
        campus_name: formData.campus_name || "",
        campus_code: formData.campus_code || "",
        city: formData.city || "",
        postal_code: formData.postal_code || "",
        district: formData.district || "",
        shift_available: formData.shift_available || "morning",
        status: formData.status || "active",
        registration_number: formData.registration_number || "",
        established_year: formData.established_year || null,
        address_full: formData.address_full || "",
        grades_offered: formData.grades_offered || "",
        instruction_language: formData.instruction_language || "",
        academic_year_start_month: formData.academic_year_start_month || "",
        academic_year_end_month: formData.academic_year_end_month || "",
        avg_class_size: parseInt(formData.avg_class_size || "0") || 0,
        total_classrooms: parseInt(formData.total_classrooms || "0") || 0,
        total_offices: parseInt(formData.total_offices || "0") || 0,
        num_computer_labs: parseInt(formData.num_computer_labs || "0") || 0,
        num_science_labs: parseInt(formData.num_science_labs || "0") || 0,
        num_biology_labs: parseInt(formData.num_biology_labs || "0") || 0,
        num_chemistry_labs: parseInt(formData.num_chemistry_labs || "0") || 0,
        num_physics_labs: parseInt(formData.num_physics_labs || "0") || 0,
        total_rooms: parseInt(formData.total_rooms || "0") || 0,
        male_teachers_washrooms: parseInt(formData.male_teachers_washrooms || "0") || 0,
        female_teachers_washrooms: parseInt(formData.female_teachers_washrooms || "0") || 0,
        male_student_washrooms: parseInt(formData.male_student_washrooms || "0") || 0,
        female_student_washrooms: parseInt(formData.female_student_washrooms || "0") || 0,
        total_washrooms: parseInt(formData.total_washrooms || "0") || 0,
        power_backup: formData.power_backup === "true",
        internet_available: formData.internet_available === "true",
        sports_available: formData.sports_available || "",
        canteen_facility: formData.canteen_facility === "true",
        teacher_transport: formData.teacher_transport === "true",
        meal_program: formData.meal_program === "true",
        governing_body: formData.governing_body || "",
        campus_head_name: formData.campus_head_name || "",
        campus_head_phone: formData.campus_head_phone || "",
        campus_head_email: formData.campus_head_email || "",
        primary_phone: formData.primary_phone || "",
        secondary_phone: formData.secondary_phone || "",
        official_email: formData.official_email || "",
        // Shift-based students and teachers
        total_students: parseInt(formData.total_students || "0") || 0,
        male_students: parseInt(formData.male_students || "0") || 0,
        female_students: parseInt(formData.female_students || "0") || 0,
        morning_male_students: parseInt(formData.morning_male_students || "0") || 0,
        morning_female_students: parseInt(formData.morning_female_students || "0") || 0,
        afternoon_male_students: parseInt(formData.afternoon_male_students || "0") || 0,
        afternoon_female_students: parseInt(formData.afternoon_female_students || "0") || 0,
        total_teachers: parseInt(formData.total_teachers || "0") || 0,
        male_teachers: parseInt(formData.male_teachers || "0") || 0,
        female_teachers: parseInt(formData.female_teachers || "0") || 0,
        morning_male_teachers: parseInt(formData.morning_male_teachers || "0") || 0,
        morning_female_teachers: parseInt(formData.morning_female_teachers || "0") || 0,
        afternoon_male_teachers: parseInt(formData.afternoon_male_teachers || "0") || 0,
        afternoon_female_teachers: parseInt(formData.afternoon_female_teachers || "0") || 0,
        total_non_teaching_staff: parseInt(formData.total_non_teaching_staff || "0") || 0,
        total_staff_members: parseInt(formData.total_staff_members || "0") || 0,
        // Non-teaching staff details
        total_maids: parseInt(formData.total_maids || "0") || 0,
        total_coordinators: parseInt(formData.total_coordinators || "0") || 0,
        total_guards: parseInt(formData.total_guards || "0") || 0,
        other_staff: parseInt(formData.other_staff || "0") || 0,
        // campus_photo will be handled separately
      }

      // Convert data URL to File if photo exists and send as FormData
      let savedCampus: any = null
      
      if (formData.campus_photo && formData.campus_photo.startsWith('data:')) {
        try {
          const photoResponse = await fetch(formData.campus_photo)
          const blob = await photoResponse.blob()
          const photoFile = new File([blob], 'campus-photo.jpg', { type: blob.type })
          
          const formDataToSend = new FormData()
          Object.entries(campusData).forEach(([key, value]) => {
            formDataToSend.append(key, String(value))
          })
          formDataToSend.append('campus_photo', photoFile)
          
          savedCampus = await apiPostFormData("/api/campus/", formDataToSend)
          console.log("✅ Campus saved with photo:", savedCampus)
        } catch (error) {
          console.error('Error converting photo:', error)
          savedCampus = await apiPost("/api/campus/", campusData)
          console.log("✅ Campus saved without photo:", savedCampus)
        }
      } else {
        savedCampus = await apiPost("/api/campus/", campusData)
        console.log("✅ Campus saved:", savedCampus)
      }
      
      sonnerToast.dismiss()
      sonnerToast.success("✅ Campus Added Successfully!", {
        description: (
          <div className="space-y-1">
            <p className="font-semibold">Campus Code: {savedCampus?.campus_code || "N/A"}</p>
            <p>Campus ID: {savedCampus?.campus_id || "N/A"}</p>
          </div>
        ),
        duration: 5000,
      })
      
      onSaved?.()
    } catch (error: any) {
      console.error("Error saving campus:", error)
      sonnerToast.dismiss()
      sonnerToast.error(error?.message || "Failed to save campus", {
        description: "Please try again or contact support if the problem persists.",
      })
    } finally {
      setSaving(false)
    }
  }

  const isBothShift = formData.shift_available === "both"
  const isSingleShift = formData.shift_available === "morning" || formData.shift_available === "afternoon"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Campus Preview
            {getStatusBadge(formData.status)}
          </CardTitle>
          <CardDescription>
            Review the campus information before saving
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campus Photo */}
          {formData.campus_photo && (
            <div>
              <h3 className="font-semibold mb-2">Campus Photo</h3>
              <img 
                src={formData.campus_photo} 
                alt="Campus" 
                className="w-full max-w-md h-48 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Campus Name:</span>
                <p className="font-medium">{formData.campus_name || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Campus Code:</span>
                <p className="font-medium">{formData.campus_code || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">City:</span>
                <p className="font-medium">{formData.city || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Postal Code:</span>
                <p className="font-medium">{formData.postal_code || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">District:</span>
                <p className="font-medium">{formData.district || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Shift Available:</span>
                <p className="font-medium">{(formData.shift_available || "morning").charAt(0).toUpperCase() + (formData.shift_available || "morning").slice(1)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Registration Number:</span>
                <p className="font-medium">{formData.registration_number || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Established Year:</span>
                <p className="font-medium">{formData.established_year || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-gray-600">Full Address:</span>
                <p className="font-medium">{formData.address_full || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Grades Offered:</span>
                <p className="font-medium">{formData.grades_offered || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Language of Instruction:</span>
                <p className="font-medium">{formData.instruction_language || "Not provided"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div>
            <h3 className="font-semibold mb-3">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Academic Year Start:</span>
                <p className="font-medium">{formData.academic_year_start_month || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Academic Year End:</span>
                <p className="font-medium">{formData.academic_year_end_month || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Average Class Size:</span>
                <p className="font-medium">{formData.avg_class_size || "0"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Students Information - Conditional based on shift */}
          {isBothShift ? (
            <div>
              <h3 className="font-semibold mb-3">Students - Both Shifts</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-medium text-sm mb-2">Morning Shift</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-600">Male: {formData.morning_male_students || "0"}</span>
                    <span className="text-gray-600">Female: {formData.morning_female_students || "0"}</span>
                    <span className="font-semibold">Total: {formData.morning_total_students || "0"}</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-medium text-sm mb-2">Afternoon Shift</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-600">Male: {formData.afternoon_male_students || "0"}</span>
                    <span className="text-gray-600">Female: {formData.afternoon_female_students || "0"}</span>
                    <span className="font-semibold">Total: {formData.afternoon_total_students || "0"}</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <span className="font-semibold">Total Students in Campus: {formData.total_students || "0"}</span>
                </div>
              </div>
            </div>
          ) : isSingleShift ? (
          <div>
              <h3 className="font-semibold mb-3">Students - {(formData.shift_available || "morning").charAt(0).toUpperCase() + (formData.shift_available || "morning").slice(1)} Shift</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Male Students:</span>
                  <p className="font-medium">{formData.male_students || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Female Students:</span>
                  <p className="font-medium">{formData.female_students || "0"}</p>
              </div>
              <div>
                  <span className="text-sm text-gray-600">Total Students:</span>
                  <p className="font-medium">{formData.total_students || "0"}</p>
              </div>
            </div>
          </div>
          ) : null}

          <Separator />

          {/* Teachers Information - Conditional based on shift */}
          {isBothShift ? (
            <div>
              <h3 className="font-semibold mb-3">Teachers - Both Shifts</h3>
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded">
                  <h4 className="font-medium text-sm mb-2">Morning Shift</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-600">Male: {formData.morning_male_teachers || "0"}</span>
                    <span className="text-gray-600">Female: {formData.morning_female_teachers || "0"}</span>
                    <span className="font-semibold">Total: {formData.morning_total_teachers || "0"}</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <h4 className="font-medium text-sm mb-2">Afternoon Shift</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-600">Male: {formData.afternoon_male_teachers || "0"}</span>
                    <span className="text-gray-600">Female: {formData.afternoon_female_teachers || "0"}</span>
                    <span className="font-semibold">Total: {formData.afternoon_total_teachers || "0"}</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <span className="font-semibold">Total Teachers in Campus: {formData.total_teachers || "0"}</span>
                </div>
              </div>
            </div>
          ) : isSingleShift ? (
          <div>
              <h3 className="font-semibold mb-3">Teachers - {(formData.shまたは_available || "morning").charAt(0).toUpperCase() + (formData.shift_available || "morning").slice(1)} Shift</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <span className="text-sm text-gray-600">Male Teachers:</span>
                  <p className="font-medium">{formData.male_teachers || "0"}</p>
              </div>
              <div>
                  <span className="text-sm text-gray-600">Female Teachers:</span>
                  <p className="font-medium">{formData.female_teachers || "0"}</p>
              </div>
              <div>
                  <span className="text-sm text-gray-600">Total Teachers:</span>
                  <p className="font-medium">{formData.total_teachers || "0"}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Non-Teaching Staff:</span>
              <p className="font-medium">{formData.total_non_teaching_staff || "0"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Staff:</span>
              <p className="font-medium">{formData.total_staff_members || "0"}</p>
              </div>
          </div>

          <Separator />

          {/* Infrastructure - Rooms */}
          <div>
            <h3 className="font-semibold mb-3">Infrastructure - Rooms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Classrooms:</span>
                <p className="font-medium">{formData.total_classrooms || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Offices:</span>
                <p className="font-medium">{formData.total_offices || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Computer Labs:</span>
                <p className="font-medium">{formData.num_computer_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Science Labs:</span>
                <p className="font-medium">{formData.num_science_labs || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Biology Labs:</span>
                <p className="font-medium">{formData.num_biology_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Chemistry Labs:</span>
                <p className="font-medium">{formData.num_chemistry_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Physics Labs:</span>
                <p className="font-medium">{formData.num_physics_labs || "0"}</p>
              </div>
              <div className="p-2 bg fo-green-50 rounded">
                <span className="text-sm text-gray-600">Total Rooms:</span>
                <p className="font-semibold">{formData.total_rooms || "0"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Infrastructure - Washrooms */}
          <div>
            <h3 className="font-semibold mb-3">Infrastructure - Washrooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-purple-50 rounded">
                <h4 className="font-medium text-sm mb-2">Teachers Washrooms</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Male: {formData.male_teachers_washrooms || "0"}</span>
                  <span className="text-gray-600">Female: {formData.female_teachers_washrooms || "0"}</span>
                </div>
                <p className="font-semibold mt-1">Total: {formData.staff_washrooms || "0"}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-sm mb-2">Student Washrooms</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Male: {formData.male_student_washrooms || "0"}</span>
                  <span className="text-gray-600">Female: {formData.female_student_washrooms || "0"}</span>
                </div>
                <p className="font-semibold mt-1">Total: {formData.student_washrooms || "0"}</p>
              </div>
              <div className="md:col-span-2 p-3 bg-green-50 rounded">
                <span className="font-semibold">Total Washrooms in Campus: {formData.total_washrooms || "0"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Facilities */}
          <div>
            <h3 className="font-semibold mb-3">Facilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Power Backup:</span>
                <p className="font-medium">{formData.power_backup === "true" ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Internet Available:</span>
                <p className="font-medium">{formData.internet_available === "true" ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Sports Available:</span>
                <p className="font-medium">{formData.sports_available || "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Canteen Available:</span>
                <p className="font-medium">{formData.canteen_facility === "true" ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Teacher Transport:</span>
                <p className="font-medium">{formData.teacher_transport === "true" ? "Yes" : formData.teacher_transport === "false" ? "No" : "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Meal Program:</span>
                <p className="font-medium">{formData.meal_program === "true" ? "Yes" : formData.meal_program === "false" ? "No" : "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Library Available:</span>
                <p className="font-medium">{formData.library_available === "true" ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Campus Head & Contact */}
          <div>
            <h3 className="font-semibold mb-3">Campus Head & Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Campus Head Name:</span>
                <p className="font-medium">{formData.campus_head_name || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Campus Head Phone:</span>
                <p className="font-medium">{formData.campus_head_phone || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Campus Head Email:</span>
                <p className="font-medium">{formData.campus_head_email || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Primary Phone:</span>
                <p className="font-medium">{formData.primary_phone || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Secondary Phone:</span>
                <p className="font-medium">{formData.secondary_phone || "Not provided"}</p>
              </div>
          <div>
                <span className="text-sm text-gray-600">Official Email:</span>
                <p className="font-medium">{formData.official_email || "Not provided"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </Button>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Campus
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
