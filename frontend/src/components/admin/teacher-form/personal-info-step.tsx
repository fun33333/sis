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
          <div className="md:col-span-2">
            <Label htmlFor="image">Teacher Photo *</Label>
            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragActive(true)
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragActive(false)
                const file = e.dataTransfer?.files?.[0] || null
                handleDropFile(file)
              }}
              className={`mt-2 border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragActive ? "bg-gray-50 border-primary" : "bg-transparent"
              }`}
            >
              <input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* center icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16v2a2 2 0 002 2h6a2 2 0 002-2v-2M7 10l5-5 5 5" />
              </svg>

              <div className="mt-4 text-sm font-semibold">Upload Teacher photo</div>
              <div className="mt-1 text-xs text-muted-foreground">PNG, JPG or GIF. Click to choose or drag and drop here.</div>
            </div>

            {preview && (
              <div className="mt-3">
                <img src={preview} alt="preview" className="w-full max-w-md h-32 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="campus">Select Campus</Label>
            <Select value={formData.campus || ""} onValueChange={(v) => onInputChange("campus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("campus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus-1">Campus 1</SelectItem>
                <SelectItem value="campus-2">Campus 2</SelectItem>
                <SelectItem value="campus-3">Campus 3</SelectItem>
                <SelectItem value="campus-4">Campus 4</SelectItem>
                <SelectItem value="campus-5">Campus 5</SelectItem>
                <SelectItem value="campus-6">Campus 6</SelectItem>
                <SelectItem value="campus-7">Campus 7</SelectItem>
                <SelectItem value="campus-8">Campus 8</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber || ""}
              onChange={(e) => onInputChange("contactNumber", e.target.value.replace(/[^0-9]/g, ""))}
              className={invalidFields.includes("contactNumber") ? "border-red-500" : ""}
            />
            {invalidFields.includes("contactNumber") && <p className="text-sm text-red-600 mt-1">Contact number is required</p>}
          </div>

          <div>
            <Label htmlFor="emergencyContactNumber">Emergency Contact Number *</Label>
            <Input
              id="emergencyContactNumber"
              value={formData.emergencyContactNumber || ""}
              onChange={(e) => onInputChange("emergencyContactNumber", e.target.value.replace(/[^0-9]/g, ""))}
            />
            {invalidFields.includes("emergencyContactNumber") && <p className="text-sm text-red-600 mt-1">Emergency contact is required</p>}
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
            <Label htmlFor="permanentAddress">Permanent Address *</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress || ""}
              onChange={(e) => onInputChange("permanentAddress", e.target.value)}
            />
            {invalidFields.includes("permanentAddress") && <p className="text-sm text-red-600 mt-1">Permanent address is required</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="temporaryAddress">Temporary Address (if different) *</Label>
            <Textarea
              id="temporaryAddress"
              value={formData.temporaryAddress || ""}
              onChange={(e) => onInputChange("temporaryAddress", e.target.value)}
            />
            {invalidFields.includes("temporaryAddress") && <p className="text-sm text-red-600 mt-1">Temporary address is required</p>}
          </div>

          <div>
            <Label htmlFor="maritalStatus">Marital Status *</Label>
            <Select value={formData.maritalStatus || ""} onValueChange={(v) => onInputChange("maritalStatus", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("maritalStatus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cnic">CNIC *</Label>
            <Input
              id="cnic"
              value={formData.cnic || ""}
              onChange={(e) => onInputChange("cnic", e.target.value.replace(/[^0-9-]/g, ""))}
            />
            {invalidFields.includes("cnic") && <p className="text-sm text-red-600 mt-1">CNIC is required</p>}
          </div>

          <div>
            <Label htmlFor="cnicIssueDate">Issue Date of CNIC *</Label>
            <Input
              id="cnicIssueDate"
              type="date"
              value={formData.cnicIssueDate || ""}
              onChange={(e) => onInputChange("cnicIssueDate", e.target.value)}
            />
            {invalidFields.includes("cnicIssueDate") && <p className="text-sm text-red-600 mt-1">CNIC issue date is required</p>}
          </div>

          <div>
            <Label htmlFor="cnicExpiryDate">Expiry Date of CNIC *</Label>
            <Input
              id="cnicExpiryDate"
              type="date"
              value={formData.cnicExpiryDate || ""}
              onChange={(e) => onInputChange("cnicExpiryDate", e.target.value)}
            />
            {invalidFields.includes("cnicExpiryDate") && <p className="text-sm text-red-600 mt-1">CNIC expiry date is required</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="bFormNumber">B-Form / Birth Certificate Number *</Label>
            <Input
              id="bFormNumber"
              value={formData.bFormNumber || ""}
              onChange={(e) => onInputChange("bFormNumber", e.target.value.replace(/[^0-9-]/g, ""))}
            />
            {invalidFields.includes("bFormNumber") && <p className="text-sm text-red-600 mt-1">B-Form number is required</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
