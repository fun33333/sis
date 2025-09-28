"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContactStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function ContactStep({ formData, invalidFields, onInputChange }: ContactStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Contact & Miscellaneous</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={e => onInputChange("address", e.target.value)}
              className={invalidFields.includes("address") ? "border-red-500" : ""}
            />
            {invalidFields.includes("address") && (
              <p className="text-sm text-red-600 mt-1">Address is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city || ""}
              onChange={e => onInputChange("city", e.target.value)}
              className={invalidFields.includes("city") ? "border-red-500" : ""}
            />
            {invalidFields.includes("city") && (
              <p className="text-sm text-red-600 mt-1">City is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="district">District *</Label>
            <Input
              id="district"
              value={formData.district || ""}
              onChange={e => onInputChange("district", e.target.value)}
              className={invalidFields.includes("district") ? "border-red-500" : ""}
            />
             {invalidFields.includes("district") && (
               <p className="text-sm text-red-600 mt-1">District is required</p>
             )}
            {invalidFields.includes("district") && (
              <p className="text-sm text-red-600 mt-1">District is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode || ""}
              onChange={e => onInputChange("postalCode", e.target.value)}
              className={invalidFields.includes("postalCode") ? "border-red-500" : ""}
            />
            {invalidFields.includes("postalCode") && (
              <p className="text-sm text-red-600 mt-1">Postal code is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="primaryPhone">School Primary Phone *</Label>
            <Input
              id="primaryPhone"
              value={formData.primaryPhone || ""}
              onChange={e => onInputChange("primaryPhone", e.target.value)}
              className={invalidFields.includes("primaryPhone") ? "border-red-500" : ""}
            />
            {invalidFields.includes("primaryPhone") && (
              <p className="text-sm text-red-600 mt-1">Primary phone is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="secondaryPhone">School Secondary Phone *</Label>
            <Input
              id="secondaryPhone"
              value={formData.secondaryPhone || ""}
              onChange={e => onInputChange("secondaryPhone", e.target.value)}
              className={invalidFields.includes("secondaryPhone") ? "border-red-500" : ""}
            />
            {invalidFields.includes("secondaryPhone") && (
              <p className="text-sm text-red-600 mt-1">Secondary phone is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="officialEmail">School Official Email *</Label>
            <Input
              id="officialEmail"
              type="email"
              value={formData.officialEmail || ""}
              onChange={e => onInputChange("officialEmail", e.target.value)}
              className={invalidFields.includes("officialEmail") ? "border-red-500" : ""}
            />
            {invalidFields.includes("officialEmail") && (
              <p className="text-sm text-red-600 mt-1">Official email is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusHeadName">Campus Head Name *</Label>
            <Input
              id="campusHeadName"
              value={formData.campusHeadName || ""}
              onChange={e => onInputChange("campusHeadName", e.target.value)}
              className={invalidFields.includes("campusHeadName") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusHeadName") && (
              <p className="text-sm text-red-600 mt-1">Campus head name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusHeadPhone">Campus Head Phone Number *</Label>
            <Input
              id="campusHeadPhone"
              value={formData.campusHeadPhone || ""}
              onChange={e => onInputChange("campusHeadPhone", e.target.value)}
              className={invalidFields.includes("campusHeadPhone") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusHeadPhone") && (
              <p className="text-sm text-red-600 mt-1">Campus head phone is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusHeadEmail">Campus Head Email *</Label>
            <Input
              id="campusHeadEmail"
              type="email"
              value={formData.campusHeadEmail || ""}
              onChange={e => onInputChange("campusHeadEmail", e.target.value)}
              className={invalidFields.includes("campusHeadEmail") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusHeadEmail") && (
              <p className="text-sm text-red-600 mt-1">Campus head email is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusHeadCoordinatorName">Campus Head Coordinator Name *</Label>
            <Input
              id="campusHeadCoordinatorName"
              value={formData.campusHeadCoordinatorName || ""}
              onChange={e => onInputChange("campusHeadCoordinatorName", e.target.value)}
              className={invalidFields.includes("campusHeadCoordinatorName") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusHeadCoordinatorName") && (
              <p className="text-sm text-red-600 mt-1">Coordinator name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusHeadCoordinatorPhone">Campus Head Coordinator Phone *</Label>
            <Input
              id="campusHeadCoordinatorPhone"
              value={formData.campusHeadCoordinatorPhone || ""}
              onChange={e => onInputChange("campusHeadCoordinatorPhone", e.target.value)}
              className={invalidFields.includes("campusHeadCoordinatorPhone") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusHeadCoordinatorPhone") && (
              <p className="text-sm text-red-600 mt-1">Coordinator phone is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusHeadCoordinatorEmail">Campus Head Coordinator Email *</Label>
            <Input
              id="campusHeadCoordinatorEmail"
              type="email"
              value={formData.campusHeadCoordinatorEmail || ""}
              onChange={e => onInputChange("campusHeadCoordinatorEmail", e.target.value)}
              className={invalidFields.includes("campusHeadCoordinatorEmail") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusHeadCoordinatorEmail") && (
              <p className="text-sm text-red-600 mt-1">Coordinator email is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalNonTeachingStaff">Total Non-Teaching Staff</Label>
            <Input
              id="totalNonTeachingStaff"
              type="number"
              value={formData.totalNonTeachingStaff || ""}
              onChange={e => onInputChange("totalNonTeachingStaff", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="staffContactHr">Staff Contact (HR)</Label>
            <Input
              id="staffContactHr"
              value={formData.staffContactHr || ""}
              onChange={e => onInputChange("staffContactHr", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="admissionOfficeContact">Admission Office Contact</Label>
            <Input
              id="admissionOfficeContact"
              value={formData.admissionOfficeContact || ""}
              onChange={e => onInputChange("admissionOfficeContact", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="isDraft">Save as Draft</Label>
            <select id="isDraft" value={formData.isDraft || "false"} onChange={e => onInputChange("isDraft", e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
