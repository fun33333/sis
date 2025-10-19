"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calender"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface WorkAssignmentStepProps {
  formData: any
  onInputChange: (field: string, value: string) => void
  invalidFields: string[]
  campuses: any[]
  levels: any[]
}

export function WorkAssignmentStep({ formData, onInputChange, invalidFields, campuses, levels }: WorkAssignmentStepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onInputChange('joining_date', formattedDate);
    }
    setShowDatePicker(false);
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onInputChange(field, checked.toString());
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campus">Campus *</Label>
          <Select 
            value={formData.campus?.toString() || ''} 
            onValueChange={(value) => onInputChange('campus', value)}
          >
            <SelectTrigger className={invalidFields.includes('campus') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select campus" />
            </SelectTrigger>
            <SelectContent>
              {campuses.map((campus) => (
                <SelectItem key={campus.id} value={campus.id.toString()}>
                  {campus.campus_name} ({campus.campus_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidFields.includes('campus') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Campus is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level *</Label>
          <Select 
            value={formData.level?.toString() || ''} 
            onValueChange={(value) => onInputChange('level', value)}
            disabled={!formData.campus}
          >
            <SelectTrigger className={invalidFields.includes('level') ? 'border-red-500' : ''}>
              <SelectValue placeholder={formData.campus ? "Select level" : "Select campus first"} />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level.id} value={level.id.toString()}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invalidFields.includes('level') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Level is required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="joining_date">Joining Date *</Label>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.joining_date && "text-muted-foreground",
                  invalidFields.includes('joining_date') && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.joining_date ? format(new Date(formData.joining_date), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.joining_date ? new Date(formData.joining_date) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {invalidFields.includes('joining_date') && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Joining date is required
            </p>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_currently_active"
            checked={formData.is_currently_active === 'true' || formData.is_currently_active === true}
            onCheckedChange={(checked) => handleCheckboxChange('is_currently_active', !!checked)}
          />
          <Label htmlFor="is_currently_active" className="text-sm font-medium">
            Currently Active
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="can_assign_class_teachers"
            checked={formData.can_assign_class_teachers === 'true' || formData.can_assign_class_teachers === true}
            onCheckedChange={(checked) => handleCheckboxChange('can_assign_class_teachers', !!checked)}
          />
          <Label htmlFor="can_assign_class_teachers" className="text-sm font-medium">
            Can Assign Class Teachers
          </Label>
        </div>
      </div>
    </div>
  )
}
