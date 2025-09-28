"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface CurrentRoleStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
}

function CheckboxRow({ items, field, formData, onInputChange }: { items: string[]; field: string; formData: any; onInputChange: (f: string, v: any) => void }) {
  const values: string[] = formData[field] || []

  function toggle(val: string) {
    const next = values.includes(val) ? values.filter((v) => v !== val) : [...values, val]
    onInputChange(field, next)
  }

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {items.map((it) => (
        <label key={it} className="inline-flex items-center gap-2">
          <Checkbox checked={values.includes(it)} onCheckedChange={() => toggle(it)} />
          <span className="text-sm">{it}</span>
        </label>
      ))}
    </div>
  )
}

export function CurrentRoleStep({ formData, invalidFields, onInputChange }: CurrentRoleStepProps) {
  const shiftOptions = ["Morning", "Afternoon", "Both"]
  const classOptions = [
    "Nursery",
    "KG-I",
    "KG-II",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Other",
  ]

  const subjectOptions = [
    "Mathematics",
    "Islamiat",
    "Urdu",
    "English",
    "Sindhi",
    "Chemistry",
    "Science",
    "Biology",
    "Computer Science",
    "PST",
    "Drawing",
  ]

  const sectionOptions = ["A", "B", "C", "D"]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Current Role In Working Organization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Label>Section heading & some details</Label>
          <Input
            value={formData.currentRoleDetails || ""}
            onChange={(e) => onInputChange("currentRoleDetails", e.target.value)}
            className={`mt-2 ${invalidFields.includes("currentRoleDetails") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("currentRoleDetails") && <p className="text-sm text-red-600 mt-1">This field is required</p>}
        </div>

        <div className="mb-4">
          <Label>Shift *</Label>
          <Select value={formData.shift || ""} onValueChange={(v) => onInputChange("shift", v)}>
            <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("shift") ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              {shiftOptions.map((s) => (
                <SelectItem key={s} value={s.toLowerCase()}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidFields.includes("shift") && <p className="text-sm text-red-600 mt-1">Shift is required</p>}
        </div>

        <div className="mb-4">
          <Label>Class Assigned *</Label>
          <CheckboxRow items={classOptions} field="classAssigned" formData={formData} onInputChange={onInputChange} />
          {invalidFields.includes("classAssigned") && <p className="text-sm text-red-600 mt-1">Please select at least one class</p>}
        </div>

        <div className="mb-4">
          <Label>Subjects Assigned *</Label>
          <CheckboxRow items={subjectOptions} field="subjectsAssigned" formData={formData} onInputChange={onInputChange} />
          {invalidFields.includes("subjectsAssigned") && <p className="text-sm text-red-600 mt-1">Please select at least one subject</p>}
        </div>

        <div className="mb-4">
          <Label>Class Teacher? *</Label>
          <Select
            value={typeof formData.isClassTeacher === "boolean" ? String(formData.isClassTeacher) : ""}
            onValueChange={(v) => {
              const isClass = v === "true"
              onInputChange("isClassTeacher", isClass)
              if (!isClass) {
                // clear class-teacher specific selections when user selects No
                onInputChange("classTeacherClasses", [])
                onInputChange("classTeacherSections", [])
              }
            }}
          >
            <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("isClassTeacher") ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">I am Not a Class Teacher</SelectItem>
            </SelectContent>
          </Select>
          {invalidFields.includes("isClassTeacher") && <p className="text-sm text-red-600 mt-1">Please indicate if class teacher</p>}

          {formData.isClassTeacher && (
            <div className="mt-4">
              <Label>Class teacher of class *</Label>
              <CheckboxRow items={classOptions} field="classTeacherClasses" formData={formData} onInputChange={onInputChange} />
              {invalidFields.includes("classTeacherClasses") && <p className="text-sm text-red-600 mt-1">Please select class(es)</p>}

              <div className="mt-3">
                <Label>Sections *</Label>
                <CheckboxRow items={sectionOptions} field="classTeacherSections" formData={formData} onInputChange={onInputChange} />
                {invalidFields.includes("classTeacherSections") && <p className="text-sm text-red-600 mt-1">Please select at least one section</p>}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Label>Additional Responsibilities</Label>
          <Input
            value={formData.currentAdditionalResponsibilities || ""}
            onChange={(e) => onInputChange("currentAdditionalResponsibilities", e.target.value)}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentRoleStep
