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
            <Label htmlFor="powerBackup">Power Backup</Label>
            <Select value={formData.powerBackup || ""} onValueChange={(v) => onInputChange("powerBackup", v)}>
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="internetAvailability">Internet Availability</Label>
            <Select
              value={formData.internetAvailability || ""}
              onValueChange={(v) => onInputChange("internetAvailability", v)}
            >
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="establishedDate">Established Date</Label>
            <Input
              id="establishedDate"
              type="date"
              value={formData.establishedDate || ""}
              onChange={(e) => onInputChange("establishedDate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="staffHRContact">Staff HR Contact</Label>
            <Input
              id="staffHRContact"
              value={formData.staffHRContact || ""}
              onChange={(e) => onInputChange("staffHRContact", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="admissionOfficeContact">Admission Office Contact</Label>
            <Input
              id="admissionOfficeContact"
              value={formData.admissionOfficeContact || ""}
              onChange={(e) => onInputChange("admissionOfficeContact", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
