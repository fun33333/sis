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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">General Information</h3>
            <div className="space-y-2">
              <div><strong>Campus Name:</strong> {formData.campusName || "N/A"}</div>
              <div><strong>Registration Number:</strong> {formData.registrationNumber || "N/A"}</div>
              <div><strong>Status:</strong> {formData.campusStatus || "N/A"}</div>
              <div><strong>Languages:</strong> {formData.languagesOfInstruction || "N/A"}</div>
              <div><strong>Academic Year:</strong> {formData.academicYearStart && formData.academicYearEnd ? `${formData.academicYearStart} - ${formData.academicYearEnd}` : "N/A"}</div>
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
        </div>
      </CardContent>
    </Card>
  )
}
