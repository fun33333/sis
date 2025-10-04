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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="previous_institution_name">Previous institution name</Label>
            <Input id="previous_institution_name" value={formData.previous_institution_name || ""} onChange={(e) => onInputChange("previous_institution_name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="previous_position">Previous position</Label>
            <Input id="previous_position" value={formData.previous_position || ""} onChange={(e) => onInputChange("previous_position", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="experience_from_date">Experience from date</Label>
            <Input id="experience_from_date" type="date" value={formData.experience_from_date || ""} onChange={(e) => onInputChange("experience_from_date", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="experience_to_date">Experience to date</Label>
            <Input id="experience_to_date" type="date" value={formData.experience_to_date || ""} onChange={(e) => onInputChange("experience_to_date", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="experience_subjects_classes_taught">Experience subjects classes taught</Label>
            <Input id="experience_subjects_classes_taught" value={formData.experience_subjects_classes_taught || ""} onChange={(e) => onInputChange("experience_subjects_classes_taught", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="previous_responsibilities">Previous responsibilities</Label>
            <Textarea id="previous_responsibilities" value={formData.previous_responsibilities || ""} onChange={(e) => onInputChange("previous_responsibilities", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="total_experience_years">Total experience years</Label>
                <Input 
                id="total_experience_years" 
                type="number" 
                step="0.01"
                min="0"
                max="99.99"  // Realistic max experience
                placeholder="e.g., 5.5 years"
                value={formData.total_experience_years || ""} 
                onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value > 99.99) {
                // Show warning but don't block
                console.warn("Experience seems high, please verify");
                }
                onInputChange("total_experience_years", e.target.value);
                }} 
                />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="additional_institution_name_exp">Additional institution name (exp)</Label>
            <Input id="additional_institution_name_exp" value={formData.additional_institution_name_exp || ""} onChange={(e) => onInputChange("additional_institution_name_exp", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="additional_position">Additional position</Label>
            <Input id="additional_position" value={formData.additional_position || ""} onChange={(e) => onInputChange("additional_position", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="additional_experience_from_date">Additional experience from date</Label>
            <Input id="additional_experience_from_date" type="date" value={formData.additional_experience_from_date || ""} onChange={(e) => onInputChange("additional_experience_from_date", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="additional_experience_to_date">Additional experience to date</Label>
            <Input id="additional_experience_to_date" type="date" value={formData.additional_experience_to_date || ""} onChange={(e) => onInputChange("additional_experience_to_date", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="additional_experience_subjects_classes">Additional experience subjects classes</Label>
            <Input id="additional_experience_subjects_classes" value={formData.additional_experience_subjects_classes || ""} onChange={(e) => onInputChange("additional_experience_subjects_classes", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="additional_responsibilities">Additional responsibilities</Label>
            <Textarea id="additional_responsibilities" value={formData.additional_responsibilities || ""} onChange={(e) => onInputChange("additional_responsibilities", e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
