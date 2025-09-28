"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface EducationStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function EducationStep({ formData, invalidFields, onInputChange }: EducationStepProps) {
  const { toast } = useToast()

  const stepFields = [
    "education",
    "instituteName",
    "educationQualification",
    "fieldSpecialization",
    "passingYear",
    "passingYearGrade",
  ]
  function isEmptyValue(val: any) {
    return val === undefined || val === null || String(val).trim() === ""
  }

  useEffect(() => {
    // compute fields that are either flagged invalid by parent OR empty in the formData
    const missing: string[] = []
    for (const f of stepFields) {
      if (invalidFields.includes(f)) {
        missing.push(f)
        continue
      }
      const val = (formData as any)[f]
      if (isEmptyValue(val)) missing.push(f)
    }

    if (missing.length > 0) {
      toast({
        title: "Please fill required fields",
        description: `Please complete the required education fields: ${missing.length} missing.`,
        variant: "destructive",
      })
    }
  }, [
    formData?.education,
    formData?.instituteName,
    formData?.educationQualification,
    formData?.fieldSpecialization,
    formData?.passingYear,
    formData?.passingYearGrade,
    invalidFields.join("|"),
  ])

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Educational Qualifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keep only the requested fields and remove others */}
        <div>
          <Label htmlFor="education">Education Details *</Label>
          <Textarea
            id="education"
            placeholder="Detail some (e.g., degree, board, remarks)"
            value={formData.education || ""}
            onChange={(e) => onInputChange("education", e.target.value)}
            className={`min-h-[120px] ${invalidFields.includes("education") ? "border-red-500" : ""}`}
          />
          {invalidFields.includes("education") && (
            <p className="text-sm text-red-600 mt-1">This field is required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instituteName">Institute Name *</Label>
            <Input
              id="instituteName"
              value={formData.instituteName || ""}
              onChange={(e) => onInputChange("instituteName", e.target.value)}
              className={invalidFields.includes("instituteName") ? "border-red-500" : ""}
            />
            {invalidFields.includes("instituteName") && (
              <p className="text-sm text-red-600 mt-1">Institute name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="educationQualification">Education Qualification *</Label>
            <Select value={formData.educationQualification || ""} onValueChange={(v) => onInputChange("educationQualification", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("educationQualification") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="higher-secondary">Higher Secondary</SelectItem>
                <SelectItem value="graduation-or-higher">Graduation or higher</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("educationQualification") && (
              <p className="text-sm text-red-600 mt-1">Qualification is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="fieldSpecialization">Field Specialization *</Label>
            <Input
              id="fieldSpecialization"
              value={formData.fieldSpecialization || ""}
              onChange={(e) => onInputChange("fieldSpecialization", e.target.value)}
              className={invalidFields.includes("fieldSpecialization") ? "border-red-500" : ""}
            />
            {invalidFields.includes("fieldSpecialization") && (
              <p className="text-sm text-red-600 mt-1">Specialization is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="passingYear">Passing Year *</Label>
            <Input
              id="passingYear"
              type="number"
              value={formData.passingYear || ""}
              onChange={(e) => onInputChange("passingYear", e.target.value)}
              min={1900}
              max={2100}
              className={invalidFields.includes("passingYear") ? "border-red-500" : ""}
            />
            {invalidFields.includes("passingYear") && (
              <p className="text-sm text-red-600 mt-1">Passing year is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="passingYearGrade">Passing Year Grade *</Label>
            <Input
              id="passingYearGrade"
              value={formData.passingYearGrade || ""}
              onChange={(e) => onInputChange("passingYearGrade", e.target.value)}
              className={invalidFields.includes("passingYearGrade") ? "border-red-500" : ""}
            />
            {invalidFields.includes("passingYearGrade") && (
              <p className="text-sm text-red-600 mt-1">Grade is required</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
