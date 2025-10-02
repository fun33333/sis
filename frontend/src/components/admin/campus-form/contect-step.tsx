"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ContactStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function ContactStep({ formData, invalidFields, onInputChange }: ContactStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="staff_contact_hr">Staff Contact HR</Label>
            <Input
              id="staff_contact_hr"
              value={formData.staff_contact_hr || ""}
              onChange={e => onInputChange("staff_contact_hr", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="admission_office_contact">Admission Office Contact</Label>
            <Input
              id="admission_office_contact"
              value={formData.admission_office_contact || ""}
              onChange={e => onInputChange("admission_office_contact", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="is_draft">Is Draft</Label>
            <select
              id="is_draft"
              value={formData.is_draft || "false"}
              onChange={e => onInputChange("is_draft", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}