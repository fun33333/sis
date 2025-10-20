"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save } from "lucide-react"
import { apiPost, apiGet, apiPostFormData, getAllCampuses } from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface StudentPreviewProps {
  formData: any
  uploadedImages: { [key: string]: string }
  onBack: () => void
  onSaved?: () => void
}

export function StudentPreview({ formData, uploadedImages, onBack, onSaved }: StudentPreviewProps) {
  const [saving, setSaving] = useState(false)
  const [campuses, setCampuses] = useState<any[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch campuses to get proper IDs (handle paginated or direct list)
    getAllCampuses()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
        setCampuses(list)
      })
      .catch((err) => {
        console.error("Failed to fetch campuses:", err)
        toast.error("Failed to load campus list")
      })
  }, [])

  const getCampusId = (campusName: string) => {
    if (!campusName) return null
    const name = String(campusName).trim().toLowerCase()
    // Try strict name match
    let campus = campuses.find((c) => String(c?.name || '').trim().toLowerCase() === name)
    if (campus) return campus.id
    // Try code match if provided
    campus = campuses.find((c) => String(c?.code || '').trim().toLowerCase() === name)
    if (campus) return campus.id
    // Try contains match
    campus = campuses.find((c) => String(c?.name || '').toLowerCase().includes(name))
    if (campus) return campus.id
    // As a safe fallback, do not send an invalid campus id
    return null
  }

  const normalizeGender = (value: string | undefined): 'male' | 'female' | null => {
    const v = (value || '').toString().trim().toLowerCase()
    if (v === 'male' || v === 'm') return 'male'
    if (v === 'female' || v === 'f') return 'female'
    // Backend model allows only male/female; if 'other' or unknown -> null
    return null
  }

  const normalizeShift = (value: string | undefined): string | null => {
    const v = (value || '').toString().trim().toLowerCase()
    if (!v) return null
    if (v === 'morning' || v === 'm') return 'morning'
    if (v === 'afternoon' || v === 'evening' || v === 'e') return 'evening'
    // Only morning and afternoon supported; anything else becomes null
    return null
  }

  const normalizeZakatStatus = (value: string | undefined): string | null => {
    const v = (value || "").toString().trim().toLowerCase()
    // Map UI options to backend choices
    if (v === "applicable") return "applicable"
    if (v === "not-applicable" || v === "not applicable" || v === "no") return "not_applicable"
    if (!v) return null
    return v
  }

  const buildPayload = () => {
    const payload: any = {
      // Personal Information - Only name is required
      name: formData.name || "",
      
      // Optional Personal Information
      gender: normalizeGender(formData.gender),
      dob: formData.dob || null,
      place_of_birth: formData.placeOfBirth || null,
      religion: formData.religion || null,
      mother_tongue: formData.motherTongue || null,
      
      // Contact Information
      emergency_contact: formData.emergencyContact || null,
      address: formData.address || null,
      family_income: formData.familyIncome ? parseFloat(formData.familyIncome) : null,
      house_owned: formData.houseOwned === "yes",
      rent_amount: formData.houseOwned === "no" && formData.rent ? parseFloat(formData.rent) : null,
      zakat_status: normalizeZakatStatus(formData.zakatStatus),
      
      // Academic Information
      campus: formData.campus ? Number(formData.campus) : null,
      current_grade: formData.currentGrade || null,
      section: formData.section || null,
      enrollment_year: formData.admissionYear ? Number(formData.admissionYear) : null,
      shift: normalizeShift(formData.shift),
      last_class_passed: formData.lastClassPassed || null,
      last_class_result: formData.lastClassResult || null,
      from_year: formData.fromYear ? Number(formData.fromYear) : null,
      to_year: formData.toYear ? Number(formData.toYear) : null,
      siblings_count: formData.siblingsCount ? Number(formData.siblingsCount) : null,
      father_status: formData.fatherStatus || null,
      sibling_in_alkhair: formData.siblingInAlkhair || null,
      
      // Family Information
      father_name: formData.fatherName || null,
      father_contact: formData.fatherContact || null,
      father_cnic: formData.fatherCNIC || null,
      father_profession: formData.fatherProfession || null,
      mother_name: formData.motherName || null,
      mother_contact: formData.motherContact || null,
      mother_cnic: formData.motherCNIC || null,
      mother_status: formData.motherStatus || null,
      mother_profession: formData.motherProfession || null,
      guardian_name: formData.guardianName || null,
      guardian_cnic: formData.guardianCNIC || null,
      guardian_profession: formData.guardianProfession || null,
      
      // Photo - Skip for now, handle separately if needed
      // photo: uploadedImages.studentPhoto || null,
      
      // System fields
      is_draft: false, // Set to false for final save
    }

    // Remove null values to avoid validation issues
    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === "") {
        delete payload[key]
      }
    })

    return payload
  }

  const handleSave = async () => {
    setSaving(true)
    setSubmitError(null)
    try {
      const payload = buildPayload()
      
      console.log("Sending payload:", JSON.stringify(payload, null, 2))

      if (uploadedImages.studentPhoto) {
        const base64Data = uploadedImages.studentPhoto.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const file = new File([byteArray], 'student_photo.jpg', { type: 'image/jpeg' })
        
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('photo', file)
        
        // Add other fields to FormData
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key])
          }
        })

        // Send FormData instead of JSON
        await apiPostFormData("/api/students/", formData)

        // Wait for minimum delay
        await new Promise((res) => setTimeout(res, 2000))
      } else {
        // No image, send regular JSON
        const apiPromise = apiPost("/api/students/", payload)
        const delay = new Promise((res) => setTimeout(res, 2000))
        await Promise.all([apiPromise, delay])
      }

      // Show a polished Sonner toast (success)
      toast.success("Student saved", {
        description: "Student has been saved successfully.",
        duration: 4000,
      })

      // Notify parent to reset/redirect to step 1
      onSaved?.()
    } catch (err: any) {
      // Avoid Next.js Dev overlay by not using console.error for expected API errors
      console.warn("Student save failed:", err)
      const msg: string = err?.message || "An unexpected error occurred while saving."

      // Try to extract field-wise errors if available
      let friendly = msg
      try {
        if (err?.response) {
          const data = JSON.parse(err.response)
          if (data && typeof data === 'object') {
            const entries = Object.entries(data as Record<string, any>)
            if (entries.length > 0) {
              const [field, value] = entries[0]
              const first = Array.isArray(value) ? value[0] : String(value)
              friendly = `${first}`
            }
          }
        }
      } catch {}

      // Special friendly message for missing classroom
      if (friendly.toLowerCase().includes('no classroom is available')) {
        const combo = `${formData.currentGrade || 'Grade'}-${formData.section || ''} ${formData.shift || ''}`.trim()
        const uiMsg = `No classroom found for ${combo} in the selected campus. Please create the classroom first, then try again.`
        setSubmitError(uiMsg)
        toast.error("Classroom not available", { description: uiMsg, duration: 7000 })
      } else {
        setSubmitError(friendly)
        toast.error("Failed to save student", { description: friendly, duration: 6000 })
      }
    } finally {
      setSaving(false)
    }
  }
  const hasValue = (v: any) => v !== undefined && v !== null && String(v).trim() !== ""

  const renderField = (label: string, value: any) => {
    if (!hasValue(value)) return null
    return (
      <div>
        <strong>{label}:</strong> {value}
      </div>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Student Information Preview
        </CardTitle>
        <CardDescription>Review all information before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {submitError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
            <div className="font-semibold">Unable to save</div>
            <div className="text-sm mt-1">{submitError}</div>
          </div>
        )}
        {/* Image preview intentionally removed per request */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          {(() => {
            const personal = [
              { label: "Name", value: formData.name },
              { label: "Gender", value: formData.gender },
              { label: "Date of Birth", value: formData.dob },
              { label: "Place of Birth", value: formData.placeOfBirth },
              { label: "Religion", value: formData.religion },
              { label: "Mother Tongue", value: formData.motherTongue },
            ].filter((f) => hasValue(f.value))

            if (personal.length === 0) return null

            return (
              <Card className="border-[#a3cef1]">
                <CardHeader>
                  <CardTitle className="text-[#274c77]">Personal Information</CardTitle>
                  <CardDescription>Basic details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {personal.map((f) => (
                      <div key={f.label}><strong>{f.label}:</strong> {f.value}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Contact Information */}
          {(() => {
            const contact = [
              { label: "Emergency Contact", value: formData.emergencyContact },
              { label: "Address", value: formData.address },
              { label: "Family Income", value: formData.familyIncome },
              { label: "House Owned", value: formData.houseOwned },
              { label: "Zakat Status", value: formData.zakatStatus },
            ].filter((f) => hasValue(f.value))

            if (formData.houseOwned === "no" && hasValue(formData.rent)) {
              contact.push({ label: "Monthly Rent", value: formData.rent })
            }

            if (contact.length === 0) return null

            return (
              <Card className="border-[#a3cef1]">
                <CardHeader>
                  <CardTitle className="text-[#274c77]">Contact Information</CardTitle>
                  <CardDescription>How to reach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {contact.map((f) => (
                      <div key={f.label}><strong>{f.label}:</strong> {f.value}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Academic Information */}
          {(() => {
            const academic = [
              { label: "Campus", value: formData.campus },
              { label: "Current Grade", value: formData.currentGrade },
              { label: "Section", value: formData.section },
              { label: "Shift", value: formData.shift },
              { label: "Assigned Classroom", value: formData.assignedClassroom || "Will be auto-assigned" },
              { label: "Class Teacher", value: formData.classTeacher || "Will be auto-assigned" },
              { label: "Year of Admission", value: formData.admissionYear },
              { label: "Last Class Passed", value: formData.lastClassPassed },
              { label: "Last School Name", value: formData.lastSchoolName },
              { label: "Last Class Result", value: formData.lastClassResult },
              { label: "GR Number", value: formData.grNumber },
            ].filter((f) => hasValue(f.value))

            if (academic.length === 0) return null

            return (
              <Card className="border-[#a3cef1]">
                <CardHeader>
                  <CardTitle className="text-[#274c77]">Academic Information</CardTitle>
                  <CardDescription>Schooling details - Classroom will be auto-assigned based on grade, section, and shift</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {academic.map((f) => (
                      <div key={f.label}>
                        <strong>{f.label}:</strong> 
                        <span className={f.value.includes("Will be auto-assigned") ? "text-blue-600 italic" : ""}>
                          {f.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Family Information */}
          {(() => {
            const family = [
              { label: "Father Name", value: formData.fatherName },
              { label: "Father Contact", value: formData.fatherContact },
              { label: "Father CNIC", value: formData.fatherCNIC },
              { label: "Father Status", value: formData.fatherStatus },
              { label: "Father Profession", value: formData.fatherProfession },
              { label: "Mother Name", value: formData.motherName },
              { label: "Mother Contact", value: formData.motherContact },
              { label: "Mother CNIC", value: formData.motherCNIC },
              { label: "Mother Status", value: formData.motherStatus },
              { label: "Mother Profession", value: formData.motherProfession },
              { label: "Guardian Name", value: formData.guardianName },
              { label: "Guardian Relation", value: formData.guardianRelation },
              { label: "Guardian Phone", value: formData.guardianPhone },
              { label: "Guardian CNIC", value: formData.guardianCNIC },
              { label: "Guardian Profession", value: formData.guardianProfession },
            ].filter((f) => hasValue(f.value))

            const siblingsInfo = formData.siblingInAlkhair === "yes" 
              ? `Count: ${formData.siblingsCount || 0}`
              : "No siblings in Al-Khair"

            if (family.length === 0 && !hasValue(formData.siblingInAlkhair)) return null

            return (
              <Card className="border-[#a3cef1]">
                <CardHeader>
                  <CardTitle className="text-[#274c77]">Family Information</CardTitle>
                  <CardDescription>Parents and guardian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {family.map((f) => (
                      <div key={f.label}><strong>{f.label}:</strong> {f.value}</div>
                    ))}
                    {hasValue(formData.siblingInAlkhair) && (
                      <div className="sm:col-span-2"><strong>Siblings in Alkhair:</strong> {siblingsInfo}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })()}
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="flex items-center gap-2 bg-transparent"
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2"
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Student"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
