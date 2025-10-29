"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfessionalInfoStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
}

export function ProfessionalInfoStep({ formData, invalidFields, onInputChange }: ProfessionalInfoStepProps) {
  return (
    <Card className="border-2 border-[#E7ECEF] shadow-lg">
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education Level */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Education Level <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.education_level || ''}
              onChange={(e) => onInputChange('education_level', e.target.value)}
              placeholder="e.g., Masters, Bachelors"
              className={`${invalidFields.includes('education_level') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Institution Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Institution Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.institution_name || ''}
              onChange={(e) => onInputChange('institution_name', e.target.value)}
              placeholder="Name of the institution"
              className={`${invalidFields.includes('institution_name') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Year of Passing */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Year of Passing <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.year_of_passing || ''}
              onChange={(e) => onInputChange('year_of_passing', parseInt(e.target.value) || '')}
              placeholder="e.g., 2020"
              min="1950"
              max={new Date().getFullYear()}
              className={`${invalidFields.includes('year_of_passing') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Total Experience Years */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Total Experience (Years) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.total_experience_years || ''}
              onChange={(e) => onInputChange('total_experience_years', parseInt(e.target.value) || 0)}
              placeholder="e.g., 10"
              min="0"
              max="50"
              className={`${invalidFields.includes('total_experience_years') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
