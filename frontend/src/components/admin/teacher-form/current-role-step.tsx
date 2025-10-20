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
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Current Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current_campus">Current Campus *</Label>
            <Select value={formData.current_campus || ""} onValueChange={(v) => onInputChange("current_campus", v)}>
              <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("current_campus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Campus 6</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("current_campus") && <p className="text-sm text-red-600 mt-1">Current campus is required</p>}
            <p className="text-xs text-gray-500 mt-1">Teachers can only be added to your assigned campus</p>
          </div>
          
          <div>
            <Label htmlFor="joining_date">Joining Date *</Label>
            <Input 
              id="joining_date" 
              type="date" 
              value={formData.joining_date || ""} 
              onChange={(e) => onInputChange("joining_date", e.target.value)}
              className={invalidFields.includes("joining_date") ? "border-red-500" : ""}
              max={new Date().toISOString().split('T')[0]}
            />
            {invalidFields.includes("joining_date") && <p className="text-sm text-red-600 mt-1">Joining date is required</p>}
          </div>
          
          <div>
            <Label htmlFor="shift">Shift *</Label>
            <Select value={formData.shift || ""} onValueChange={(v) => onInputChange("shift", v)}>
              <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("shift") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("shift") && <p className="text-sm text-red-600 mt-1">Shift is required</p>}
          </div>
          
          <div>
            <Label htmlFor="is_currently_active">Is Currently Active</Label>
            <Select value={String(Boolean(formData.is_currently_active))} onValueChange={(v) => onInputChange("is_currently_active", v === "true") }>
              <SelectTrigger className="mt-2 border-2 focus:border-primary">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="current_subjects">Current Subjects (Optional)</Label>
            <Input 
              id="current_subjects" 
              value={formData.current_subjects || ""} 
              onChange={(e) => onInputChange("current_subjects", e.target.value)}
              placeholder="e.g., Mathematics, Physics, Chemistry"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="current_classes_taught">Current Classes Taught (Optional)</Label>
            <Input 
              id="current_classes_taught" 
              value={formData.current_classes_taught || ""} 
              onChange={(e) => onInputChange("current_classes_taught", e.target.value)}
              placeholder="e.g., Grade 6-8, Grade 9-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="current_extra_responsibilities">Current Extra Responsibilities (Optional)</Label>
            <Input 
              id="current_extra_responsibilities" 
              value={formData.current_extra_responsibilities || ""} 
              onChange={(e) => onInputChange("current_extra_responsibilities", e.target.value)}
              placeholder="e.g., Sports Coordinator, Library In-charge"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentRoleStep
