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
            <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact || ""}
              onChange={(e) => onInputChange("emergencyContact", e.target.value)}
              className={invalidFields.includes("emergencyContact") ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500 mt-1">Contact must be of father, mother or guardian.</p>
            {invalidFields.includes("emergencyContact") && (
              <p className="text-sm text-red-600 mt-1">Emergency contact is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="fatherStatus">Father Status</Label>
            <Select value={formData.fatherStatus || ""} onValueChange={(v) => onInputChange("fatherStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("fatherStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alive">Alive</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fatherName">Father Name</Label>
            <Input
              id="fatherName"
              value={formData.fatherName || ""}
              onChange={(e) => onInputChange("fatherName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fatherCNIC">Father CNIC</Label>
            <Input
              id="fatherCNIC"
              value={formData.fatherCNIC || ""}
              onChange={(e) => onInputChange("fatherCNIC", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fatherContact">Father Contact Number</Label>
            <Input
              id="fatherContact"
              value={formData.fatherContact || ""}
              onChange={(e) => onInputChange("fatherContact", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fatherOccupation">Father Occupation</Label>
            <Input
              id="fatherOccupation"
              value={formData.fatherOccupation || ""}
              onChange={(e) => onInputChange("fatherOccupation", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input
              id="guardianName"
              value={formData.guardianName || ""}
              onChange={(e) => onInputChange("guardianName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="guardianRelation">Guardian's Relation with Student</Label>
            <Input
              id="guardianRelation"
              value={formData.guardianRelation || ""}
              onChange={(e) => onInputChange("guardianRelation", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="guardianCNIC">Guardian CNIC</Label>
            <Input
              id="guardianCNIC"
              value={formData.guardianCNIC || ""}
              onChange={(e) => onInputChange("guardianCNIC", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="guardianPhone">Guardian Phone Number</Label>
            <Input
              id="guardianPhone"
              value={formData.guardianPhone || ""}
              onChange={(e) => onInputChange("guardianPhone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="guardianOccupation">Guardian Occupation</Label>
            <Input
              id="guardianOccupation"
              value={formData.guardianOccupation || ""}
              onChange={(e) => onInputChange("guardianOccupation", e.target.value)}
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
            <Label htmlFor="siblingsInAlkhair">Siblings in Al-Khair</Label>
            <Select value={formData.siblingsInAlkhair || ""} onValueChange={(v) => onInputChange("siblingsInAlkhair", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("siblingsInAlkhair") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.siblingsInAlkhair === "yes" && (
            <div className="md:col-span-2">
              <Label htmlFor="siblingsNames">Names of siblings in Alkhair</Label>
              <Input
                id="siblingsNames"
                value={formData.siblingsNames || ""}
                onChange={(e) => onInputChange("siblingsNames", e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="motherCNIC">Mother CNIC</Label>
            <Input
              id="motherCNIC"
              value={formData.motherCNIC || ""}
              onChange={(e) => onInputChange("motherCNIC", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="motherStatus">Mother Status</Label>
            <Select value={formData.motherStatus || ""} onValueChange={(v) => onInputChange("motherStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("motherStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="married">Married</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="motherContact">Mother Contact Number</Label>
            <Input
              id="motherContact"
              value={formData.motherContact || ""}
              onChange={(e) => onInputChange("motherContact", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="motherOccupation">Mother Occupation</Label>
            <Input
              id="motherOccupation"
              value={formData.motherOccupation || ""}
              onChange={(e) => onInputChange("motherOccupation", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="zakatStatus">Zakat Status</Label>
            <Select value={formData.zakatStatus || ""} onValueChange={(v) => onInputChange("zakatStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("zakatStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applicable">Applicable</SelectItem>
                <SelectItem value="not-applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="familyIncome">Family Income</Label>
            <Input
              id="familyIncome"
              type="number"
              value={formData.familyIncome || ""}
              onChange={(e) => onInputChange("familyIncome", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="houseOwned">House Owned</Label>
            <Select value={formData.houseOwned || ""} onValueChange={(v) => onInputChange("houseOwned", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("houseOwned") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.houseOwned === "no" && (
            <div>
              <Label htmlFor="rent">House Rent</Label>
              <Input
                id="rent"
                type="number"
                value={formData.rent || ""}
                onChange={(e) => onInputChange("rent", e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={(e) => onInputChange("address", e.target.value)}
            className={invalidFields.includes("address") ? "border-red-500" : ""}
          />
        </div>
      </CardContent>
    </Card>
  )
}
