"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save, Loader2 } from "lucide-react"
import { apiPost } from "@/lib/api"
import type { CampusCreateRequest, CampusStatus } from "@/types/dashboard"
import { useState } from "react"
import { toast as sonnerToast } from "sonner"

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

  const normalizeStatus = (val: any): CampusStatus => {
    const s = String(val || "").toLowerCase().trim()
    if (s === "active") return "active"
    if (s === "inactive") return "inactive"
    if (s === "temporary_closed" || s === "temporary closed" || s === "temporary-closed") return "temporary_closed"
    return "active"
  }

  const ensureRequiredOrThrow = () => {
    const missing: string[] = []
    if (!formData.campusName) missing.push("campusName")
    if (!formData.gradesOffered) missing.push("gradesOffered")
    if (!formData.languagesOfInstruction) missing.push("languagesOfInstruction")
    if (!formData.address) missing.push("address")
    if (!formData.academicYearStartMonth) missing.push("academicYearStartMonth")
    if (!formData.academicYearEndMonth) missing.push("academicYearEndMonth")
    if (missing.length) {
      throw new Error(`Missing/invalid required: ${missing.join(", ")}`)
    }
  }

  const buildPayload = (): Omit<CampusCreateRequest, 'description' | 'classes_per_grade' | 'toilets_accessible' | 'teacher_student_ratio'> => {
    return {
      name: formData.campusName,
      code: formData.campusCode || null,
      status: normalizeStatus(formData.campusStatus),
      governing_body: formData.governingBody || null,
      registration_no: formData.registrationNumber || null,
      address: formData.address,
      grades_offered: formData.gradesOffered,
      languages_of_instruction: formData.languagesOfInstruction,
      academic_year_start_month: Number(formData.academicYearStartMonth),
      academic_year_end_month: Number(formData.academicYearEndMonth || 0),
      capacity: Number(formData.campusCapacity || formData.totalStudentCapacity || 0),
      avg_class_size: Number(formData.averageClassSize || 0),
      num_students: Number(formData.totalStudents || formData.currentStudentEnrollment || 0),
      num_students_male: Number(formData.maleStudents || formData.num_students_male || 0),
      num_students_female: Number(formData.femaleStudents || formData.num_students_female || 0),
      num_teachers: Number(formData.totalTeachers || 0),
      num_teachers_male: Number(formData.maleTeachers || formData.num_teachers_male || 0),
      num_teachers_female: Number(formData.femaleTeachers || formData.num_teachers_female || 0),
      num_rooms: Number(formData.totalRooms || 0),
      total_classrooms: Number(formData.totalClassrooms || 0),
      office_rooms: Number(formData.officeRooms || 0),
      biology_labs: Number(formData.biologyLabs || 0),
      chemistry_labs: Number(formData.chemistryLabs || 0),
      physics_labs: Number(formData.physicsLabs || 0),
      computer_labs: Number(formData.computerLabs || 0),
      library: (String(formData.library) === "true") || Boolean(formData.library) || false,
      toilets_male: Number(formData.boysWashrooms || formData.toilets_male || 0),
      toilets_female: Number(formData.girlsWashrooms || formData.toilets_female || 0),
      toilets_teachers: Number(
        Number(formData.toiletsTeachers || 0) ||
        Number((formData.maleTeacherWashrooms || 0) + (formData.femaleTeacherWashrooms || 0))
      ),
      facilities: formData.facilities || null,
      power_backup: (String(formData.powerBackup) === "true") || Boolean(formData.powerBackup) || false,
      internet_wifi: (String(formData.internetWifi) === "true") || Boolean(formData.internetWifi) || false,
      established_date: formatDate(formData.establishedDate || formData.campusEstablishedYear),
      campus_address: formData.campusAddress || formData.address || null,
      special_classes: formData.specialClasses || null,
      total_teachers: Number(formData.totalTeachers || 0),
      total_non_teaching_staff: Number(formData.totalNonTeachingStaff || formData.totalStaffMembers || 0),
      staff_contact_hr: formData.staffContactHr || null,
      admission_office_contact: formData.admissionOfficeContact || null,
      photo: formData.campusPhoto || null,
      is_draft: String(formData.isDraft || "false") === "true",
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      ensureRequiredOrThrow()
      const payload = buildPayload()

      // start API call and a 2s minimum delay in parallel so UI always shows loader for ~2s
      const apiPromise = apiPost("/api/campus/", payload)
      const delay = new Promise((res) => setTimeout(res, 2000))

      // wait for both the api call and the minimum delay
      await Promise.all([apiPromise, delay])

      // show a polished Sonner toast (success)
      sonnerToast.success("Campus saved", {
        description: "Campus has been saved successfully.",
        duration: 4000,
      })

      // notify parent to reset/redirect to step 1
      onSaved?.()
    } catch (err: any) {
      // show polished Sonner error toast
      sonnerToast.error(err?.message || "An unexpected error occurred while saving.", {
        duration: 6000,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Campus Information Preview
        </CardTitle>
        <CardDescription>Review all information before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">General Information</h3>
            <div className="space-y-2">
              <div><strong>Campus Name:</strong> {formData.campusName || "N/A"}</div>
              <div><strong>Registration Number:</strong> {formData.registrationNumber || "N/A"}</div>
              <div><strong>Status:</strong> {formData.campusStatus || "N/A"}</div>
              <div><strong>Languages:</strong> {formData.languagesOfInstruction || "N/A"}</div>
              <div><strong>Academic Year:</strong> {formData.academicYearStartMonth && formData.academicYearEndMonth ? `${formData.academicYearStartMonth} - ${formData.academicYearEndMonth}` : "N/A"}</div>
              <div><strong>District:</strong> {formData.district || "N/A"}</div>
              <div><strong>City:</strong> {formData.city || "N/A"}</div>
              <div><strong>Postal Code:</strong> {formData.postalCode || "N/A"}</div>
              <div><strong>Campus Established Year:</strong> {formData.campusEstablishedYear || "N/A"}</div>
              <div><strong>Shift Available:</strong> {formData.shiftAvailable || "N/A"}</div>
              <div><strong>Education Level Available:</strong> {formData.educationLevelAvailable || "N/A"}</div>
              <div><strong>Current Grade/Class:</strong> {formData.currentGradeClass || "N/A"}</div>
              <div><strong>Total Student Capacity:</strong> {formData.totalStudentCapacity || "N/A"}</div>
              <div><strong>Current Student Enrollment:</strong> {formData.currentStudentEnrollment || "N/A"}</div>
              <div><strong>Total Staff Members:</strong> {formData.totalStaffMembers || "N/A"}</div>
              <div><strong>Total Teachers:</strong> {formData.totalTeachers || "N/A"}</div>
              <div><strong>Total Coordinators:</strong> {formData.totalCoordinators || "N/A"}</div>
              <div><strong>Total Maids:</strong> {formData.totalMaids || "N/A"}</div>
              <div><strong>Total Guards:</strong> {formData.totalGuards || "N/A"}</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Facilities</h3>
            <div className="space-y-2">
              <div><strong>Total Rooms:</strong> {formData.totalRooms || "N/A"}</div>
              <div><strong>Total Classrooms:</strong> {formData.totalClassrooms || "N/A"}</div>
              <div><strong>Average Class Size:</strong> {formData.averageClassSize || "N/A"}</div>
              <div><strong>Average Current Class Capacity:</strong> {formData.averageCurrentClassCapacity || "N/A"}</div>
              <div><strong>Computer Labs:</strong> {formData.computerLabs || "N/A"}</div>
              <div><strong>Science Labs:</strong> {formData.scienceLabs || "N/A"}</div>
              <div><strong>Teacher Transport Facility:</strong> {formData.teacherTransportFacility || "N/A"}</div>
              <div><strong>Canteen Facility:</strong> {formData.canteenFacility || "N/A"}</div>
              <div><strong>Meal Programs:</strong> {formData.mealPrograms || "N/A"}</div>
              <div><strong>Boys Washrooms:</strong> {formData.boysWashrooms || "N/A"}</div>
              <div><strong>Girls Washrooms:</strong> {formData.girlsWashrooms || "N/A"}</div>
              <div><strong>Male Teacher Washrooms:</strong> {formData.maleTeacherWashrooms || "N/A"}</div>
              <div><strong>Female Teacher Washrooms:</strong> {formData.femaleTeacherWashrooms || "N/A"}</div>
              <div><strong>Facilities:</strong> {formData.facilities || "N/A"}</div>
              <div><strong>Any Other Room:</strong> {formData.anyOtherRoom || "N/A"}</div>
              <div><strong>Sports Facilities:</strong> {formData.sportsFacilities || "N/A"}</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Contact Information</h3>
            <div className="space-y-2">
              <div><strong>Primary Phone:</strong> {formData.primaryPhone || "N/A"}</div>
              <div><strong>Secondary Phone:</strong> {formData.secondaryPhone || "N/A"}</div>
              <div><strong>Official Email:</strong> {formData.officialEmail || "N/A"}</div>
              <div><strong>Campus Head Name:</strong> {formData.campusHeadName || "N/A"}</div>
              <div><strong>Campus Head Phone:</strong> {formData.campusHeadPhone || "N/A"}</div>
              <div><strong>Campus Head Email:</strong> {formData.campusHeadEmail || "N/A"}</div>
              <div><strong>Coordinator Name:</strong> {formData.campusHeadCoordinatorName || "N/A"}</div>
              <div><strong>Coordinator Phone:</strong> {formData.campusHeadCoordinatorPhone || "N/A"}</div>
              <div><strong>Coordinator Email:</strong> {formData.campusHeadCoordinatorEmail || "N/A"}</div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Campus"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
