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
    "education_level",
    "institution_name",
    "year_of_passing",
    "education_subjects",
    "education_grade",
    "additional_education_level",
    "additional_institution_name",
    "additional_year_of_passing",
    "additional_education_subjects",
    "additional_education_grade",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="education_level">Education level</Label>
            <Input id="education_level" value={formData.education_level || ""} onChange={(e) => onInputChange("education_level", e.target.value)} />
          </div>

          <div>
            <Label htmlFor="institution_name">Institution name</Label>
            <Input id="institution_name" value={formData.institution_name || ""} onChange={(e) => onInputChange("institution_name", e.target.value)} />
          </div>

          <div>
            <Label htmlFor="year_of_passing">Year of passing</Label>
            <Input id="year_of_passing" type="number" value={formData.year_of_passing || ""} onChange={(e) => onInputChange("year_of_passing", e.target.value)} />
          </div>

          <div>
            <Label htmlFor="education_subjects">Education subjects</Label>
            <Input id="education_subjects" value={formData.education_subjects || ""} onChange={(e) => onInputChange("education_subjects", e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="education_grade">Education grade</Label>
            <Input id="education_grade" value={formData.education_grade || ""} onChange={(e) => onInputChange("education_grade", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="additional_education_level">Additional education level</Label>
            <Input id="additional_education_level" value={formData.additional_education_level || ""} onChange={(e) => onInputChange("additional_education_level", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="additional_institution_name">Additional institution name</Label>
            <Input id="additional_institution_name" value={formData.additional_institution_name || ""} onChange={(e) => onInputChange("additional_institution_name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="additional_year_of_passing">Additional year of passing</Label>
            <Input id="additional_year_of_passing" type="number" value={formData.additional_year_of_passing || ""} onChange={(e) => onInputChange("additional_year_of_passing", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="additional_education_subjects">Additional education subjects</Label>
            <Input id="additional_education_subjects" value={formData.additional_education_subjects || ""} onChange={(e) => onInputChange("additional_education_subjects", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="additional_education_grade">Additional education grade</Label>
            <Input id="additional_education_grade" value={formData.additional_education_grade || ""} onChange={(e) => onInputChange("additional_education_grade", e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
