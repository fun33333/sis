"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FacilitiesStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function FacilitiesStep({ formData, invalidFields, onInputChange }: FacilitiesStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Facilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campusCapacity">Campus Capacity *</Label>
            <Input
              id="campusCapacity"
              type="number"
              value={formData.campusCapacity || ""}
              onChange={(e) => onInputChange("campusCapacity", e.target.value)}
              className={invalidFields.includes("campusCapacity") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusCapacity") && (
              <p className="text-sm text-red-600 mt-1">Campus capacity is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="classesPerGrade">Classes per Grade *</Label>
            <Input
              id="classesPerGrade"
              type="number"
              value={formData.classesPerGrade || ""}
              onChange={(e) => onInputChange("classesPerGrade", e.target.value)}
              className={invalidFields.includes("classesPerGrade") ? "border-red-500" : ""}
            />
            {invalidFields.includes("classesPerGrade") && (
              <p className="text-sm text-red-600 mt-1">Classes per grade is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="averageClassSize">Average Class Size *</Label>
            <Input
              id="averageClassSize"
              type="number"
              value={formData.averageClassSize || ""}
              onChange={(e) => onInputChange("averageClassSize", e.target.value)}
              className={invalidFields.includes("averageClassSize") ? "border-red-500" : ""}
            />
            {invalidFields.includes("averageClassSize") && (
              <p className="text-sm text-red-600 mt-1">Average class size is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalStudents">Total Students *</Label>
            <Input
              id="totalStudents"
              type="number"
              value={formData.totalStudents || ""}
              onChange={(e) => onInputChange("totalStudents", e.target.value)}
              className={invalidFields.includes("totalStudents") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalStudents") && (
              <p className="text-sm text-red-600 mt-1">Total students is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalTeachers">Total Teachers *</Label>
            <Input
              id="totalTeachers"
              type="number"
              value={formData.totalTeachers || ""}
              onChange={(e) => onInputChange("totalTeachers", e.target.value)}
              className={invalidFields.includes("totalTeachers") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalTeachers") && (
              <p className="text-sm text-red-600 mt-1">Total teachers is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalRooms">Total Rooms *</Label>
            <Input
              id="totalRooms"
              type="number"
              value={formData.totalRooms || ""}
              onChange={(e) => onInputChange("totalRooms", e.target.value)}
              className={invalidFields.includes("totalRooms") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalRooms") && (
              <p className="text-sm text-red-600 mt-1">Total rooms is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalClassrooms">Total Classrooms *</Label>
            <Input
              id="totalClassrooms"
              type="number"
              value={formData.totalClassrooms || ""}
              onChange={(e) => onInputChange("totalClassrooms", e.target.value)}
              className={invalidFields.includes("totalClassrooms") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalClassrooms") && (
              <p className="text-sm text-red-600 mt-1">Total classrooms is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="computerLabs">Computer Labs *</Label>
            <Input
              id="computerLabs"
              type="number"
              value={formData.computerLabs || ""}
              onChange={(e) => onInputChange("computerLabs", e.target.value)}
              className={invalidFields.includes("computerLabs") ? "border-red-500" : ""}
            />
            {invalidFields.includes("computerLabs") && (
              <p className="text-sm text-red-600 mt-1">Computer labs count is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="scienceLabs">Science Labs</Label>
            <Input
              id="scienceLabs"
              type="number"
              value={formData.scienceLabs || ""}
              onChange={(e) => onInputChange("scienceLabs", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="library">Library *</Label>
            <Select value={formData.library || ""} onValueChange={(v) => onInputChange("library", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("library") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("library") && (
              <p className="text-sm text-red-600 mt-1">Library availability is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="maleToilets">Male Toilets</Label>
            <Input
              id="maleToilets"
              type="number"
              value={formData.maleToilets || ""}
              onChange={(e) => onInputChange("maleToilets", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="femaleToilets">Female Toilets</Label>
            <Input
              id="femaleToilets"
              type="number"
              value={formData.femaleToilets || ""}
              onChange={(e) => onInputChange("femaleToilets", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="facilities">Additional Facilities *</Label>
          <Textarea
            id="facilities"
            placeholder="List additional facilities like playground, cafeteria, sports facilities, etc."
            value={formData.facilities || ""}
            onChange={(e) => onInputChange("facilities", e.target.value)}
            className={`min-h-[100px] ${invalidFields.includes("facilities") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("facilities") && (
            <p className="text-sm text-red-600 mt-1">Facilities description is required</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
