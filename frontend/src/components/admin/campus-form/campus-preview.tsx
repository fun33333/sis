"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, Save } from "lucide-react"

interface CampusPreviewProps {
  formData: any
  onBack: () => void
}

export function CampusPreview({ formData, onBack }: CampusPreviewProps) {
  const handleSave = () => {
    // Handle save logic here
    alert("Campus information saved successfully!")
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">General Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Campus Name:</strong> {formData.campusName || "N/A"}
              </div>
              <div>
                <strong>Campus Code:</strong> {formData.campusCode || "N/A"}
              </div>
              <div>
                <strong>Registration Number:</strong> {formData.registrationNumber || "N/A"}
              </div>
              <div>
                <strong>Status:</strong> {formData.status || "N/A"}
              </div>
              <div>
                <strong>Governing Body:</strong> {formData.governingBody || "N/A"}
              </div>
              <div>
                <strong>Grades Offered:</strong> {formData.gradesOffered || "N/A"}
              </div>
              <div>
                <strong>Languages:</strong> {formData.languagesOfInstruction || "N/A"}
              </div>
              <div>
                <strong>Academic Year:</strong>{" "}
                {formData.academicYearStart && formData.academicYearEnd
                  ? `${formData.academicYearStart} - ${formData.academicYearEnd}`
                  : "N/A"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Facilities</h3>
            <div className="space-y-2">
              <div>
                <strong>Campus Capacity:</strong> {formData.campusCapacity || "N/A"}
              </div>
              <div>
                <strong>Classes per Grade:</strong> {formData.classesPerGrade || "N/A"}
              </div>
              <div>
                <strong>Average Class Size:</strong> {formData.averageClassSize || "N/A"}
              </div>
              <div>
                <strong>Total Students:</strong> {formData.totalStudents || "N/A"}
              </div>
              <div>
                <strong>Total Teachers:</strong> {formData.totalTeachers || "N/A"}
              </div>
              <div>
                <strong>Total Rooms:</strong> {formData.totalRooms || "N/A"}
              </div>
              <div>
                <strong>Classrooms:</strong> {formData.totalClassrooms || "N/A"}
              </div>
              <div>
                <strong>Computer Labs:</strong> {formData.computerLabs || "N/A"}
              </div>
              <div>
                <strong>Library:</strong> {formData.library || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Description</h3>
          <p className="text-sm">{formData.description || "N/A"}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Address</h3>
          <p className="text-sm">{formData.address || "N/A"}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Additional Facilities</h3>
          <p className="text-sm">{formData.facilities || "N/A"}</p>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Campus
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
