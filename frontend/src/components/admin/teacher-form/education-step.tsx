"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EducationStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function EducationStep({ formData, invalidFields, onInputChange }: EducationStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Educational Qualifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="education">Education Details *</Label>
          <Textarea
            id="education"
            placeholder="Please provide your educational background including degrees, institutions, and years of completion"
            value={formData.education || ""}
            onChange={(e) => onInputChange("education", e.target.value)}
            className={`min-h-[120px] ${invalidFields.includes("education") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("education") && (
            <p className="text-sm text-red-600 mt-1">Education details are required</p>
          )}
        </div>

        <div>
          <Label htmlFor="certifications">Certifications & Additional Qualifications</Label>
          <Textarea
            id="certifications"
            placeholder="List any additional certifications, training, or professional development courses"
            value={formData.certifications || ""}
            onChange={(e) => onInputChange("certifications", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
