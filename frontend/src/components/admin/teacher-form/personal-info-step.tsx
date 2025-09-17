"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonalInfoStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function PersonalInfoStep({ formData, invalidFields, onInputChange }: PersonalInfoStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName || ""}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              className={invalidFields.includes("fullName") ? "border-red-500" : ""}
            />
            {invalidFields.includes("fullName") && <p className="text-sm text-red-600 mt-1">Full name is required</p>}
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ""}
              onChange={(e) => onInputChange("dob", e.target.value)}
              className={invalidFields.includes("dob") ? "border-red-500" : ""}
            />
            {invalidFields.includes("dob") && <p className="text-sm text-red-600 mt-1">Date of birth is required</p>}
          </div>

          <div>
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender || ""} onValueChange={(v) => onInputChange("gender", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("gender") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("gender") && <p className="text-sm text-red-600 mt-1">Gender is required</p>}
          </div>

          <div>
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber || ""}
              onChange={(e) => onInputChange("contactNumber", e.target.value.replace(/[^0-9]/g, ""))}
              className={invalidFields.includes("contactNumber") ? "border-red-500" : ""}
            />
            {invalidFields.includes("contactNumber") && (
              <p className="text-sm text-red-600 mt-1">Contact number is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => onInputChange("email", e.target.value)}
              className={invalidFields.includes("email") ? "border-red-500" : ""}
            />
            {invalidFields.includes("email") && <p className="text-sm text-red-600 mt-1">Email is required</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="permanentAddress">Permanent Address</Label>
          <Textarea
            id="permanentAddress"
            value={formData.permanentAddress || ""}
            onChange={(e) => onInputChange("permanentAddress", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="currentAddress">Current Address (if different)</Label>
          <Textarea
            id="currentAddress"
            value={formData.currentAddress || ""}
            onChange={(e) => onInputChange("currentAddress", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select value={formData.maritalStatus || ""} onValueChange={(v) => onInputChange("maritalStatus", v)}>
            <SelectTrigger className="border-2 focus:border-primary">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
