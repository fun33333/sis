"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ContactStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
}

export function ContactStep({ formData,	   invalidFields, onInputChange }: ContactStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Contact & Campus Head Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campus Head Section */}
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold text-lg mb-4">Campus Head Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="campus_head_name">Campus Head Name *</Label>
              <Input
                id="campus_head_name"
                value={formData.campus_head_name || ""}
                onChange={e => onInputChange("campus_head_name", e.target.value)}
                className={invalidFields.includes('campus_head_name') ? 'border-red-500' : ''}
                placeholder="e.g. Dr. Ali Khan"
              />
              {invalidFields.includes("campus_head_name") && (
                <p className="text-sm text-red-600 mt-1">Campus head name is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="campus_head_phone">Campus Head Phone</Label>
              <Input
                id="campus_head_phone"
                value={formData.campus_head_phone || ""}
                onChange={e => onInputChange("campus_head_phone", e.target.value)}
                placeholder="e.g. 03001234567"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="campus_head_email">Campus Head Email</Label>
              <Input
                id="campus_head_email"
                type="email"
                value={formData.campus_head_email || ""}
                onChange={e => onInputChange("campus_head_email", e.target.value)}
                placeholder="e.g. head@campus.com"
              />
            </div>
          </div>
        </div>

        {/* Campus Contact Information */}
        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <h3 className="font-semibold text-lg mb-4">Campus Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_phone">Campus Primary Phone *</Label>
              <Input
                id="primary_phone"
                value={formData.primary_phone || ""}
                onChange={e => onInputChange("primary_phone", e.target.value)}
                className={invalidFields.includes('primary_phone') ? 'border-red-500' : ''}
                placeholder="e.g. 021-12345678"
              />
              {invalidFields.includes("primary_phone") && (
                <p className="text-sm text-red-600 mt-1">Primary phone is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="secondary_phone">Campus Secondary Phone</Label>
              <Input
                id="secondary_phone"
                value={formData.secondary_phone || ""}
                onChange={e => onInputChange("secondary_phone", e.target.value)}
                placeholder="e.g. 021-87654321"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="official_email">Campus Official Email *</Label>
              <Input
                id="official_email"
                type="email"
                value={formData.official_email || ""}
                onChange={e => onInputChange("official_email", e.target.value)}
                className={invalidFields.includes('official_email') ? 'border-red-500' : ''}
                placeholder="e.g. info@campus.com"
              />
              {invalidFields.includes("official_email") && (
                <p className="text-sm text-red-600 mt-1">Official email is required</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
