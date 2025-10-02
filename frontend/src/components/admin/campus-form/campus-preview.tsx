"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { apiPost } from "@/lib/api"
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

  const formatDate = (value: any) => {
    if (!value) return null
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const d = new Date(value)
    if (isNaN(d.getTime())) return null
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Show loading message
      sonnerToast.loading("Saving campus...")
      
      // Add some delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Prepare the data for API submission
      const campusData = {
        name: formData.name || "",
        code: formData.code || "",
        status: formData.status || "active",
        governing_body: formData.governing_body || "",
        registration_no: formData.registration_no || "",
        address: formData.address || "",
        grades_offered: formData.grades_offered || "",
        languages_of_instruction: formData.languages_of_instruction || "english",
        academic_year_start_month: formData.academic_year_start_month || "",
        academic_year_end_month: formData.academic_year_end_month || "",
        capacity: parseInt(formData.capacity || "0") || 0,
        avg_class_size: parseInt(formData.avg_class_size || "0") || 0,
        num_students: parseInt(formData.num_students || "0") || 0,
        num_students_male: parseInt(formData.num_students_male || "0") || 0,
        num_students_female: parseInt(formData.num_students_female || "0") || 0,
        num_teachers: parseInt(formData.num_teachers || "0") || 0,
        num_teachers_male: parseInt(formData.num_teachers_male || "0") || 0,
        num_teachers_female: parseInt(formData.num_teachers_female || "0") || 0,
        total_classrooms: parseInt(formData.total_classrooms || "0") || 0,
        office_rooms: parseInt(formData.office_rooms || "0") || 0,
        num_rooms: parseInt(formData.num_rooms || "0") || 0,
        facilities: formData.facilities || "",
        photo: formData.photo || "",
        biology_labs: parseInt(formData.biology_labs || "0") || 0,
        chemistry_labs: parseInt(formData.chemistry_labs || "0") || 0,
        physics_labs: parseInt(formData.physics_labs || "0") || 0,
        computer_labs: parseInt(formData.computer_labs || "0") || 0,
        library: formData.library === "true",
        toilets_male: parseInt(formData.toilets_male || "0") || 0,
        toilets_female: parseInt(formData.toilets_female || "0") || 0,
        toilets_teachers: parseInt(formData.toilets_teachers || "0") || 0,
        power_backup: formData.power_backup === "true",
        internet_wifi: formData.internet_wifi === "true",
        established_date: formatDate(formData.established_date),
        campus_address: formData.campus_address || "",
        total_teachers: parseInt(formData.total_teachers || "0") || 0,
        total_non_teaching_staff: parseInt(formData.total_non_teaching_staff || "0") || 0,
        staff_contact_hr: formData.staff_contact_hr || "",
        admission_office_contact: formData.admission_office_contact || "",
        is_draft: formData.is_draft === "true",
      }

      await apiPost("/api/campus/", campusData)
      
      // Dismiss loading and show success
      sonnerToast.dismiss()
      sonnerToast.success("Campus added successfully!", {
        description: "Campus has been created and saved to the database.",
        duration: 4000,
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

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: any } } = {
      active: { label: "Active", variant: "default" },
      not_active: { label: "Not Active", variant: "secondary" },
      underconstruction: { label: "Under Construction", variant: "outline" },
    }
    const statusInfo = statusMap[status] || statusMap.active
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getLanguageLabel = (lang: string) => {
    const langMap: { [key: string]: string } = {
      urdu: "Urdu",
      english: "English",
      english_and_urdu: "English and Urdu",
    }
    return langMap[lang] || lang
  }

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
          {formData.photo && (
            <div>
              <h3 className="font-semibold mb-2">Campus Photo</h3>
              <img 
                src={formData.photo} 
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
                <p className="font-medium">{formData.name || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Campus Code:</span>
                <p className="font-medium">{formData.code || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Governing Body:</span>
                <p className="font-medium">{formData.governing_body || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Registration No:</span>
                <p className="font-medium">{formData.registration_no || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-gray-600">Address:</span>
                <p className="font-medium">{formData.address || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Grades Offered:</span>
                <p className="font-medium">{formData.grades_offered || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Languages of Instruction:</span>
                <p className="font-medium">{getLanguageLabel(formData.languages_of_instruction) || "Not provided"}</p>
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
                <span className="text-sm text-gray-600">Maximum Capacity:</span>
                <p className="font-medium">{formData.capacity || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Average Class Size:</span>
                <p className="font-medium">{formData.avg_class_size || "0"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Student & Staff Information */}
          <div>
            <h3 className="font-semibold mb-3">Students & Staff</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Students:</span>
                <p className="font-medium">{formData.num_students || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Male Students:</span>
                <p className="font-medium">{formData.num_students_male || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Female Students:</span>
                <p className="font-medium">{formData.num_students_female || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Teachers:</span>
                <p className="font-medium">{formData.num_teachers || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Male Teachers:</span>
                <p className="font-medium">{formData.num_teachers_male || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Female Teachers:</span>
                <p className="font-medium">{formData.num_teachers_female || "0"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Infrastructure */}
          <div>
            <h3 className="font-semibold mb-3">Infrastructure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Classrooms:</span>
                <p className="font-medium">{formData.total_classrooms || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Office Rooms:</span>
                <p className="font-medium">{formData.office_rooms || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Rooms:</span>
                <p className="font-medium">{formData.num_rooms || "0"}</p>
              </div>
            </div>
            {formData.facilities && (
              <div className="mt-4">
                <span className="text-sm text-gray-600">Facilities:</span>
                <p className="font-medium">{formData.facilities}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Labs & Facilities */}
          <div>
            <h3 className="font-semibold mb-3">Labs & Facilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Biology Labs:</span>
                <p className="font-medium">{formData.biology_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Chemistry Labs:</span>
                <p className="font-medium">{formData.chemistry_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Physics Labs:</span>
                <p className="font-medium">{formData.physics_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Computer Labs:</span>
                <p className="font-medium">{formData.computer_labs || "0"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Library:</span>
                <p className="font-medium">{formData.library === "true" ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Power Backup:</span>
                <p className="font-medium">{formData.power_backup === "true" ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Internet WiFi:</span>
                <p className="font-medium">{formData.internet_wifi === "true" ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Staff Contact HR:</span>
                <p className="font-medium">{formData.staff_contact_hr || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Admission Office Contact:</span>
                <p className="font-medium">{formData.admission_office_contact || "Not provided"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Draft Status */}
          <div>
            <span className="text-sm text-gray-600">Save as Draft:</span>
            <p className="font-medium">{formData.is_draft === "true" ? "Yes" : "No"}</p>
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