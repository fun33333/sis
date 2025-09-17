"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GeneralInfoStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function GeneralInfoStep({ formData, invalidFields, onInputChange }: GeneralInfoStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campusName">Campus Name *</Label>
            <Input
              id="campusName"
              value={formData.campusName || ""}
              onChange={(e) => onInputChange("campusName", e.target.value)}
              className={invalidFields.includes("campusName") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusName") && (
              <p className="text-sm text-red-600 mt-1">Campus name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusCode">Campus Code *</Label>
            <Input
              id="campusCode"
              value={formData.campusCode || ""}
              onChange={(e) => onInputChange("campusCode", e.target.value)}
              className={invalidFields.includes("campusCode") ? "border-red-500" : ""}
            />
            {invalidFields.includes("campusCode") && (
              <p className="text-sm text-red-600 mt-1">Campus code is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber || ""}
              onChange={(e) => onInputChange("registrationNumber", e.target.value)}
              className={invalidFields.includes("registrationNumber") ? "border-red-500" : ""}
            />
            {invalidFields.includes("registrationNumber") && (
              <p className="text-sm text-red-600 mt-1">Registration number is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status || ""} onValueChange={(v) => onInputChange("status", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("status") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="under-construction">Under Construction</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("status") && <p className="text-sm text-red-600 mt-1">Status is required</p>}
          </div>

          <div>
            <Label htmlFor="governingBody">Governing Body *</Label>
            <Input
              id="governingBody"
              value={formData.governingBody || ""}
              onChange={(e) => onInputChange("governingBody", e.target.value)}
              className={invalidFields.includes("governingBody") ? "border-red-500" : ""}
            />
            {invalidFields.includes("governingBody") && (
              <p className="text-sm text-red-600 mt-1">Governing body is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="gradesOffered">Grades Offered *</Label>
            <Select value={formData.gradesOffered || ""} onValueChange={(v) => onInputChange("gradesOffered", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("gradesOffered") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary (1-5)</SelectItem>
                <SelectItem value="elementary">Elementary (6-8)</SelectItem>
                <SelectItem value="secondary">Secondary (9-10)</SelectItem>
                <SelectItem value="higher-secondary">Higher Secondary (11-12)</SelectItem>
                <SelectItem value="all-levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("gradesOffered") && (
              <p className="text-sm text-red-600 mt-1">Grades offered is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="languagesOfInstruction">Languages of Instruction *</Label>
            <Select
              value={formData.languagesOfInstruction || ""}
              onValueChange={(v) => onInputChange("languagesOfInstruction", v)}
            >
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("languagesOfInstruction") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="urdu">Urdu</SelectItem>
                <SelectItem value="both">Both (English & Urdu)</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("languagesOfInstruction") && (
              <p className="text-sm text-red-600 mt-1">Languages of instruction is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="academicYearStart">Academic Year Start *</Label>
            <Select
              value={formData.academicYearStart || ""}
              onValueChange={(v) => onInputChange("academicYearStart", v)}
            >
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("academicYearStart") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select start month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month) => (
                  <SelectItem key={month.toLowerCase()} value={month.toLowerCase()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {invalidFields.includes("academicYearStart") && (
              <p className="text-sm text-red-600 mt-1">Academic year start is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="academicYearEnd">Academic Year End *</Label>
            <Select value={formData.academicYearEnd || ""} onValueChange={(v) => onInputChange("academicYearEnd", v)}>
              <SelectTrigger
                className={`border-2 focus:border-primary ${invalidFields.includes("academicYearEnd") ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select end month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month) => (
                  <SelectItem key={month.toLowerCase()} value={month.toLowerCase()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {invalidFields.includes("academicYearEnd") && (
              <p className="text-sm text-red-600 mt-1">Academic year end is required</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => onInputChange("description", e.target.value)}
            className={`min-h-[100px] ${invalidFields.includes("description") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("description") && (
            <p className="text-sm text-red-600 mt-1">Description is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Campus Address *</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={(e) => onInputChange("address", e.target.value)}
            className={invalidFields.includes("address") ? "border-red-500" : ""}
          />
          {invalidFields.includes("address") && <p className="text-sm text-red-600 mt-1">Address is required</p>}
        </div>
      </CardContent>
    </Card>
  )
}
