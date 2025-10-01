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
  const requiredFields = [
    "campus",
    "currentGrade",
    "section",
    "shift",
    "admissionYear",
    "lastClassPassed",
    "lastSchoolName",
    "lastClassResult",
    "currentState",
  ]

  const missingRequired = requiredFields.filter((f) => {
    const v = formData?.[f]
    return v === undefined || v === null || v === ""
  })

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Academic Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campus">Select Campus *</Label>
            <Select value={formData.campus || ""} onValueChange={(v) => onInputChange("campus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("campus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus-1">Campus 1</SelectItem>
                <SelectItem value="campus-2">Campus 2</SelectItem>
                <SelectItem value="campus-3">Campus 3</SelectItem>
                <SelectItem value="campus-4">Campus 4</SelectItem>
                <SelectItem value="campus-5">Campus 5</SelectItem>
                <SelectItem value="campus-6">Campus 6</SelectItem>
                <SelectItem value="campus-8">Campus 8</SelectItem>
              </SelectContent>
            </Select>
            {(invalidFields.includes("campus") || missingRequired.includes("campus")) && (
              <p className="text-sm text-red-600 mt-1">Campus is required</p>
            )}
          </div>

        <div>
          <Label htmlFor="currentState">Current state *</Label>
          <Select value={formData.currentState || ""} onValueChange={(v) => onInputChange("currentState", v)}>
            <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("currentState") ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(invalidFields.includes("currentState") || missingRequired.includes("currentState")) && (
            <p className="text-sm text-red-600 mt-1">Current state is required</p>
          )}
        </div>

          <div>
            <Label htmlFor="currentGrade">Current Grade/Class *</Label>
            <Select value={formData.currentGrade || ""} onValueChange={(v) => onInputChange("currentGrade", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("currentGrade") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select grade/class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="special">Special Class</SelectItem>
                <SelectItem value="nursery">Nursery</SelectItem>
                <SelectItem value="kg-1">KG-1</SelectItem>
                <SelectItem value="kg-2">KG-2</SelectItem>
                <SelectItem value="grade-1">Grade 1</SelectItem>
                <SelectItem value="grade-2">Grade 2</SelectItem>
                <SelectItem value="grade-3">Grade 3</SelectItem>
                <SelectItem value="grade-4">Grade 4</SelectItem>
                <SelectItem value="grade-5">Grade 5</SelectItem>
                <SelectItem value="grade-6">Grade 6</SelectItem>
                <SelectItem value="grade-7">Grade 7</SelectItem>
                <SelectItem value="grade-8">Grade 8</SelectItem>
                <SelectItem value="grade-9">Grade 9</SelectItem>
                <SelectItem value="grade-10">Grade 10</SelectItem>
              </SelectContent>
            </Select>
            {(invalidFields.includes("currentGrade") || missingRequired.includes("currentGrade")) && (
              <p className="text-sm text-red-600 mt-1">Current grade/class is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="section">Section *</Label>
            <Select value={formData.section || ""} onValueChange={(v) => onInputChange("section", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("section") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
            {(invalidFields.includes("section") || missingRequired.includes("section")) && (
              <p className="text-sm text-red-600 mt-1">Section is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="shift">Shift *</Label>
            <Select value={formData.shift || ""} onValueChange={(v) => onInputChange("shift", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("shift") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
              </SelectContent>
            </Select>
            {(invalidFields.includes("shift") || missingRequired.includes("shift")) && (
              <p className="text-sm text-red-600 mt-1">Shift is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="admissionYear">Year of Admission *</Label>
            <Input
              id="admissionYear"
              type="number"
              value={formData.admissionYear || ""}
              onChange={(e) => onInputChange("admissionYear", e.target.value)}
            />
            {(invalidFields.includes("admissionYear") || missingRequired.includes("admissionYear")) && (
              <p className="text-sm text-red-600 mt-1">Year of admission is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastClassPassed">Last Class Passed *</Label>
            <Select value={formData.lastClassPassed || ""} onValueChange={(v) => onInputChange("lastClassPassed", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("lastClassPassed") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select last class passed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nursery">Nursery</SelectItem>
                <SelectItem value="kg-1">KG-1</SelectItem>
                <SelectItem value="kg-2">KG-2</SelectItem>
                <SelectItem value="special">Special class</SelectItem>
                <SelectItem value="grade-1">Grade 1</SelectItem>
                <SelectItem value="grade-2">Grade 2</SelectItem>
                <SelectItem value="grade-3">Grade 3</SelectItem>
                <SelectItem value="grade-4">Grade 4</SelectItem>
                <SelectItem value="grade-5">Grade 5</SelectItem>
                <SelectItem value="grade-6">Grade 6</SelectItem>
                <SelectItem value="grade-7">Grade 7</SelectItem>
                <SelectItem value="grade-8">Grade 8</SelectItem>
                <SelectItem value="grade-9">Grade 9</SelectItem>
                <SelectItem value="grade-10">Grade 10</SelectItem>
              </SelectContent>
            </Select>
            {(invalidFields.includes("lastClassPassed") || missingRequired.includes("lastClassPassed")) && (
              <p className="text-sm text-red-600 mt-1">Last class passed is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="lastSchoolName">Last School Name *</Label>
            <Input
              id="lastSchoolName"
              value={formData.lastSchoolName || ""}
              onChange={(e) => onInputChange("lastSchoolName", e.target.value)}
            />
            {(invalidFields.includes("lastSchoolName") || missingRequired.includes("lastSchoolName")) && (
              <p className="text-sm text-red-600 mt-1">Last school name is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="lastClassResult">Last Class Result *</Label>
            <Input
              id="lastClassResult"
              value={formData.lastClassResult || ""}
              onChange={(e) => onInputChange("lastClassResult", e.target.value)}
            />
            {(invalidFields.includes("lastClassResult") || missingRequired.includes("lastClassResult")) && (
              <p className="text-sm text-red-600 mt-1">Last class result is required</p>
            )}
          </div>

        <div>
          <Label htmlFor="grNumber">Old gr no</Label>
          <Input id="grNumber" value={formData.grNumber || ""} onChange={(e) => onInputChange("grNumber", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="fromYear">From year</Label>
          <Input id="fromYear" type="number" value={formData.fromYear || ""} onChange={(e) => onInputChange("fromYear", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="toYear">To year</Label>
          <Input id="toYear" type="number" value={formData.toYear || ""} onChange={(e) => onInputChange("toYear", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="reasonForTransfer">Reason for transfer</Label>
          <Input id="reasonForTransfer" value={formData.reasonForTransfer || ""} onChange={(e) => onInputChange("reasonForTransfer", e.target.value)} />
        </div>
        </div>
      </CardContent>
    </Card>
  )
}
