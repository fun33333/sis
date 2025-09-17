"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContactDetailsStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function ContactDetailsStep({ formData, invalidFields, onInputChange }: ContactDetailsStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact *</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact || ""}
              onChange={(e) => onInputChange("emergencyContact", e.target.value)}
              className={invalidFields.includes("emergencyContact") ? "border-red-500" : ""}
            />
            {invalidFields.includes("emergencyContact") && (
              <p className="text-sm text-red-600 mt-1">Emergency contact is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="zakatStatus">Zakat Status *</Label>
            <Select value={formData.zakatStatus || ""} onValueChange={(v) => onInputChange("zakatStatus", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("zakatStatus") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="not-eligible">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("zakatStatus") && (
              <p className="text-sm text-red-600 mt-1">Zakat status is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="familyIncome">Family Income *</Label>
            <Input
              id="familyIncome"
              type="number"
              value={formData.familyIncome || ""}
              onChange={(e) => onInputChange("familyIncome", e.target.value)}
              className={invalidFields.includes("familyIncome") ? "border-red-500" : ""}
            />
            {invalidFields.includes("familyIncome") && (
              <p className="text-sm text-red-600 mt-1">Family income is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="houseOwned">House Owned *</Label>
            <Select value={formData.houseOwned || ""} onValueChange={(v) => onInputChange("houseOwned", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("houseOwned") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("houseOwned") && (
              <p className="text-sm text-red-600 mt-1">House owned status is required</p>
            )}
          </div>

          {formData.houseOwned === "no" && (
            <div>
              <Label htmlFor="rent">Monthly Rent *</Label>
              <Input
                id="rent"
                type="number"
                value={formData.rent || ""}
                onChange={(e) => onInputChange("rent", e.target.value)}
                className={invalidFields.includes("rent") ? "border-red-500" : ""}
              />
              {invalidFields.includes("rent") && (
                <p className="text-sm text-red-600 mt-1">Rent is required when house is not owned</p>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={(e) => onInputChange("address", e.target.value)}
            className={invalidFields.includes("address") ? "border-red-500" : ""}
          />
          {invalidFields.includes("address") && <p className="text-sm text-red-600 mt-1">Address is required</p>}
        </div>

        {/* Parent/Guardian Information */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fatherName">Father Name</Label>
              <Input
                id="fatherName"
                value={formData.fatherName || ""}
                onChange={(e) => onInputChange("fatherName", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="fatherContact">Father Contact</Label>
              <Input
                id="fatherContact"
                value={formData.fatherContact || ""}
                onChange={(e) => onInputChange("fatherContact", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="motherName">Mother Name</Label>
              <Input
                id="motherName"
                value={formData.motherName || ""}
                onChange={(e) => onInputChange("motherName", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="motherContact">Mother Contact</Label>
              <Input
                id="motherContact"
                value={formData.motherContact || ""}
                onChange={(e) => onInputChange("motherContact", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName || ""}
                onChange={(e) => onInputChange("guardianName", e.target.value)}
                className={invalidFields.includes("guardianName") ? "border-red-500" : ""}
              />
              {invalidFields.includes("guardianName") && (
                <p className="text-sm text-red-600 mt-1">Guardian name is required when parents info is missing</p>
              )}
            </div>

            <div>
              <Label htmlFor="guardianCNIC">Guardian CNIC</Label>
              <Input
                id="guardianCNIC"
                value={formData.guardianCNIC || ""}
                onChange={(e) => onInputChange("guardianCNIC", e.target.value)}
                className={invalidFields.includes("guardianCNIC") ? "border-red-500" : ""}
              />
              {invalidFields.includes("guardianCNIC") && (
                <p className="text-sm text-red-600 mt-1">Guardian CNIC is required when parents info is missing</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
