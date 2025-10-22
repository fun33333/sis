"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

const EDUCATION_LEVELS = [
  'Matric',
  'Intermediate',
  'Bachelor',
  'Master',
  'MPhil',
  'PhD',
  'Other'
];

interface EducationStepProps {
  formData: any
  onInputChange: (field: string, value: string) => void
  invalidFields: string[]
}

export function EducationStep({ formData, onInputChange, invalidFields }: EducationStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="education_level">Education Level *</Label>
          <Select 
            value={formData.education_level || ''} 
            onValueChange={(value) => onInputChange('education_level', value)}
          >
            <SelectTrigger className={invalidFields.includes('education_level') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidFields.includes('education_level') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Education level is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution_name">Institution Name *</Label>
          <Input
            id="institution_name"
            value={formData.institution_name || ''}
            onChange={(e) => onInputChange('institution_name', e.target.value)}
            placeholder="University/College name"
            className={invalidFields.includes('institution_name') ? 'border-red-500' : ''}
          />
          {invalidFields.includes('institution_name') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Institution name is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year_of_passing">Year of Passing *</Label>
          <Input
            id="year_of_passing"
            type="number"
            value={formData.year_of_passing || ''}
            onChange={(e) => onInputChange('year_of_passing', e.target.value)}
            placeholder="2020"
            min="1950"
            max={new Date().getFullYear()}
            className={invalidFields.includes('year_of_passing') ? 'border-red-500' : ''}
          />
          {invalidFields.includes('year_of_passing') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Year of passing is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_experience_years">Total Experience (Years) *</Label>
          <Input
            id="total_experience_years"
            type="number"
            value={formData.total_experience_years || ''}
            onChange={(e) => onInputChange('total_experience_years', e.target.value)}
            placeholder="5"
            min="0"
            className={invalidFields.includes('total_experience_years') ? 'border-red-500' : ''}
          />
          {invalidFields.includes('total_experience_years') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Experience years is required
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
