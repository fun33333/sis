"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react"
import { getLevels, getGrades, getClassrooms } from "@/lib/api"
import { toast as sonnerToast } from "sonner"

interface CurrentRoleStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
}


export function CurrentRoleStep({ formData, invalidFields, onInputChange }: CurrentRoleStepProps) {
  const [levels, setLevels] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [loadingLevels, setLoadingLevels] = useState(false)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingClassrooms, setLoadingClassrooms] = useState(false)

  // Fetch levels for the selected campus
  useEffect(() => {
    if (formData.current_campus) {
      setLoadingLevels(true)
      getLevels(formData.current_campus)
        .then((data: any) => {
          const levelsList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          setLevels(levelsList)
        })
        .catch(err => console.error('Error fetching levels:', err))
        .finally(() => setLoadingLevels(false))
    }
  }, [formData.current_campus])

  // When shift changes, clear level/grade/section if incompatible
  useEffect(() => {
    if (!formData.class_teacher_level) return
    const selected = levels.find((l) => String(l.id) === String(formData.class_teacher_level))
    if (!selected) return
    const selectedShift = (selected.shift || '').toString()
    const currentShift = (formData.shift || '').toString()
    const isCompatible = currentShift === 'both' ? (selectedShift === 'morning' || selectedShift === 'afternoon') : selectedShift === currentShift
    if (!isCompatible) {
      onInputChange("class_teacher_level", "")
      onInputChange("class_teacher_grade", "")
      onInputChange("class_teacher_section", "")
      onInputChange("assigned_classroom", "")
    }
  }, [formData.shift, levels])

  // Filter levels based on selected shift
  const filteredLevels = useMemo(() => {
    const shift = (formData.shift || '').toString()
    if (!shift) return levels
    if (shift === 'both') {
      return levels.filter((l) => (l.shift === 'morning' || l.shift === 'afternoon'))
    }
    return levels.filter((l) => l.shift === shift)
  }, [levels, formData.shift])

  // Fetch grades when level is selected
  useEffect(() => {
    if (formData.class_teacher_level) {
      setLoadingGrades(true)
      getGrades(formData.class_teacher_level)
        .then((data: any) => {
          const gradesList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          setGrades(gradesList)
        })
        .catch(err => console.error('Error fetching grades:', err))
        .finally(() => setLoadingGrades(false))
    }
  }, [formData.class_teacher_level])

  // Fetch classrooms when grade is selected
  useEffect(() => {
    if (formData.class_teacher_grade) {
      setLoadingClassrooms(true)
      getClassrooms(formData.class_teacher_grade)
        .then((data: any) => {
          const classroomsList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
          setClassrooms(classroomsList)
        })
        .catch(err => console.error('Error fetching classrooms:', err))
        .finally(() => setLoadingClassrooms(false))
    }
  }, [formData.class_teacher_grade])

  // Auto-assign classroom when level, grade, and section are selected
  useEffect(() => {
    if (formData.class_teacher_level && formData.class_teacher_grade && formData.class_teacher_section && classrooms.length > 0) {
      const matchingClassroom = classrooms.find(classroom => {
        const gradeMatch = classroom.grade === parseInt(formData.class_teacher_grade) || classroom.grade === formData.class_teacher_grade
        const sectionMatch = classroom.section === formData.class_teacher_section
        return gradeMatch && sectionMatch
      })
      
      if (matchingClassroom && formData.assigned_classroom !== matchingClassroom.id) {
        // Prevent assigning if already occupied
        if (matchingClassroom.class_teacher) {
          sonnerToast.error("Classroom already assigned", {
            description: "This classroom is already assigned to another class teacher. Please choose a different section.",
          })
          return
        }
        // Use setTimeout to ensure the state update happens
        setTimeout(() => {
          onInputChange("assigned_classroom", matchingClassroom.id)
        }, 100)
      }
    }
  }, [formData.class_teacher_level, formData.class_teacher_grade, formData.class_teacher_section, classrooms.length])

  // Minimal debug only on errors (none by default)

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Current Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
            <Label htmlFor="current_role_title">Current Role(Optional)</Label>
            <Input 
              id="current_subjects" 
              value={formData.current_role_title || ""} 
              onChange={(e) => onInputChange("current_role_title", e.target.value)}
              placeholder="e.g., Teacher, Subject-teacher"
            />
          </div>
          <div>
            <Label htmlFor="current_campus">Current Campus *</Label>
            <Select value={formData.current_campus || ""} onValueChange={(v) => onInputChange("current_campus", v)}>
              <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("current_campus") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Campus 6</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("current_campus") && <p className="text-sm text-red-600 mt-1">Current campus is required</p>}
            <p className="text-xs text-gray-500 mt-1">Teachers can only be added to your assigned campus</p>
          </div>
          
          <div>
            <Label htmlFor="joining_date">Joining Date *</Label>
            <Input 
              id="joining_date" 
              type="date" 
              value={formData.joining_date || ""} 
              onChange={(e) => onInputChange("joining_date", e.target.value)}
              className={invalidFields.includes("joining_date") ? "border-red-500" : ""}
              max={new Date().toISOString().split('T')[0]}
            />
            {invalidFields.includes("joining_date") && <p className="text-sm text-red-600 mt-1">Joining date is required</p>}
          </div>
          
          <div>
            <Label htmlFor="shift">Shift *</Label>
            <Select value={formData.shift || ""} onValueChange={(v) => onInputChange("shift", v)}>
              <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("shift") ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            {invalidFields.includes("shift") && <p className="text-sm text-red-600 mt-1">Shift is required</p>}
          </div>
          
          <div>
            <Label htmlFor="is_currently_active">Is Currently Active</Label>
            <Select value={String(Boolean(formData.is_currently_active))} onValueChange={(v) => onInputChange("is_currently_active", v === "true") }>
              <SelectTrigger className="mt-2 border-2 focus:border-primary">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="current_subjects">Current Subjects (Optional)</Label>
            <Input 
              id="current_subjects" 
              value={formData.current_subjects || ""} 
              onChange={(e) => onInputChange("current_subjects", e.target.value)}
              placeholder="e.g., Mathematics, Physics, Chemistry"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="current_classes_taught">Current Classes Taught (Optional)</Label>
            <Input 
              id="current_classes_taught" 
              value={formData.current_classes_taught || ""} 
              onChange={(e) => onInputChange("current_classes_taught", e.target.value)}
              placeholder="e.g., Grade 6-8, Grade 9-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="current_extra_responsibilities">Current Extra Responsibilities (Optional)</Label>
            <Input 
              id="current_extra_responsibilities" 
              value={formData.current_extra_responsibilities || ""} 
              onChange={(e) => onInputChange("current_extra_responsibilities", e.target.value)}
              placeholder="e.g., Sports Coordinator, Library In-charge"
            />
          </div>
          <div>
            <Label htmlFor="is_class_teacher">Is Class Teacher</Label>
            <Select 
              value={String(Boolean(formData.is_class_teacher))} 
              onValueChange={(v) => onInputChange("is_class_teacher", v === "true")}
            >
              <SelectTrigger className="mt-2 border-2 focus:border-primary">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Current value: {String(Boolean(formData.is_class_teacher))}</p>
          </div>
          
          {formData.is_class_teacher && (
            <>
              <div>
                <Label htmlFor="class_teacher_level">Class Teacher Level *</Label>
                <Select 
                  value={formData.class_teacher_level || ""} 
                  onValueChange={(v) => {
                    onInputChange("class_teacher_level", v)
                    // Reset grade and section when level changes
                    onInputChange("class_teacher_grade", "")
                    onInputChange("class_teacher_section", "")
                    onInputChange("assigned_classroom", "")
                  }}
                >
                  <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("class_teacher_level") ? "border-red-500" : ""}`}>
                    <SelectValue placeholder={loadingLevels ? "Loading levels..." : "Select level"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name} - {level.shift_display || level.shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {invalidFields.includes("class_teacher_level") && <p className="text-sm text-red-600 mt-1">Class teacher level is required</p>}
              </div>
              
              <div>
                <Label htmlFor="class_teacher_grade">Class Teacher Grade *</Label>
                <Select 
                  value={formData.class_teacher_grade || ""} 
                  onValueChange={(v) => {
                    onInputChange("class_teacher_grade", v)
                    // Reset section when grade changes
                    onInputChange("class_teacher_section", "")
                    onInputChange("assigned_classroom", "")
                  }}
                  disabled={!formData.class_teacher_level || loadingGrades}
                >
                  <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("class_teacher_grade") ? "border-red-500" : ""}`}>
                    <SelectValue placeholder={loadingGrades ? "Loading grades..." : "Select grade"} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id.toString()}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {invalidFields.includes("class_teacher_grade") && <p className="text-sm text-red-600 mt-1">Class teacher grade is required</p>}
              </div>
              
              {formData.shift === 'both' ? (
                <div>
                  <Label htmlFor="assigned_classrooms">Class Teacher Classrooms *</Label>
                  <Select 
                    value="" 
                    onValueChange={(v) => {
                      const classroomId = parseInt(v)
                      const currentClassrooms = formData.assigned_classrooms || []
                      if (!currentClassrooms.includes(classroomId)) {
                        onInputChange("assigned_classrooms", [...currentClassrooms, classroomId])
                      }
                    }}
                    disabled={!formData.class_teacher_grade || loadingClassrooms}
                  >
                    <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("assigned_classrooms") ? "border-red-500" : ""}`}>
                      <SelectValue placeholder={loadingClassrooms ? "Loading classrooms..." : "Add classroom"}>
                        Add classroom
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id.toString()}>
                          {classroom.section} ({classroom.shift})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.assigned_classrooms && formData.assigned_classrooms.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.assigned_classrooms.map((classroomId: number) => {
                        const classroom = classrooms.find(c => c.id === classroomId)
                        return classroom ? (
                          <div key={classroomId} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <span className="text-sm">{classroom.section} ({classroom.shift})</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.assigned_classrooms.filter((id: number) => id !== classroomId)
                                onInputChange("assigned_classrooms", updated)
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                  {invalidFields.includes("assigned_classrooms") && <p className="text-sm text-red-600 mt-1">At least one classroom is required for both shifts</p>}
                </div>
              ) : (
                <div>
                  <Label htmlFor="class_teacher_section">Class Teacher Section *</Label>
                  <Select 
                    value={formData.class_teacher_section || ""} 
                    onValueChange={(v) => {
                      onInputChange("class_teacher_section", v)
                      // Auto-assign classroom will be handled by useEffect
                    }}
                    disabled={!formData.class_teacher_grade || loadingClassrooms}
                  >
                    <SelectTrigger className={`mt-2 border-2 focus:border-primary ${invalidFields.includes("class_teacher_section") ? "border-red-500" : ""}`}>
                      <SelectValue placeholder={loadingClassrooms ? "Loading sections..." : "Select section"}>
                        {formData.class_teacher_section || "Select section"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.section}>
                          {classroom.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {invalidFields.includes("class_teacher_section") && <p className="text-sm text-red-600 mt-1">Class teacher section is required</p>}
                </div>
              )}
            </>
          )}
          
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentRoleStep
