"use client"

import { useCallback, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface GeneralInfoStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: string) => void
}

export function GeneralInfoStep({ formData, invalidFields, onInputChange }: GeneralInfoStepProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Campus Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campus photo upload */}
        <div className="md:col-span-2">
          <Label htmlFor="photo">Campus Photo</Label>
          <UploadArea
            existing={formData.photo}
            onFile={(dataUrl: string | null) => onInputChange("photo", dataUrl || "")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Campus Name *</Label>
            <select
              id="name"
              value={formData.name || ""}
              onChange={e => onInputChange("name", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('name') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Campus</option>
              <option value="Campus 1">Campus 1</option>
              <option value="Campus 2">Campus 2</option>
              <option value="Campus 3">Campus 3</option>
              <option value="Campus 4">Campus 4</option>
              <option value="Campus 5">Campus 5</option>
              <option value="Campus 6">Campus 6</option>
              <option value="Campus 7">Campus 7</option>
              <option value="Campus 8">Campus 8</option>
            </select>
            {invalidFields.includes("name") && (
              <p className="text-sm text-red-600 mt-1">Campus name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="code">Campus Code</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={e => onInputChange("code", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status || ""}
              onChange={e => onInputChange("status", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('status') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="not_active">Not Active</option>
              <option value="underconstruction">Under Construction</option>
            </select>
            {invalidFields.includes("status") && (
              <p className="text-sm text-red-600 mt-1">Status is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="governing_body">Governing Body</Label>
            <Input
              id="governing_body"
              value={formData.governing_body || ""}
              onChange={e => onInputChange("governing_body", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="registration_no">Registration No</Label>
            <Input
              id="registration_no"
              value={formData.registration_no || ""}
              onChange={e => onInputChange("registration_no", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={e => onInputChange("address", e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="grades_offered">Grades Offered</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 w-full">
              {(() => {
                const selectedGradesList = Array.isArray(formData.grades_offered)
                  ? (formData.grades_offered as string[])
                  : (typeof formData.grades_offered === 'string' && formData.grades_offered.trim().length > 0
                      ? String(formData.grades_offered)
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : ([] as string[]))

                const toggle = (grade: string, checked: boolean) => {
                  const currentGrades = selectedGradesList
                  const updatedGrades = checked
                    ? Array.from(new Set([...currentGrades, grade]))
                    : currentGrades.filter((g) => g !== grade)
                  onInputChange("grades_offered", updatedGrades.join(","))
                }

                return (
                  <>
                    {/* Read-only summary field showing selected grades */}
                    <Input
                      id="grades_offered_display"
                      value={(selectedGradesList || []).join(", ")}
                      readOnly
                      placeholder="Selected grades will appear here"
                      className="mb-2 col-span-2 md:col-span-4"
                    />
                    {[
                      "Nursery",
                      "KG 1", 
                      "KG 2",
                      "Class 1",
                      "Class 2",
                      "Class 3",
                      "Class 4",
                      "Class 5",
                      "Class 6",
                      "Class 7",
                      "Class 8",
                      "Class 9",
                      "Class 10 (Matric)",
                      "Special Class",
                    ].map((grade) => (
                      <label key={grade} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={grade}
                          checked={selectedGradesList.includes(grade)}
                          onChange={(e) => toggle(grade, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{grade}</span>
                      </label>
                    ))}
                  </>
                )
              })()}
            </div>
          </div>

          <div>
            <Label htmlFor="languages_of_instruction">Languages of Instruction</Label>
            <select
              id="languages_of_instruction"
              value={formData.languages_of_instruction || ""}
              onChange={e => onInputChange("languages_of_instruction", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Language</option>
              <option value="urdu">Urdu</option>
              <option value="english">English</option>
              <option value="english_and_urdu">English and Urdu</option>
            </select>
          </div>

          <div>
            <Label htmlFor="academic_year_start_month">Academic Year Start Month</Label>
            <select
              id="academic_year_start_month"
              value={formData.academic_year_start_month || ""}
              onChange={e => onInputChange("academic_year_start_month", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          <div>
            <Label htmlFor="academic_year_end_month">Academic Year End Month</Label>
            <select
              id="academic_year_end_month"
              value={formData.academic_year_end_month || ""}
              onChange={e => onInputChange("academic_year_end_month", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          <div>
            <Label htmlFor="capacity">Maximum Student Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity || ""}
              onChange={e => onInputChange("capacity", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="avg_class_size">Average Class Size</Label>
            <Input
              id="avg_class_size"
              type="number"
              value={formData.avg_class_size || ""}
              onChange={e => onInputChange("avg_class_size", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_students">Total Students</Label>
            <Input
              id="num_students"
              type="number"
              value={formData.num_students || ""}
              onChange={e => onInputChange("num_students", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_students_male">Number of Male Students</Label>
            <Input
              id="num_students_male"
              type="number"
              value={formData.num_students_male || ""}
              onChange={e => onInputChange("num_students_male", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_students_female">Number of Female Students</Label>
            <Input
              id="num_students_female"
              type="number"
              value={formData.num_students_female || ""}
              onChange={e => onInputChange("num_students_female", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_teachers">Total Teachers</Label>
            <Input
              id="num_teachers"
              type="number"
              value={formData.num_teachers || ""}
              onChange={e => onInputChange("num_teachers", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_teachers_male">Number of Male Teachers</Label>
            <Input
              id="num_teachers_male"
              type="number"
              value={formData.num_teachers_male || ""}
              onChange={e => onInputChange("num_teachers_male", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_teachers_female">Number of Female Teachers</Label>
            <Input
              id="num_teachers_female"
              type="number"
              value={formData.num_teachers_female || ""}
              onChange={e => onInputChange("num_teachers_female", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="total_classrooms">Total Classrooms</Label>
            <Input
              id="total_classrooms"
              type="number"
              value={formData.total_classrooms || ""}
              onChange={e => onInputChange("total_classrooms", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="office_rooms">Number of Office Rooms</Label>
            <Input
              id="office_rooms"
              type="number"
              value={formData.office_rooms || ""}
              onChange={e => onInputChange("office_rooms", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="num_rooms">Total Rooms</Label>
            <Input
              id="num_rooms"
              type="number"
              value={formData.num_rooms || ""}
              onChange={e => onInputChange("num_rooms", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="facilities">Facilities</Label>
            <Textarea
              id="facilities"
              value={formData.facilities || ""}
              onChange={e => onInputChange("facilities", e.target.value)}
              placeholder="List campus facilities..."
              className="min-h-[60px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Upload Area Component
function UploadArea({ existing, onFile }: { existing?: string | null, onFile: (dataUrl: string | null) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return onFile(null)
    const reader = new FileReader()
    reader.onload = () => onFile(String(reader.result || null))
    reader.readAsDataURL(file)
  }, [onFile])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onFile(String(reader.result || null))
    reader.readAsDataURL(file)
  }, [onFile])

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />

      <div
        onClick={openFilePicker}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFilePicker() }}
        className={`w-full rounded-md border-2 border-dashed p-6 text-center cursor-pointer ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white'}`}
      >
        {existing ? (
          <div className="flex items-center justify-center gap-4">
            <img src={existing} alt="preview" className="h-28 w-auto rounded-md border" />
            <div className="text-left">
              <p className="font-medium">Change campus photo</p>
              <p className="text-sm text-muted-foreground">Click or drop a file to replace the image</p>
            </div>
          </div>
        ) : (
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V8a2 2 0 012-2h6a2 2 0 012 2v8m-6-4l-3 3m6-3l3 3" />
            </svg>
            <p className="mt-2 font-medium">Upload campus photo</p>
            <p className="mt-1 text-sm text-gray-500">PNG, JPG or GIF. Click to choose or drag and drop here.</p>
          </div>
        )}
      </div>

      {existing && (
        <div className="mt-2 flex gap-2">
          <button type="button" className="px-3 py-1 rounded bg-red-50 text-red-700 border" onClick={() => onFile(null)}>Remove</button>
        </div>
      )}
    </div>
  )
}