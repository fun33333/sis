"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExperienceStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function ExperienceStep({ formData, invalidFields, onInputChange }: ExperienceStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="experience">Work Experience *</Label>
          <Textarea
            id="experience"
            placeholder="Describe your work experience including previous positions, institutions, and duration"
            value={formData.experience || ""}
            onChange={(e) => onInputChange("experience", e.target.value)}
            className={`min-h-[120px] ${invalidFields.includes("experience") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("experience") && (
            <p className="text-sm text-red-600 mt-1">Work experience is required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentRole">Current Role *</Label>
            <Input
              id="currentRole"
              value={formData.currentRole || ""}
              onChange={(e) => onInputChange("currentRole", e.target.value)}
              className={invalidFields.includes("currentRole") ? "border-red-500" : ""}
            />
            {invalidFields.includes("currentRole") && (
              <p className="text-sm text-red-600 mt-1">Current role is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="subjects">Subjects Taught *</Label>
            <Input
              id="subjects"
              placeholder="e.g., Mathematics, English, Science"
              value={formData.subjects || ""}
              onChange={(e) => onInputChange("subjects", e.target.value)}
              className={invalidFields.includes("subjects") ? "border-red-500" : ""}
            />
            {invalidFields.includes("subjects") && (
              <p className="text-sm text-red-600 mt-1">Subjects taught are required</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="classesSections">Classes & Sections Taught</Label>
          <Select value={formData.classesSections || ""} onValueChange={(v) => onInputChange("classesSections", v)}>
            <SelectTrigger className="border-2 focus:border-primary">
              <SelectValue placeholder="Select classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nursery">Nursery</SelectItem>
              <SelectItem value="primary">Primary (1-5)</SelectItem>
              <SelectItem value="middle">Middle (6-8)</SelectItem>
              <SelectItem value="secondary">Secondary (9-10)</SelectItem>
              <SelectItem value="all">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="additionalResponsibilities">Additional Responsibilities</Label>
          <Textarea
            id="additionalResponsibilities"
            placeholder="Any additional duties, administrative roles, or special responsibilities"
            value={formData.additionalResponsibilities || ""}
            onChange={(e) => onInputChange("additionalResponsibilities", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
