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
        <CardTitle>Last Work Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="lastWorkExperience">Last Work Experience (details) *</Label>
          <Textarea
            id="lastWorkExperience"
            placeholder="Section heading and some details about the last work experience"
            value={formData.lastWorkExperience || ""}
            onChange={(e) => onInputChange("lastWorkExperience", e.target.value)}
            className={`min-h-[120px] ${invalidFields.includes("lastWorkExperience") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("lastWorkExperience") && (
            <p className="text-sm text-red-600 mt-1">This field is required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lastOrganizationName">Last working Organization Name *</Label>
            <Input
              id="lastOrganizationName"
              value={formData.lastOrganizationName || ""}
              onChange={(e) => onInputChange("lastOrganizationName", e.target.value)}
              className={invalidFields.includes("lastOrganizationName") ? "border-red-500" : ""}
            />
            {invalidFields.includes("lastOrganizationName") && (
              <p className="text-sm text-red-600 mt-1">Organization name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="position">Position / Designation *</Label>
            <Input
              id="position"
              value={formData.position || ""}
              onChange={(e) => onInputChange("position", e.target.value)}
              className={invalidFields.includes("position") ? "border-red-500" : ""}
            />
            {invalidFields.includes("position") && (
              <p className="text-sm text-red-600 mt-1">Position / Designation is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="teacherRoleType">Role Type *</Label>
            <Select value={formData.teacherRoleType || ""} onValueChange={(v) => onInputChange("teacherRoleType", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("teacherRoleType") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("teacherRoleType") && (
              <p className="text-sm text-red-600 mt-1">Please select role type</p>
            )}

            {/* conditional input shown based on role type; value stored in teacherSubjects */}
            {formData.teacherRoleType === "teacher" ? (
              <div className="mt-4">
                <Label htmlFor="teacherSubjects">Subjects taught in organization *</Label>
                <Input
                  id="teacherSubjects"
                  placeholder="e.g., Mathematics, Grade 6-8"
                  value={formData.teacherSubjects || ""}
                  onChange={(e) => onInputChange("teacherSubjects", e.target.value)}
                  className={invalidFields.includes("teacherSubjects") ? "border-red-500" : ""}
                />
                {invalidFields.includes("teacherSubjects") && (
                  <p className="text-sm text-red-600 mt-1">Please provide subjects or classes taught</p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <Label htmlFor="teacherSubjects">Other role details *</Label>
                <Input
                  id="teacherSubjects"
                  placeholder="Describe the role / designation"
                  value={formData.teacherSubjects || ""}
                  onChange={(e) => onInputChange("teacherSubjects", e.target.value)}
                  className={invalidFields.includes("teacherSubjects") ? "border-red-500" : ""}
                />
                {invalidFields.includes("teacherSubjects") && (
                  <p className="text-sm text-red-600 mt-1">Please provide role details</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="fromDate">From Date *</Label>
            <Input
              id="fromDate"
              type="date"
              value={formData.fromDate || ""}
              onChange={(e) => onInputChange("fromDate", e.target.value)}
              className={invalidFields.includes("fromDate") ? "border-red-500" : ""}
            />
            {invalidFields.includes("fromDate") && (
              <p className="text-sm text-red-600 mt-1">From date is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="toDate">To Date *</Label>
            <Input
              id="toDate"
              type="date"
              value={formData.toDate || ""}
              onChange={(e) => onInputChange("toDate", e.target.value)}
              className={invalidFields.includes("toDate") ? "border-red-500" : ""}
            />
            {invalidFields.includes("toDate") && (
              <p className="text-sm text-red-600 mt-1">To date is required</p>
            )}
          </div>

          
        </div>
      </CardContent>
    </Card>
  )
}
