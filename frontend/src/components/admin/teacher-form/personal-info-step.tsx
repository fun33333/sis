"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonalInfoStepProps {
  formData: any
  invalidFields: string[]
  // allow any value (string, File, etc.) so image File can be passed
  onInputChange: (field: string, value: any) => void
}

export function PersonalInfoStep({ formData, invalidFields, onInputChange }: PersonalInfoStepProps) {
  const [preview, setPreview] = useState<string | null>(formData?.imagePreview || null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleDropFile(file: File | null) {
    if (file) {
      onInputChange("imageFile", file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  useEffect(() => {
    // if parent provides an image preview in formData, use it
    if (formData?.imagePreview) setPreview(formData.imagePreview)
  }, [formData?.imagePreview])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    if (file) {
      onInputChange("imageFile", file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      onInputChange("imageFile", null)
      setPreview(null)
    }
  }

  useEffect(() => {
    // cleanup object URL when component unmounts or preview changes
    return () => {
      if (preview && preview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(preview)
        } catch (e) {
          // ignore
        }
      }
    }
  }, [preview])

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name || ""}
              onChange={(e) => onInputChange("full_name", e.target.value)}
              className={invalidFields.includes("full_name") ? "border-red-500" : ""}
            />
            {invalidFields.includes("full_name") && <p className="text-sm text-red-600 mt-1">Full name is required</p>}
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
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("gender") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contact_number">Contact Number *</Label>
            <Input
              id="contact_number"
              value={formData.contact_number || ""}
              onChange={(e) => onInputChange("contact_number", e.target.value.replace(/[^0-9]/g, ""))}
              className={invalidFields.includes("contact_number") ? "border-red-500" : ""}
            />
            {invalidFields.includes("contact_number") && <p className="text-sm text-red-600 mt-1">Contact number is required</p>}
          </div>

          <div>
            <Label htmlFor="cnic">CNIC *</Label>
            <Input
              id="cnic"
              value={formData.cnic || ""}
              onChange={(e) => onInputChange("cnic", e.target.value.replace(/[^0-9-]/g, ""))}
              placeholder="12345-1234567-1"
              className={invalidFields.includes("cnic") ? "border-red-500" : ""}
            />
            {invalidFields.includes("cnic") && <p className="text-sm text-red-600 mt-1">CNIC is required</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => onInputChange("email", e.target.value)}
              className={invalidFields.includes("email") ? "border-red-500" : ""}
            />
            {invalidFields.includes("email") && <p className="text-sm text-red-600 mt-1">Email is required</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="permanent_address">Permanent Address *</Label>
            <Textarea
              id="permanent_address"
              value={formData.permanent_address || ""}
              onChange={(e) => onInputChange("permanent_address", e.target.value)}
              className={invalidFields.includes("permanent_address") ? "border-red-500" : ""}
            />
            {invalidFields.includes("permanent_address") && <p className="text-sm text-red-600 mt-1">Permanent address is required</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="current_address">Current Address *</Label>
            <Textarea
              id="current_address"
              value={formData.current_address || ""}
              onChange={(e) => onInputChange("current_address", e.target.value)}
              className={invalidFields.includes("current_address") ? "border-red-500" : ""}
            />
            {invalidFields.includes("current_address") && <p className="text-sm text-red-600 mt-1">Current address is required</p>}
          </div>

          <div>
            <Label htmlFor="marital_status">Marital Status *</Label>
            <Select value={formData.marital_status || ""} onValueChange={(v) => onInputChange("marital_status", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("marital_status") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("marital_status") && <p className="text-sm text-red-600 mt-1">Marital status is required</p>}
          </div>

          {null}
        </div>
      </CardContent>
    </Card>
  )
}
