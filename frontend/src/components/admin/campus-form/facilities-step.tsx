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
              <Label htmlFor="totalRooms">Total No. of Rooms *</Label>
              <Input
                id="totalRooms"
                type="number"
                value={formData.totalRooms || ""}
                onChange={e => onInputChange("totalRooms", e.target.value)}
                className={invalidFields.includes("totalRooms") ? "border-red-500" : ""}
              />
              {invalidFields.includes("totalRooms") && (
                <p className="text-sm text-red-600 mt-1">Total rooms is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="totalClassrooms">Total No. of Classrooms *</Label>
              <Input
                id="totalClassrooms"
                type="number"
                value={formData.totalClassrooms || ""}
                onChange={e => onInputChange("totalClassrooms", e.target.value)}
                className={invalidFields.includes("totalClassrooms") ? "border-red-500" : ""}
              />
              {invalidFields.includes("totalClassrooms") && (
                <p className="text-sm text-red-600 mt-1">Total classrooms is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="averageClassSize">Average Class Size *</Label>
              <Input
                id="averageClassSize"
                type="number"
                value={formData.averageClassSize || ""}
                onChange={e => onInputChange("averageClassSize", e.target.value)}
                className={invalidFields.includes("averageClassSize") ? "border-red-500" : ""}
              />
              {invalidFields.includes("averageClassSize") && (
                <p className="text-sm text-red-600 mt-1">Average class size is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="averageCurrentClassCapacity">Average Current Class Capacity *</Label>
              <Input
                id="averageCurrentClassCapacity"
                type="number"
                value={formData.averageCurrentClassCapacity || ""}
                onChange={e => onInputChange("averageCurrentClassCapacity", e.target.value)}
                className={invalidFields.includes("averageCurrentClassCapacity") ? "border-red-500" : ""}
              />
               {invalidFields.includes("averageCurrentClassCapacity") && (
                 <p className="text-sm text-red-600 mt-1">Average current class capacity is required</p>
               )}
            </div>

            <div>
              <Label htmlFor="computerLabs">No. of Computer Labs *</Label>
              <Input
                id="computerLabs"
                type="number"
                value={formData.computerLabs || ""}
                onChange={e => onInputChange("computerLabs", e.target.value)}
                className={invalidFields.includes("computerLabs") ? "border-red-500" : ""}
              />
              {invalidFields.includes("computerLabs") && (
                <p className="text-sm text-red-600 mt-1">Computer labs count is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="scienceLabs">No. of Science Labs *</Label>
              <Input
                id="scienceLabs"
                type="number"
                value={formData.scienceLabs || ""}
                onChange={e => onInputChange("scienceLabs", e.target.value)}
                className={invalidFields.includes("scienceLabs") ? "border-red-500" : ""}
              />
              {invalidFields.includes("scienceLabs") && (
                <p className="text-sm text-red-600 mt-1">Science labs count is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="anyOtherRoom">Any Other Room (specify)</Label>
              <Input
                id="anyOtherRoom"
                value={formData.anyOtherRoom || ""}
                onChange={e => onInputChange("anyOtherRoom", e.target.value)}
              />
               {invalidFields.includes("anyOtherRoom") && (
                 <p className="text-sm text-red-600 mt-1">Other room info is required</p>
               )}
            </div>

            <div>
              <Label htmlFor="sportsFacilities">Sports Facilities</Label>
              <Textarea
                id="sportsFacilities"
                placeholder="Cricket, Archery, Football, Taekwondo, Swimming, Table Tennis, Volleyball, Tug of War, Other"
                value={formData.sportsFacilities || ""}
                onChange={e => onInputChange("sportsFacilities", e.target.value)}
                className="min-h-[60px]"
              />
               {invalidFields.includes("sportsFacilities") && (
                 <p className="text-sm text-red-600 mt-1">Sports facilities info is required</p>
               )}
               
            </div>

            <div>
              <Label htmlFor="teacherTransportFacility">Teacher Transport Facility *</Label>
              <select
                id="teacherTransportFacility"
                value={formData.teacherTransportFacility || ""}
                onChange={e => onInputChange("teacherTransportFacility", e.target.value)}
                className={`w-full border rounded px-3 py-2 ${invalidFields.includes('teacherTransportFacility') ? 'border-red-500' : ''}`}
              >
                <option value="">Select Option</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
              {invalidFields.includes("teacherTransportFacility") && (
                <p className="text-sm text-red-600 mt-1">Teacher transport facility is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="canteenFacility">Canteen Facility *</Label>
              <select
                id="canteenFacility"
                value={formData.canteenFacility || ""}
                onChange={e => onInputChange("canteenFacility", e.target.value)}
                className={`w-full border rounded px-3 py-2 ${invalidFields.includes('canteenFacility') ? 'border-red-500' : ''}`}
              >
                <option value="">Select Option</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
              {invalidFields.includes("canteenFacility") && (
                <p className="text-sm text-red-600 mt-1">Canteen facility is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="mealPrograms">Meal Programs *</Label>
              <select
                id="mealPrograms"
                value={formData.mealPrograms || ""}
                onChange={e => onInputChange("mealPrograms", e.target.value)}
                className={`w-full border rounded px-3 py-2 ${invalidFields.includes('mealPrograms') ? 'border-red-500' : ''}`}
              >
                <option value="">Select Option</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
              {invalidFields.includes("mealPrograms") && (
                <p className="text-sm text-red-600 mt-1">Meal programs selection is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="otherFacilities">Other Facilities</Label>
              <Textarea
                id="otherFacilities"
                placeholder="Power Backup, Internet/Wi-Fi, Other"
                value={formData.otherFacilities || ""}
                onChange={e => onInputChange("otherFacilities", e.target.value)}
                className="min-h-[60px]"
              />
               {invalidFields.includes("otherFacilities") && (
                 <p className="text-sm text-red-600 mt-1">Other facilities info is required</p>
               )}
               {invalidFields.includes("otherFacilities") && (
                 <p className="text-sm text-red-600 mt-1">Other facilities info is required</p>
               )}
            </div>

            <div>
              <Label htmlFor="boysWashrooms">Boys Washrooms *</Label>
              <Input
                id="boysWashrooms"
                type="number"
                value={formData.boysWashrooms || ""}
                onChange={e => onInputChange("boysWashrooms", e.target.value)}
                className={invalidFields.includes("boysWashrooms") ? "border-red-500" : ""}
              />
              {invalidFields.includes("boysWashrooms") && (
                <p className="text-sm text-red-600 mt-1">Boys washrooms count is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="girlsWashrooms">Girls Washrooms *</Label>
              <Input
                id="girlsWashrooms"
                type="number"
                value={formData.girlsWashrooms || ""}
                onChange={e => onInputChange("girlsWashrooms", e.target.value)}
                className={invalidFields.includes("girlsWashrooms") ? "border-red-500" : ""}
              />
              {invalidFields.includes("girlsWashrooms") && (
                <p className="text-sm text-red-600 mt-1">Girls washrooms count is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="maleTeacherWashrooms">Male Teacher Washrooms *</Label>
              <Input
                id="maleTeacherWashrooms"
                type="number"
                value={formData.maleTeacherWashrooms || ""}
                onChange={e => onInputChange("maleTeacherWashrooms", e.target.value)}
                className={invalidFields.includes("maleTeacherWashrooms") ? "border-red-500" : ""}
              />
              {invalidFields.includes("maleTeacherWashrooms") && (
                <p className="text-sm text-red-600 mt-1">Male teacher washrooms count is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="femaleTeacherWashrooms">Female Teacher Washrooms *</Label>
              <Input
                id="femaleTeacherWashrooms"
                type="number"
                value={formData.femaleTeacherWashrooms || ""}
                onChange={e => onInputChange("femaleTeacherWashrooms", e.target.value)}
                className={invalidFields.includes("femaleTeacherWashrooms") ? "border-red-500" : ""}
              />
              {invalidFields.includes("femaleTeacherWashrooms") && (
                <p className="text-sm text-red-600 mt-1">Female teacher washrooms count is required</p>
              )}
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
