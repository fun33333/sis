"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calender"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

interface PersonalInfoStepProps {
  formData: any
  onInputChange: (field: string, value: string) => void
  invalidFields: string[]
  duplicateErrors?: {[key: string]: string}
}

export function PersonalInfoStep({ formData, onInputChange, invalidFields, duplicateErrors = {} }: PersonalInfoStepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onInputChange('dob', formattedDate);
    }
    setShowDatePicker(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name || ''}
            onChange={(e) => onInputChange('full_name', e.target.value)}
            placeholder="Enter full name"
            className={`h-12 text-base transition-all duration-200 ${
              invalidFields.includes('full_name') || duplicateErrors.full_name 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
          {invalidFields.includes('full_name') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Full name is required
            </p>
          )}
          {duplicateErrors.full_name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {duplicateErrors.full_name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">Date of Birth *</Label>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal text-base transition-all duration-200",
                  !formData.dob && "text-muted-foreground",
                  invalidFields.includes('dob') 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {formData.dob ? format(new Date(formData.dob), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.dob ? new Date(formData.dob) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {invalidFields.includes('dob') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Date of birth is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender *</Label>
          <Select 
            value={formData.gender || ''} 
            onValueChange={(value) => onInputChange('gender', value)}
          >
            <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
              invalidFields.includes('gender') 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidFields.includes('gender') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Gender is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_number" className="text-sm font-semibold text-gray-700">Contact Number *</Label>
          <Input
            id="contact_number"
            value={formData.contact_number || ''}
            onChange={(e) => onInputChange('contact_number', e.target.value)}
            placeholder="+92 300 1234567"
            className={`h-12 text-base transition-all duration-200 ${
              invalidFields.includes('contact_number') 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
          {invalidFields.includes('contact_number') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Contact number is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="coordinator@example.com"
            className={`h-12 text-base transition-all duration-200 ${
              invalidFields.includes('email') || duplicateErrors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
          {invalidFields.includes('email') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Email is required
            </p>
          )}
          {duplicateErrors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {duplicateErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnic" className="text-sm font-semibold text-gray-700">CNIC *</Label>
          <Input
            id="cnic"
            value={formData.cnic || ''}
            onChange={(e) => onInputChange('cnic', e.target.value)}
            placeholder="12345-1234567-1"
            className={`h-12 text-base transition-all duration-200 ${
              invalidFields.includes('cnic') || duplicateErrors.cnic 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
          {invalidFields.includes('cnic') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              CNIC is required
            </p>
          )}
          {duplicateErrors.cnic && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {duplicateErrors.cnic}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 col-span-1 lg:col-span-2">
        <Label htmlFor="permanent_address" className="text-sm font-semibold text-gray-700">Permanent Address *</Label>
        <Textarea
          id="permanent_address"
          value={formData.permanent_address || ''}
          onChange={(e) => onInputChange('permanent_address', e.target.value)}
          placeholder="Enter complete address"
          rows={4}
          className={`text-base transition-all duration-200 resize-none ${
            invalidFields.includes('permanent_address') 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }`}
        />
        {invalidFields.includes('permanent_address') && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Address is required
          </p>
        )}
      </div>
    </div>
  )
}
