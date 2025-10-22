"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FacilitiesStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function FacilitiesStep({ formData, invalidFields, onInputChange }: FacilitiesStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Labs & Facilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="biology_labs">Biology Labs</Label>
            <Input
              id="biology_labs"
              type="number"
              value={formData.biology_labs || ""}
              onChange={e => onInputChange("biology_labs", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="chemistry_labs">Chemistry Labs</Label>
            <Input
              id="chemistry_labs"
              type="number"
              value={formData.chemistry_labs || ""}
              onChange={e => onInputChange("chemistry_labs", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="physics_labs">Physics Labs</Label>
            <Input
              id="physics_labs"
              type="number"
              value={formData.physics_labs || ""}
              onChange={e => onInputChange("physics_labs", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="computer_labs">Computer Labs</Label>
            <Input
              id="computer_labs"
              type="number"
              value={formData.computer_labs || ""}
              onChange={e => onInputChange("computer_labs", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="library">Library</Label>
            <select
              id="library"
              value={formData.library || ""}
              onChange={e => onInputChange("library", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <Label htmlFor="toilets_male">Toilets Male</Label>
            <Input
              id="toilets_male"
              type="number"
              value={formData.toilets_male || ""}
              onChange={e => onInputChange("toilets_male", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="toilets_female">Toilets Female</Label>
            <Input
              id="toilets_female"
              type="number"
              value={formData.toilets_female || ""}
              onChange={e => onInputChange("toilets_female", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="toilets_teachers">Number of Toilets Reserved for Teachers</Label>
            <Input
              id="toilets_teachers"
              type="number"
              value={formData.toilets_teachers || ""}
              onChange={e => onInputChange("toilets_teachers", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="power_backup">Power Backup</Label>
            <select
              id="power_backup"
              value={formData.power_backup || ""}
              onChange={e => onInputChange("power_backup", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <Label htmlFor="internet_wifi">Internet WiFi</Label>
            <select
              id="internet_wifi"
              value={formData.internet_wifi || ""}
              onChange={e => onInputChange("internet_wifi", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <Label htmlFor="established_date">Established Date</Label>
            <Input
              id="established_date"
              type="date"
              value={formData.established_date || ""}
              onChange={e => onInputChange("established_date", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="campus_address">Campus Address</Label>
            <Input
              id="campus_address"
              value={formData.campus_address || ""}
              onChange={e => onInputChange("campus_address", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="total_teachers">Total Teachers</Label>
            <Input
              id="total_teachers"
              type="number"
              value={formData.total_teachers || ""}
              onChange={e => onInputChange("total_teachers", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="total_non_teaching_staff">Total Non Teaching Staff</Label>
            <Input
              id="total_non_teaching_staff"
              type="number"
              value={formData.total_non_teaching_staff || ""}
              onChange={e => onInputChange("total_non_teaching_staff", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}