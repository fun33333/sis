"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AcademicDetailsStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function AcademicDetailsStep({ formData, invalidFields, onInputChange }: AcademicDetailsStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Academic Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentState">Current State *</Label>
            <Select value={formData.currentState || ""} onValueChange={(v) => onInputChange("currentState", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("currentState") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("currentState") && (
              <p className="text-sm text-red-600 mt-1">Current state is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campus">Campus *</Label>
            <Select value={formData.campus || ""} onValueChange={(v) => onInputChange("campus", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("campus") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Campus</SelectItem>
                <SelectItem value="north">North Campus</SelectItem>
                <SelectItem value="south">South Campus</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("campus") && <p className="text-sm text-red-600 mt-1">Campus is required</p>}
          </div>

          <div>
            <Label htmlFor="currentGrade">Current Grade *</Label>
            <Select value={formData.currentGrade || ""} onValueChange={(v) => onInputChange("currentGrade", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("currentGrade") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nursery">Nursery</SelectItem>
                <SelectItem value="kg">KG</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("currentGrade") && (
              <p className="text-sm text-red-600 mt-1">Current grade is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="section">Section *</Label>
            <Select value={formData.section || ""} onValueChange={(v) => onInputChange("section", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("section") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Section A</SelectItem>
                <SelectItem value="B">Section B</SelectItem>
                <SelectItem value="C">Section C</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("section") && <p className="text-sm text-red-600 mt-1">Section is required</p>}
          </div>

          <div>
            <Label htmlFor="fromYear">From Year</Label>
            <Input
              id="fromYear"
              type="number"
              value={formData.fromYear || ""}
              onChange={(e) => onInputChange("fromYear", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="toYear">To Year</Label>
            <Input
              id="toYear"
              type="number"
              value={formData.toYear || ""}
              onChange={(e) => onInputChange("toYear", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="grNumber">GR Number</Label>
            <Input
              id="grNumber"
              value={formData.grNumber || ""}
              onChange={(e) => onInputChange("grNumber", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="oldGRNo">Old GR Number</Label>
            <Input
              id="oldGRNo"
              value={formData.oldGRNo || ""}
              onChange={(e) => onInputChange("oldGRNo", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="lastClassPassed">Last Class Passed</Label>
            <Input
              id="lastClassPassed"
              value={formData.lastClassPassed || ""}
              onChange={(e) => onInputChange("lastClassPassed", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="lastSchoolName">Last School Name</Label>
            <Input
              id="lastSchoolName"
              value={formData.lastSchoolName || ""}
              onChange={(e) => onInputChange("lastSchoolName", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
