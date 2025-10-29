"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface PersonalInfoStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
}

export function PersonalInfoStep({ formData, invalidFields, onInputChange }: PersonalInfoStepProps) {
  const handleCNICChange = (value: string) => {
    const cleanCNIC = value.replace(/\D/g, '')
    let formattedCNIC = cleanCNIC
    
    if (cleanCNIC.length > 5) {
      formattedCNIC = `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5)}`
    }
    if (cleanCNIC.length > 13) {
      formattedCNIC = `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5, 12)}-${cleanCNIC.slice(12, 13)}`
    }
    
    onInputChange('cnic', formattedCNIC)
  }

  return (
    <Card className="border-2 border-[#E7ECEF] shadow-lg">
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.full_name || ''}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              placeholder="Enter full name"
              className={`${invalidFields.includes('full_name') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.dob || ''}
              onChange={(e) => onInputChange('dob', e.target.value)}
              className={`${invalidFields.includes('dob') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.gender || ''} onValueChange={(value) => onInputChange('gender', value)}>
              <SelectTrigger className={`${invalidFields.includes('gender') ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.contact_number || ''}
              onChange={(e) => onInputChange('contact_number', e.target.value)}
              placeholder="03XX-XXXXXXX"
              className={`${invalidFields.includes('contact_number') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className={`${invalidFields.includes('email') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>

          {/* CNIC */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#274C77]">
              CNIC <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.cnic || ''}
              onChange={(e) => handleCNICChange(e.target.value)}
              placeholder="42101-2345678-1"
              maxLength={15}
              className={`${invalidFields.includes('cnic') ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </div>

        {/* Permanent Address */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#274C77]">
            Permanent Address <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={formData.permanent_address || ''}
            onChange={(e) => onInputChange('permanent_address', e.target.value)}
            placeholder="Enter complete permanent address"
            rows={3}
            className={`${invalidFields.includes('permanent_address') ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

