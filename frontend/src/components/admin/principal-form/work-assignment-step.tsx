"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkAssignmentStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
  campuses: any[]
}

export function WorkAssignmentStep({ formData, invalidFields, onInputChange, campuses }: WorkAssignmentStepProps) {
  return (
    <Card className="border-2 border-[#E7ECEF] shadow-lg">
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campus */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Campus <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.campus ? String(formData.campus) : ''} 
              onValueChange={(value) => onInputChange('campus', parseInt(value))}
            >
              <SelectTrigger className={`${invalidFields.includes('campus') ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={String(campus.id)}>
                    {campus.campus_name || campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Shift <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.shift || ''} onValueChange={(value) => onInputChange('shift', value)}>
              <SelectTrigger className={`${invalidFields.includes('shift') ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Joining Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Joining Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.joining_date || ''}
              onChange={(e) => onInputChange('joining_date', e.target.value)}
              className={`${invalidFields.includes('joining_date') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.is_currently_active ? 'active' : 'inactive'} 
              onValueChange={(value) => onInputChange('is_currently_active', value === 'active')}
            >
              <SelectTrigger className={`${invalidFields.includes('is_currently_active') ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

