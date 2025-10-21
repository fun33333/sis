"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { API_ENDPOINTS, apiPost, getAllCampuses, getLevels, getGrades, getClassrooms } from "@/lib/api"
import { toast } from "sonner"

interface TeacherPreviewProps {
  formData: any
  onBack: () => void
  onSubmit?: () => void
}

export function TeacherPreview({ formData, onBack, onSubmit }: TeacherPreviewProps) {
  const [saving, setSaving] = useState(false)
  const [campuses, setCampuses] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])

  useEffect(() => {
    getAllCampuses()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
        setCampuses(list)
      })
      .catch(() => {
        toast.error("Failed to load campuses for mapping")
      })
  }, [])

  // Load levels, grades, and classrooms for display
  useEffect(() => {
    if (formData.current_campus) {
      // Load levels
      getLevels(formData.current_campus)
        .then((data: any) => {
          const levelsList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          setLevels(levelsList)
        })
        .catch(err => console.error('Error fetching levels:', err))
    }
  }, [formData.current_campus])

  useEffect(() => {
    if (formData.class_teacher_level) {
      // Load grades
      getGrades(formData.class_teacher_level)
        .then((data: any) => {
          const gradesList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          setGrades(gradesList)
        })
        .catch(err => console.error('Error fetching grades:', err))
    }
  }, [formData.class_teacher_level])

  useEffect(() => {
    if (formData.class_teacher_grade) {
      // Load classrooms
      getClassrooms(formData.class_teacher_grade)
        .then((data: any) => {
          const classroomsList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          setClassrooms(classroomsList)
        })
        .catch(err => console.error('Error fetching classrooms:', err))
    }
  }, [formData.class_teacher_grade])

  const getCampusId = (value: string) => {
    if (!value) return null
    const v = String(value).trim().toLowerCase()
    // try match by name
    let campus = campuses.find((c) => String(c?.name || '').trim().toLowerCase() === v)
    if (campus) return campus.id
    // try by code
    campus = campuses.find((c) => String(c?.code || '').trim().toLowerCase() === v)
    if (campus) return campus.id
    // fuzzy contains
    campus = campuses.find((c) => String(c?.name || '').toLowerCase().includes(v))
    return campus ? campus.id : null
  }

  // Helper functions to get names from IDs
  const getLevelName = (levelId: string | number) => {
    if (!levelId) return "N/A"
    const level = levels.find(l => l.id === parseInt(String(levelId)))
    return level ? `${level.name} - ${level.shift_display || level.shift}` : `Level ${levelId}`
  }

  const getGradeName = (gradeId: string | number) => {
    if (!gradeId) return "N/A"
    const grade = grades.find(g => g.id === parseInt(String(gradeId)))
    return grade ? grade.name : `Grade ${gradeId}`
  }

  const getClassroomName = (classroomId: string | number) => {
    if (!classroomId) return "N/A"
    const classroom = classrooms.find(c => c.id === parseInt(String(classroomId)))
    return classroom ? `${classroom.grade_name || classroom.grade} - ${classroom.section}` : `Classroom ${classroomId}`
  }

  const buildPayload = (overrideAssignedClassroom?: number | string | null) => {
    // Manual classroom assignment if we have level, grade, and section but no classroom
    let assignedClassroom = overrideAssignedClassroom ?? formData.assigned_classroom
    
    // (debug removed)
    
    if (!assignedClassroom && formData.class_teacher_level && formData.class_teacher_grade && formData.class_teacher_section && classrooms.length > 0) {
      const matchingClassroom = classrooms.find(classroom => {
        const gradeMatch = classroom.grade === parseInt(formData.class_teacher_grade) || classroom.grade === formData.class_teacher_grade
        const sectionMatch = classroom.section === formData.class_teacher_section
        return gradeMatch && sectionMatch
      })
      if (matchingClassroom) {
        assignedClassroom = matchingClassroom.id
      } else {
        // no-op
      }
    } else {
      // no-op
    }

    const payload: any = {
      // Personal info tab fields
      full_name: formData.full_name || null,
      dob: formData.dob && typeof formData.dob === 'string' ? formData.dob : null,
      gender: formData.gender || null,
      contact_number: formData.contact_number || null,
      email: formData.email || null,
      permanent_address: formData.permanent_address || null,
      current_address: formData.current_address || null,
      marital_status: formData.marital_status || null,
      cnic: formData.cnic || null,

      // Education tab fields (simplified)
      education_level: formData.education_level || null,
      institution_name: formData.institution_name || null,
      year_of_passing: formData.year_of_passing ? Number(formData.year_of_passing) : null,
      education_subjects: formData.education_subjects || null,
      education_grade: formData.education_grade || null,

      // Experience tab fields (simplified)
      previous_institution_name: formData.previous_institution_name || null,
      previous_position: formData.previous_position || null,
      experience_from_date: formData.experience_from_date && typeof formData.experience_from_date === 'string' ? formData.experience_from_date : null,
      experience_to_date: formData.experience_to_date && typeof formData.experience_to_date === 'string' ? formData.experience_to_date : null,
      total_experience_years: formData.total_experience_years ? Number(formData.total_experience_years) : null,

      // Current role tab fields (simplified)
      joining_date: formData.joining_date && typeof formData.joining_date === 'string' ? formData.joining_date : null,
      current_campus: getCampusId(formData.current_campus),
      current_subjects: formData.current_subjects || null,
      current_classes_taught: formData.current_classes_taught || null,
      current_extra_responsibilities: formData.current_extra_responsibilities || null,
      is_currently_active: typeof formData.is_currently_active === 'boolean' ? formData.is_currently_active : true,
      shift: formData.shift || 'morning',
      
      // Class teacher fields
      is_class_teacher: formData.is_class_teacher === true || (formData.class_teacher_level && formData.class_teacher_grade && formData.class_teacher_section),
      class_teacher_level: formData.class_teacher_level || null,
      class_teacher_grade: formData.class_teacher_grade || null,
      class_teacher_section: formData.class_teacher_section || null,
      assigned_classroom: assignedClassroom || null,
    }

    // (debug removed)
    
    // Strip null/empty values (but keep assigned_classroom even if null for debugging)
    Object.keys(payload).forEach((k) => {
      const v = payload[k]
      if (v === null || v === undefined || v === "") {
        if (k !== 'assigned_classroom') { // Keep assigned_classroom for debugging
          delete payload[k]
        }
      }
    })
    
    return payload
  }

  const handleSave = async () => {
    if (onSubmit) {
      setSaving(true)
      try {
        await onSubmit()
        // Success handling is done in the parent component
      } catch (error) {
        console.error("Save failed:", error)
      } finally {
        setSaving(false)
      }
      return
    }
    
    setSaving(true)
    try {
      // Quick client-side guard for required fields to avoid long waits if any
      const missing: string[] = []
      if (!formData.full_name) missing.push("Full name")
      if (!formData.dob) missing.push("Date of Birth")
      if (!formData.gender) missing.push("Gender")
      if (!formData.contact_number) missing.push("Contact number")
      if (!formData.email) missing.push("Email")
      if (!formData.current_address) missing.push("Current address")
      if (!formData.cnic) missing.push("CNIC")
      if (!formData.current_campus) missing.push("Current campus")
      if (!formData.joining_date) missing.push("Joining date")
      if (!formData.shift) missing.push("Shift")
      if (missing.length > 0) {
        toast.error("Please fill required fields", { description: missing.join(", ") })
        return
      }

      // Resolve assigned classroom just-in-time to avoid race conditions with state updates
      let overrideAssignedClassroom: number | null = null
      try {
        if (!formData.assigned_classroom && formData.class_teacher_level && formData.class_teacher_grade && formData.class_teacher_section) {
          const data: any = await getClassrooms(formData.class_teacher_grade)
          const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          const match = list.find((c: any) => (c.grade === parseInt(formData.class_teacher_grade) || c.grade === formData.class_teacher_grade) && c.section === formData.class_teacher_section)
          if (match) {
            overrideAssignedClassroom = match.id
          } else {
            // no-op
          }
        }
      } catch (e) {
        // keep silent
      }

      const payload = buildPayload(overrideAssignedClassroom)
      // (debug removed)

      // Timeout safety so UI doesn't hang forever if the request takes too long
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 15000))
      const response = await Promise.race([apiPost(API_ENDPOINTS.TEACHERS, payload), timeout]) as any
      
      // Extract teacher name and employee code from response
      const teacherName = response?.full_name || formData.full_name || "Teacher"
      const employeeCode = response?.employee_code || "Pending"
      
      toast.success("Teacher Added Successfully!", { 
        description: `${teacherName} (${employeeCode}) has been added to the system.` 
      })
      onBack()
    } catch (err: any) {
      console.error("Failed to save teacher", err)
      let description = err?.message || "Unexpected error"
      try {
        if (typeof err?.response === 'string') {
          // Try to parse DRF error JSON if present
          // Error response format is:
          // {
          //   "field1": "error message 1",
          //   "field2": "error message 2",
          //   ...
          // }
          const parsed = JSON.parse(err.response)
          description = Object.entries(parsed).map(([k, v]) => `${k}: ${(Array.isArray(v)? v.join(' | ') : String(v))}`).join("; ")
        }
      } catch (_) {}
      toast.error("Failed to save teacher", { description })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Teacher Information Preview
        </CardTitle>
        <CardDescription>Review all information before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Personal Information</CardTitle>
              <CardDescription>Basic details</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                 <div><strong>Full name:</strong> {formData.full_name || "N/A"}</div>
                 <div><strong>Date of Birth:</strong> {formData.dob || "N/A"}</div>
                 <div><strong>Gender:</strong> {formData.gender || "N/A"}</div>
                 <div><strong>Contact number:</strong> {formData.contact_number || "N/A"}</div>
                 <div><strong>CNIC:</strong> {formData.cnic || "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Email:</strong> {formData.email || "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Permanent address:</strong> {formData.permanent_address || "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Current address:</strong> {formData.current_address || "N/A"}</div>
                 <div><strong>Marital status:</strong> {formData.marital_status || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

           <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Education</CardTitle>
              <CardDescription>Qualifications</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                 <div><strong>Education level:</strong> {formData.education_level || "N/A"}</div>
                 <div><strong>Institution name:</strong> {formData.institution_name || "N/A"}</div>
                 <div><strong>Year of passing:</strong> {formData.year_of_passing || "N/A"}</div>
                 <div><strong>Education subjects:</strong> {formData.education_subjects || "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Education grade:</strong> {formData.education_grade || "N/A"}</div>
              </div>
            </CardContent>
          </Card>
           <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Current Role</CardTitle>
              <CardDescription>Assignments & responsibilities</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
               <div><strong>Current Role:</strong> {formData.current_role_title || "N/A"}</div>
                 <div><strong>Joining Date:</strong> {formData.joining_date || "N/A"}</div>
                 <div><strong>Shift:</strong> {formData.shift || "N/A"}</div>
                 <div><strong>Current campus:</strong> Campus {formData.current_campus || "N/A"}</div>
                 <div><strong>Is currently active:</strong> {typeof formData.is_currently_active === "boolean" ? (formData.is_currently_active ? "Yes" : "No") : "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Current subjects:</strong> {formData.current_subjects || "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Current classes taught:</strong> {formData.current_classes_taught || "N/A"}</div>
                 <div className="sm:col-span-2"><strong>Current extra responsibilities:</strong> {formData.current_extra_responsibilities || "N/A"}</div>
               </div>
               <div><strong>Is class teacher:</strong> {typeof formData.is_class_teacher === "boolean" ? (formData.is_class_teacher ? "Yes" : "No") : "N/A"}</div>
                 {formData.is_class_teacher && (
                   <>
                     <div><strong>Class teacher level:</strong> {getLevelName(formData.class_teacher_level)}</div>
                     <div><strong>Class teacher grade:</strong> {getGradeName(formData.class_teacher_grade)}</div>
                     <div><strong>Class teacher section:</strong> {formData.class_teacher_section || "N/A"}</div>
                     <div><strong>Assigned classroom:</strong> {getClassroomName(formData.assigned_classroom)}</div>
                   </>
                 )}
            </CardContent>
          </Card>

           <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Work Experience</CardTitle>
              <CardDescription>Last role details</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                 <div className="sm:col-span-2"><strong>Previous institution name:</strong> {formData.previous_institution_name || "N/A"}</div>
                 <div><strong>Previous position:</strong> {formData.previous_position || "N/A"}</div>
                 <div><strong>Experience from date:</strong> {formData.experience_from_date || "N/A"}</div>
                 <div><strong>Experience to date:</strong> {formData.experience_to_date || "N/A"}</div>
                 <div><strong>Total experience years:</strong> {formData.total_experience_years || "N/A"}</div>
               </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 bg-transparent" disabled={saving}>
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving Teacher...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Teacher
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
