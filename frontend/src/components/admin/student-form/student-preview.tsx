"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save } from "lucide-react"

interface StudentPreviewProps {
  formData: any
  uploadedImages: { [key: string]: string }
  onBack: () => void
}

export function StudentPreview({ formData, uploadedImages, onBack }: StudentPreviewProps) {
  const handleSave = () => {
    // Handle save logic here
    alert("Student information saved successfully!")
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
      <CardContent className="space-y-6">
        {/* Image preview intentionally removed per request */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Personal Information</h3>
                <div className="space-y-2">
                  {personal.map((f) => (
                    <div key={f.label}>
                      <strong>{f.label}:</strong> {f.value}
                    </div>
                  ))}
                </div>
              </div>
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

            // include rent only if houseOwned === 'no' and rent has value
            if (formData.houseOwned === "no" && hasValue(formData.rent)) {
              contact.push({ label: "Monthly Rent", value: formData.rent })
            }

            if (contact.length === 0) return null

            return (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Contact Information</h3>
                <div className="space-y-2">
                  {contact.map((f) => (
                    <div key={f.label}>
                      <strong>{f.label}:</strong> {f.value}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Academic Information */}
          {(() => {
            const academic = [
              { label: "Campus", value: formData.campus },
              { label: "Current Grade", value: formData.currentGrade },
              { label: "Section", value: formData.section },
              { label: "Shift", value: formData.shift },
              { label: "Year of Admission", value: formData.admissionYear },
              { label: "Last Class Passed", value: formData.lastClassPassed },
              { label: "Last School Name", value: formData.lastSchoolName },
              { label: "Last Class Result", value: formData.lastClassResult },
              { label: "GR Number", value: formData.grNumber },
            ].filter((f) => hasValue(f.value))

            if (academic.length === 0) return null

            return (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Academic Information</h3>
                <div className="space-y-2">
                  {academic.map((f) => (
                    <div key={f.label}>
                      <strong>{f.label}:</strong> {f.value}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Family Information */}
          {(() => {
            const family = [
              { label: "Father Name", value: formData.fatherName },
              { label: "Father Contact", value: formData.fatherContact },
              { label: "Father CNIC", value: formData.fatherCNIC },
              { label: "Father Status", value: formData.fatherStatus },
              { label: "Father Occupation", value: formData.fatherOccupation },
              { label: "Mother Name", value: formData.motherName },
              { label: "Mother Contact", value: formData.motherContact },
              { label: "Mother CNIC", value: formData.motherCNIC },
              { label: "Mother Status", value: formData.motherStatus },
              { label: "Mother Occupation", value: formData.motherOccupation },
              { label: "Guardian Name", value: formData.guardianName },
              { label: "Guardian Relation", value: formData.guardianRelation },
              { label: "Guardian Phone", value: formData.guardianPhone },
              { label: "Guardian CNIC", value: formData.guardianCNIC },
              { label: "Guardian Occupation", value: formData.guardianOccupation },
              { label: "Siblings in Alkhair", value: formData.siblingsInAlkhair },
              { label: "Siblings Names", value: formData.siblingsNames },
            ].filter((f) => hasValue(f.value))

            if (family.length === 0) return null

            return (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Family Information</h3>
                <div className="space-y-2">
                  {family.map((f) => (
                    <div key={f.label}>
                      <strong>{f.label}:</strong> {f.value}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Student
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
