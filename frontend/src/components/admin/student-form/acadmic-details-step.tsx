"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentFormValidator } from "@/lib/student-validation"
import { getAllCampuses, apiGet, API_ENDPOINTS, getStoredUserProfile } from "@/lib/api"
import { getCurrentUser, getCurrentUserRole } from "@/lib/permissions"

interface AcademicDetailsStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function AcademicDetailsStep({ formData, invalidFields, onInputChange }: AcademicDetailsStepProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [campuses, setCampuses] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Determine principal campus from localStorage/user
  const principalCampusId = undefined

  useEffect(() => {
    loadCampuses()
  }, [])

  // Clear selected grade when shift changes
  useEffect(() => {
    if (formData.shift && formData.campus) {
      loadGrades(formData.campus, formData.shift)
      // Clear selected grade when shift changes
      if (formData.currentGrade) {
        onInputChange("currentGrade", "")
      }
    }
  }, [formData.shift])

  const loadCampuses = async () => {
    try {
      setLoading(true)
      const user = getCurrentUser()
      const userRole = getCurrentUserRole()
      
      // Show all campuses for everyone
      const allCampuses = await getAllCampuses()
      setCampuses(allCampuses)
      // Optionally preload all grades (no campus filter)
      if (!formData.campus) {
        await loadGrades("")
      }
    } catch (error) {
      console.error('Error loading campuses:', error)
      setCampuses([])
    } finally {
      setLoading(false)
    }
  }

  const loadGrades = async (campusId: string, shift?: string) => {
    try {
      let endpoint = campusId ? `${API_ENDPOINTS.GRADES}?campus_id=${campusId}` : `${API_ENDPOINTS.GRADES}`
      if (shift) {
        endpoint += campusId ? `&shift=${shift}` : `?shift=${shift}`
      }
      const data = await apiGet(endpoint)
      const list = Array.isArray(data) ? data : (Array.isArray((data as any)?.results) ? (data as any).results : [])
      setGrades(list)
    } catch (e) {
      console.error('Failed to load grades:', e)
      setGrades([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    onInputChange(field, value)
    
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Reload grades when shift changes
    if (field === 'shift' && formData.campus) {
      loadGrades(formData.campus, value)
    }
    
    // Real-time validation - only validate on blur, not on every keystroke
    // This prevents premature validation errors
  }

  const handleBlur = (field: string, value: string) => {
    // Validation only triggers on blur
    let validation: any = { isValid: true }
    
    switch (field) {
      case 'admissionYear':
        validation = StudentFormValidator.validateYear(value, "Admission Year")
        break
      case 'fromYear':
        if (value) {
          validation = StudentFormValidator.validateYear(value, "From Year")
        }
        break
      case 'toYear':
        if (value) {
          validation = StudentFormValidator.validateYear(value, "To Year")
        }
        break
    }
    
    if (!validation.isValid) {
      setFieldErrors(prev => ({ ...prev, [field]: validation.message }))
    } else {
      // Clear error if validation passes
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const getFieldError = (field: string) => {
    return fieldErrors[field] || (invalidFields.includes(field) ? `${field} is required` : '')
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Academic Details</CardTitle>
        <CardDescription>📝 Classroom and teacher will be automatically assigned based on campus, grade, section, and shift</CardDescription>
        <p className="text-sm text-gray-600">Fields marked with * are required</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campus">Select Campus *</Label>
            <Select value={formData.campus || ""} onValueChange={(v) => { onInputChange("campus", v); loadGrades(v, formData.shift) }}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("campus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder={loading ? "Loading campuses..." : "Select campus"} />
              </SelectTrigger>
              <SelectContent>
                {(campuses || []).map((campus) => (
                  <SelectItem key={campus.id} value={campus.id.toString()}>
                    {campus.campus_name || campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("campus") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("campus")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shift">Shift *</Label>
            <Select value={formData.shift || ""} onValueChange={(v) => onInputChange("shift", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("shift") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError("shift") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("shift")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currentGrade">Current Grade/Class *</Label>
            <Select value={formData.currentGrade || ""} onValueChange={(v) => onInputChange("currentGrade", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("currentGrade") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select grade/class" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g.id} value={g.name}>
                    {g.name} • {g.level_shift ? g.level_shift.charAt(0).toUpperCase() + g.level_shift.slice(1) : 'N/A'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("currentGrade") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("currentGrade")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="section">Section *</Label>
            <Select value={formData.section || ""} onValueChange={(v) => onInputChange("section", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("section") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError("section") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("section")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="admissionYear">Enrollment Year *</Label>
            <Input
              id="admissionYear"
              type="number"
              min="2000"
              max="2030"
              value={formData.admissionYear || ""}
              onChange={(e) => handleInputChange("admissionYear", e.target.value)}
              onBlur={(e) => handleBlur("admissionYear", e.target.value)}
              className={getFieldError("admissionYear") ? "border-red-500" : ""}
              placeholder="e.g., 2025"
            />
            {getFieldError("admissionYear") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("admissionYear")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastClassPassed">Last Class Passed *</Label>
            <Select value={formData.lastClassPassed || ""} onValueChange={(v) => onInputChange("lastClassPassed", v)}>
              <SelectTrigger className={`border-2 focus:border-primary ${invalidFields.includes("lastClassPassed") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select last class passed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KG-I">KG-I</SelectItem>
                <SelectItem value="KG-II">KG-II</SelectItem>
                <SelectItem value="Grade-I">Grade-I</SelectItem>
                <SelectItem value="Grade-II">Grade-II</SelectItem>
                <SelectItem value="Grade-III">Grade-III</SelectItem>
                <SelectItem value="Grade-IV">Grade-IV</SelectItem>
                <SelectItem value="Grade-V">Grade-V</SelectItem>
                <SelectItem value="Grade-VI">Grade-VI</SelectItem>
                <SelectItem value="Grade-VII">Grade-VII</SelectItem>
                <SelectItem value="Grade-VIII">Grade-VIII</SelectItem>
                <SelectItem value="Grade-IX">Grade-IX</SelectItem>
                <SelectItem value="Grade-X">Grade-X</SelectItem>
                <SelectItem value="Special Class">Special Class</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError("lastClassPassed") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("lastClassPassed")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastSchoolName">Last School Name</Label>
            <Input
              id="lastSchoolName"
              value={formData.lastSchoolName || ""}
              onChange={(e) => handleInputChange("lastSchoolName", e.target.value)}
              placeholder="Enter previous school name"
            />
          </div>

          <div>
            <Label htmlFor="lastClassResult">Last Class Result</Label>
            <Input
              id="lastClassResult"
              value={formData.lastClassResult || ""}
              onChange={(e) => handleInputChange("lastClassResult", e.target.value)}
              placeholder="Enter result/grade obtained"
            />
          </div>

          <div>
            <Label htmlFor="fromYear">From Year</Label>
            <Input
              id="fromYear"
              type="number"
              min="2000"
              max="2030"
              value={formData.fromYear || ""}
              onChange={(e) => handleInputChange("fromYear", e.target.value)}
              onBlur={(e) => handleBlur("fromYear", e.target.value)}
              className={getFieldError("fromYear") ? "border-red-500" : ""}
              placeholder="e.g., 2020"
            />
            {getFieldError("fromYear") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("fromYear")}</p>
            )}
          </div>

          <div>
            <Label htmlFor="toYear">To Year</Label>
            <Input
              id="toYear"
              type="number"
              min="2000"
              max="2030"
              value={formData.toYear || ""}
              onChange={(e) => handleInputChange("toYear", e.target.value)}
              onBlur={(e) => handleBlur("toYear", e.target.value)}
              className={getFieldError("toYear") ? "border-red-500" : ""}
              placeholder="e.g., 2024"
            />
            {getFieldError("toYear") && (
              <p className="text-sm text-red-600 mt-1">{getFieldError("toYear")}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}