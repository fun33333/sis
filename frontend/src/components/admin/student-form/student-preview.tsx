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
        {uploadedImages.studentPhoto && (
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={uploadedImages.studentPhoto || "/placeholder.svg"}
                alt="Student"
                className="w-32 h-32 object-cover rounded-full border-4 border-primary"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Personal Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {formData.name || "N/A"}
              </div>
              <div>
                <strong>Gender:</strong> {formData.gender || "N/A"}
              </div>
              <div>
                <strong>Date of Birth:</strong> {formData.dob || "N/A"}
              </div>
              <div>
                <strong>Place of Birth:</strong> {formData.placeOfBirth || "N/A"}
              </div>
              <div>
                <strong>Religion:</strong> {formData.religion || "N/A"}
              </div>
              <div>
                <strong>Mother Tongue:</strong> {formData.motherTongue || "N/A"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Emergency Contact:</strong> {formData.emergencyContact || "N/A"}
              </div>
              <div>
                <strong>Address:</strong> {formData.address || "N/A"}
              </div>
              <div>
                <strong>Family Income:</strong> {formData.familyIncome || "N/A"}
              </div>
              <div>
                <strong>House Owned:</strong> {formData.houseOwned || "N/A"}
              </div>
              {formData.houseOwned === "no" && (
                <div>
                  <strong>Monthly Rent:</strong> {formData.rent || "N/A"}
                </div>
              )}
              <div>
                <strong>Zakat Status:</strong> {formData.zakatStatus || "N/A"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Academic Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Current State:</strong> {formData.currentState || "N/A"}
              </div>
              <div>
                <strong>Campus:</strong> {formData.campus || "N/A"}
              </div>
              <div>
                <strong>Current Grade:</strong> {formData.currentGrade || "N/A"}
              </div>
              <div>
                <strong>Section:</strong> {formData.section || "N/A"}
              </div>
              <div>
                <strong>GR Number:</strong> {formData.grNumber || "N/A"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Family Information</h3>
            <div className="space-y-2">
              <div>
                <strong>Father Name:</strong> {formData.fatherName || "N/A"}
              </div>
              <div>
                <strong>Father Contact:</strong> {formData.fatherContact || "N/A"}
              </div>
              <div>
                <strong>Mother Name:</strong> {formData.motherName || "N/A"}
              </div>
              <div>
                <strong>Mother Contact:</strong> {formData.motherContact || "N/A"}
              </div>
              <div>
                <strong>Guardian Name:</strong> {formData.guardianName || "N/A"}
              </div>
              <div>
                <strong>Guardian CNIC:</strong> {formData.guardianCNIC || "N/A"}
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
            Save Student
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
