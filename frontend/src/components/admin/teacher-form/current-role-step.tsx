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
            <Label htmlFor="current_role_title">Current role title</Label>
            <Input id="current_role_title" value={formData.current_role_title || ""} onChange={(e) => onInputChange("current_role_title", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="current_campus">Current campus</Label>
            <Select value={formData.current_campus || ""} onValueChange={(v) => onInputChange("current_campus", v)}>
              <SelectTrigger className="mt-2 border-2 focus:border-primary">
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
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="current_subjects">Current subjects</Label>
            <Input id="current_subjects" value={formData.current_subjects || ""} onChange={(e) => onInputChange("current_subjects", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="current_classes_taught">Current classes taught</Label>
            <Input id="current_classes_taught" value={formData.current_classes_taught || ""} onChange={(e) => onInputChange("current_classes_taught", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="current_extra_responsibilities">Current extra responsibilities</Label>
            <Input id="current_extra_responsibilities" value={formData.current_extra_responsibilities || ""} onChange={(e) => onInputChange("current_extra_responsibilities", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role_start_date">Role start date</Label>
            <Input id="role_start_date" type="date" value={formData.role_start_date || ""} onChange={(e) => onInputChange("role_start_date", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role_end_date">Role end date</Label>
            <Input id="role_end_date" type="date" value={formData.role_end_date || ""} onChange={(e) => onInputChange("role_end_date", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="is_currently_active">Is currently active</Label>
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
          <div>
            <Label htmlFor="save_status">Save status</Label>
            <Select value={formData.save_status || ""} onValueChange={(v) => onInputChange("save_status", v)}>
              <SelectTrigger className="mt-2 border-2 focus:border-primary">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentRoleStep
