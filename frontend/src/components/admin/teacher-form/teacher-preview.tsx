"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save } from "lucide-react"

interface TeacherPreviewProps {
  formData: any
  onBack: () => void
}

export function TeacherPreview({ formData, onBack }: TeacherPreviewProps) {
  const handleSave = () => {
    // Handle save logic here
    alert("Teacher information saved successfully!")
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Personal Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {formData.fullName || "N/A"}
              </div>
              <div>
                <strong>Date of Birth:</strong> {formData.dob || "N/A"}
              </div>
              <div>
                <strong>Gender:</strong> {formData.gender || "N/A"}
              </div>
              <div>
                <strong>Contact:</strong> {formData.contactNumber || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {formData.email || "N/A"}
              </div>
              <div>
                <strong>Marital Status:</strong> {formData.maritalStatus || "N/A"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Professional Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Current Role:</strong> {formData.currentRole || "N/A"}
              </div>
              <div>
                <strong>Subjects Taught:</strong> {formData.subjects || "N/A"}
              </div>
              <div>
                <strong>Classes & Sections:</strong> {formData.classesSections || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Education</h3>
          <p className="text-sm">{formData.education || "N/A"}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Work Experience</h3>
          <p className="text-sm">{formData.experience || "N/A"}</p>
        </div>

        {formData.additionalResponsibilities && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Additional Responsibilities</h3>
            <p className="text-sm">{formData.additionalResponsibilities}</p>
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Teacher
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
