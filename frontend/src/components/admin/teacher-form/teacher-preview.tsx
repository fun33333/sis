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
          <div className="space-y-6">
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
                  <strong>Campus:</strong> {formData.campus || "N/A"}
                </div>
                <div>
                  <strong>Contact:</strong> {formData.contactNumber || "N/A"}
                </div>
                <div>
                  <strong>Emergency Contact:</strong> {formData.emergencyContactNumber || "N/A"}
                </div>
                <div>
                  <strong>Email:</strong> {formData.email || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Education</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Institute:</strong> {formData.instituteName || "N/A"}
                </div>
                <div>
                  <strong>Qualification:</strong> {formData.educationQualification || "N/A"}
                </div>
                <div>
                  <strong>Specialization:</strong> {formData.fieldSpecialization || "N/A"}
                </div>
                <div>
                  <strong>Passing Year:</strong> {formData.passingYear || "N/A"}
                </div>
                <div>
                  <strong>Grade:</strong> {formData.passingYearGrade || "N/A"}
                </div>
                <div>
                  <strong>Details:</strong> {formData.education || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Current Role</h3>
              <div className="space-y-2">
                <div>
                  <strong>Details:</strong> {formData.currentRoleDetails || "N/A"}
                </div>
                <div>
                  <strong>Shift:</strong> {formData.shift || "N/A"}
                </div>
                <div>
                  <strong>Class Assigned:</strong> {Array.isArray(formData.classAssigned) ? formData.classAssigned.join(", ") : formData.classAssigned || "N/A"}
                </div>
                <div>
                  <strong>Subjects Assigned:</strong> {Array.isArray(formData.subjectsAssigned) ? formData.subjectsAssigned.join(", ") : formData.subjectsAssigned || "N/A"}
                </div>
                <div>
                  <strong>Is Class Teacher:</strong> {typeof formData.isClassTeacher === "boolean" ? (formData.isClassTeacher ? "Yes" : "No") : "N/A"}
                </div>
                {formData.isClassTeacher === true && (
                  <>
                    <div>
                      <strong>Class Teacher Classes:</strong> {Array.isArray(formData.classTeacherClasses) ? formData.classTeacherClasses.join(", ") : formData.classTeacherClasses || "N/A"}
                    </div>
                    <div>
                      <strong>Class Teacher Sections:</strong> {Array.isArray(formData.classTeacherSections) ? formData.classTeacherSections.join(", ") : formData.classTeacherSections || "N/A"}
                    </div>
                  </>
                )}
                <div>
                  <strong>Additional Responsibilities:</strong> {formData.currentAdditionalResponsibilities || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary">Work Experience</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Details:</strong> {formData.lastWorkExperience || "N/A"}
                </div>
                <div>
                  <strong>Organization:</strong> {formData.lastOrganizationName || "N/A"}
                </div>
                <div>
                  <strong>Position:</strong> {formData.position || "N/A"}
                </div>
                <div>
                  <strong>Subjects / Role Details:</strong> {formData.teacherSubjects || "N/A"}
                </div>
                <div>
                  <strong>From:</strong> {formData.fromDate || "N/A"}
                </div>
                <div>
                  <strong>To:</strong> {formData.toDate || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

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
