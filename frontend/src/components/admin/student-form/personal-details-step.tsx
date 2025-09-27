"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface PersonalDetailsStepProps {
  formData: any
  uploadedImages: { [key: string]: string }
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>, imageKey: string) => void
  onRemoveImage: (imageKey: string) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export function PersonalDetailsStep({
  formData,
  uploadedImages,
  invalidFields,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  fileInputRef,
}: PersonalDetailsStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student Photo Upload */}
        <div>
          <Label>Student Photo *</Label>
          <div className="mt-2">
            {uploadedImages.studentPhoto ? (
              <div className="relative inline-block">
                <img
                  src={uploadedImages.studentPhoto || "/placeholder.svg"}
                  alt="Student"
                  className="w-32 h-32 object-cover rounded-lg border-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => onRemoveImage("studentPhoto")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors ${
                  invalidFields.includes("studentPhoto") ? "border-red-500" : "border-gray-300"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload student photo</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(e, "studentPhoto")}
            />
          </div>
          {invalidFields.includes("studentPhoto") && (
            <p className="text-sm text-red-600 mt-1">Student photo is required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <Label htmlFor="name">Student Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => onInputChange("name", e.target.value)}
              className={invalidFields.includes("name") ? "border-red-500" : ""}
            />
            {invalidFields.includes("name") && <p className="text-sm text-red-600 mt-1">Name is required</p>}
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender || ""} onValueChange={(v) => onInputChange("gender", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("gender") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("gender") && <p className="text-sm text-red-600 mt-1">Gender is required</p>}
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth</Label>
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
            <Label htmlFor="placeOfBirth">Place of Birth</Label>
            <Input
              id="placeOfBirth"
              value={formData.placeOfBirth || ""}
              onChange={(e) => onInputChange("placeOfBirth", e.target.value)}
              className={invalidFields.includes("placeOfBirth") ? "border-red-500" : ""}
            />
            {invalidFields.includes("placeOfBirth") && (
              <p className="text-sm text-red-600 mt-1">Place of birth is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="religion">Religion</Label>
            <Select value={formData.religion || ""} onValueChange={(v) => onInputChange("religion", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("religion") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="islam">Islam</SelectItem>
                <SelectItem value="hinduism">Hinduism</SelectItem>
                <SelectItem value="christianity">Christianity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("religion") && <p className="text-sm text-red-600 mt-1">Religion is required</p>}
          </div>

          <div>
            <Label htmlFor="motherTongue">Mother Tongue</Label>
            <Select value={formData.motherTongue || ""} onValueChange={(v) => onInputChange("motherTongue", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("motherTongue") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select mother tongue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brohi">Brohi</SelectItem>
                <SelectItem value="urdu">Urdu</SelectItem>
                <SelectItem value="sindhi">Sindhi</SelectItem>
                <SelectItem value="balochi">Balochi</SelectItem>
                <SelectItem value="saraiki">Saraiki</SelectItem>
                <SelectItem value="punjabi">Punjabi</SelectItem>
                <SelectItem value="pashhto">Pashhto</SelectItem>
                <SelectItem value="kashmiri">Kashmiri</SelectItem>
                <SelectItem value="bangali">Bangali</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("motherTongue") && (
              <p className="text-sm text-red-600 mt-1">Mother tongue is required</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
