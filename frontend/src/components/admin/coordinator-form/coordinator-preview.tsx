"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Edit, CheckCircle, X } from "lucide-react"
import { format } from "date-fns"

interface CoordinatorPreviewProps {
  formData: any
  onEdit: () => void
  onSubmit: () => void
  onCancel: () => void
  isEdit: boolean
  campuses?: any[]
  levels?: any[]
  isSubmitting?: boolean
}

export function CoordinatorPreview({ formData, onEdit, onSubmit, onCancel, isEdit, campuses = [], levels = [], isSubmitting = false }: CoordinatorPreviewProps) {
  // Get campus and level names
  const campusName = campuses.find(c => c.id === parseInt(formData.campus))?.campus_name || 'Not provided';
  const levelName = levels.find(l => l.id === parseInt(formData.level))?.name || 'Not provided';
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {isEdit ? 'Edit Coordinator - Preview' : 'Add Coordinator - Preview'}
          </CardTitle>
          <CardDescription>
            Review the coordinator information before submitting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-sm">{formData.full_name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                <p className="text-sm">
                  {formData.dob ? format(new Date(formData.dob), 'PPP') : 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Gender</Label>
                <p className="text-sm capitalize">{formData.gender || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Contact Number</Label>
                <p className="text-sm">{formData.contact_number || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm">{formData.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">CNIC</Label>
                <p className="text-sm">{formData.cnic || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Permanent Address</Label>
              <p className="text-sm">{formData.permanent_address || 'Not provided'}</p>
            </div>
          </div>

          {/* Educational Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Educational Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Education Level</Label>
                <p className="text-sm">{formData.education_level || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Institution Name</Label>
                <p className="text-sm">{formData.institution_name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Year of Passing</Label>
                <p className="text-sm">{formData.year_of_passing || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Experience</Label>
                <p className="text-sm">{formData.total_experience_years ? `${formData.total_experience_years} years` : 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Work Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Work Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Campus</Label>
                <p className="text-sm">{campusName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Level</Label>
                <p className="text-sm">{levelName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Joining Date</Label>
                <p className="text-sm">
                  {formData.joining_date ? format(new Date(formData.joining_date), 'PPP') : 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="flex gap-2">
                  <Badge variant={formData.is_currently_active === 'true' || formData.is_currently_active === true ? 'default' : 'secondary'}>
                    {formData.is_currently_active === 'true' || formData.is_currently_active === true ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant={formData.can_assign_class_teachers === 'true' || formData.can_assign_class_teachers === true ? 'default' : 'secondary'}>
                    {formData.can_assign_class_teachers === 'true' || formData.can_assign_class_teachers === true ? 'Can Assign Teachers' : 'Cannot Assign Teachers'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={onSubmit}
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {isEdit ? 'Update Coordinator' : 'Add Coordinator'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
