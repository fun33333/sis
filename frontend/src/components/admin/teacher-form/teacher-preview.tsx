"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Personal Information</CardTitle>
              <CardDescription>Basic details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><strong>Name:</strong> {formData.fullName || "N/A"}</div>
                <div><strong>Date of Birth:</strong> {formData.dob || "N/A"}</div>
                <div><strong>Gender:</strong> {formData.gender || "N/A"}</div>
                <div><strong>Campus:</strong> {formData.campus || "N/A"}</div>
                <div><strong>Contact:</strong> {formData.contactNumber || "N/A"}</div>
                <div><strong>Emergency Contact:</strong> {formData.emergencyContactNumber || "N/A"}</div>
                <div className="sm:col-span-2"><strong>Email:</strong> {formData.email || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Education</CardTitle>
              <CardDescription>Qualifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><strong>Institute:</strong> {formData.instituteName || "N/A"}</div>
                <div><strong>Qualification:</strong> {formData.educationQualification || "N/A"}</div>
                <div><strong>Specialization:</strong> {formData.fieldSpecialization || "N/A"}</div>
                <div><strong>Passing Year:</strong> {formData.passingYear || "N/A"}</div>
                <div><strong>Grade:</strong> {formData.passingYearGrade || "N/A"}</div>
                <div className="sm:col-span-2"><strong>Details:</strong> {formData.education || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Current Role */}
          <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Current Role</CardTitle>
              <CardDescription>Assignments & responsibilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="sm:col-span-2"><strong>Details:</strong> {formData.currentRoleDetails || "N/A"}</div>
                <div><strong>Shift:</strong> {formData.shift || "N/A"}</div>
                <div className="sm:col-span-2">
                  <strong>Class Assigned:</strong>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(Array.isArray(formData.classAssigned) ? formData.classAssigned : String(formData.classAssigned || "").split(',')).filter(Boolean).map((x: string, i: number) => (
                      <Badge key={i} variant="secondary">{String(x).trim()}</Badge>
                    ))}
                    {(!formData.classAssigned || (Array.isArray(formData.classAssigned) && formData.classAssigned.length === 0)) && <span>N/A</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <strong>Subjects Assigned:</strong>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(Array.isArray(formData.subjectsAssigned) ? formData.subjectsAssigned : String(formData.subjectsAssigned || "").split(',')).filter(Boolean).map((x: string, i: number) => (
                      <Badge key={i} variant="secondary">{String(x).trim()}</Badge>
                    ))}
                    {(!formData.subjectsAssigned || (Array.isArray(formData.subjectsAssigned) && formData.subjectsAssigned.length === 0)) && <span>N/A</span>}
                  </div>
                </div>
                <div className="sm:col-span-2"><strong>Is Class Teacher:</strong> {typeof formData.isClassTeacher === "boolean" ? (formData.isClassTeacher ? "Yes" : "No") : "N/A"}</div>
                {formData.isClassTeacher === true && (
                  <>
                    <div className="sm:col-span-2">
                      <strong>Class Teacher Classes:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(Array.isArray(formData.classTeacherClasses) ? formData.classTeacherClasses : String(formData.classTeacherClasses || "").split(',')).filter(Boolean).map((x: string, i: number) => (
                          <Badge key={i} variant="secondary">{String(x).trim()}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Class Teacher Sections:</strong>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(Array.isArray(formData.classTeacherSections) ? formData.classTeacherSections : String(formData.classTeacherSections || "").split(',')).filter(Boolean).map((x: string, i: number) => (
                          <Badge key={i} variant="secondary">{String(x).trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="sm:col-span-2"><strong>Additional Responsibilities:</strong> {formData.currentAdditionalResponsibilities || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="border-[#a3cef1]">
            <CardHeader>
              <CardTitle className="text-[#274c77]">Work Experience</CardTitle>
              <CardDescription>Last role details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="sm:col-span-2"><strong>Details:</strong> {formData.lastWorkExperience || "N/A"}</div>
                <div><strong>Organization:</strong> {formData.lastOrganizationName || "N/A"}</div>
                <div><strong>Position:</strong> {formData.position || "N/A"}</div>
                <div className="sm:col-span-2"><strong>Subjects / Role Details:</strong> {formData.teacherSubjects || "N/A"}</div>
                <div><strong>From:</strong> {formData.fromDate || "N/A"}</div>
                <div><strong>To:</strong> {formData.toDate || "N/A"}</div>
              </div>
            </CardContent>
          </Card>
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
