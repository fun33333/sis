"use client"

import { useCallback, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
        {/* Campus photo upload - nicer drag/drop UI */}
        <div className="md:col-span-2">
          <Label htmlFor="campusPhoto">Campus Photo *</Label>

          {/* hidden file input for accessibility */}
          <input
            id="campusPhoto"
            name="campusPhoto"
            type="file"
            accept="image/*"
            className="hidden"
            aria-hidden
            onChange={() => { }}
          />

          {/* Styled drop area */}
          <UploadArea
            existing={formData.campusPhoto}
            onFile={(dataUrl: string | null) => onInputChange("campusPhoto", dataUrl || "")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campusName">Campus Name *</Label>
            <select
              id="campusName"
              value={formData.campusName || ""}
              onChange={e => onInputChange("campusName", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('campusName') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Campus</option>
              <option value="campus 1">Campus 1</option>
              <option value="campus 2">Campus 2</option>
              <option value="campus 3">Campus 3</option>
              <option value="campus 4">Campus 4</option>
              <option value="campus 5">Campus 5</option>
              <option value="campus 6">Campus 6</option>
              <option value="campus 8">Campus 8</option>
            </select>
            {invalidFields.includes("campusName") && (
              <p className="text-sm text-red-600 mt-1">Campus name is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusCode">Campus Code *</Label>
            <Input
              id="campusCode"
              value={formData.campusCode || ""}
              onChange={e => onInputChange("campusCode", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="governingBody">Governing Body *</Label>
            <Input
              id="governingBody"
              value={formData.governingBody || ""}
              onChange={e => onInputChange("governingBody", e.target.value)}
            />
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
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => onInputChange("address", e.target.value)}
              className={invalidFields.includes("address") ? "border-red-500" : ""}
            />
            {invalidFields.includes("address") && (
              <p className="text-sm text-red-600 mt-1">Address is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city || ""}
              onChange={(e) => onInputChange("city", e.target.value)}
              className={invalidFields.includes("city") ? "border-red-500" : ""}
            />
            {invalidFields.includes("city") && (
              <p className="text-sm text-red-600 mt-1">City is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="district">District *</Label>
            <select
              id="district"
              value={formData.district || ""}
              onChange={e => onInputChange("district", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('district') ? 'border-red-500' : ''}`}
            >
              <option value="">Select District</option>
              <option value="Karachi Central">Karachi Central</option>
              <option value="Karachi East">Karachi East</option>
              <option value="Karachi South">Karachi South</option>
              <option value="Karachi West">Karachi West</option>
              <option value="Korangi">Korangi</option>
              <option value="Malir">Malir</option>
              <option value="Keamari">Keamari</option>
            </select>
            {invalidFields.includes("district") && (
              <p className="text-sm text-red-600 mt-1">District is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode || ""}
              onChange={(e) => onInputChange("postalCode", e.target.value)}
              className={invalidFields.includes("postalCode") ? "border-red-500" : ""}
            />
            {invalidFields.includes("postalCode") && (
              <p className="text-sm text-red-600 mt-1">Postal code is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusEstablishedYear">Campus Established Date *</Label>
            <input
              id="campusEstablishedYear"
              type="date"
              value={formData.campusEstablishedYear || ""}
              onChange={e => onInputChange("campusEstablishedYear", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes("campusEstablishedYear") ? "border-red-500" : ""
                }`}
            />
            {invalidFields.includes("campusEstablishedYear") && (
              <p className="text-sm text-red-600 mt-1">Established date is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="campusStatus">Campus Status *</Label>
            <select
              id="campusStatus"
              value={formData.campusStatus || ""}
              onChange={e => onInputChange("campusStatus", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('campusStatus') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Closed">Closed</option>
              <option value="Under Construction">Under Construction</option>
            </select>
            {invalidFields.includes("campusStatus") && (
              <p className="text-sm text-red-600 mt-1">Campus status is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="gradesOffered">Grades Offered *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 w-full">
              {[
                "Nursery",
                "KG 1",
                "KG 2",
                "1 Class",
                "2 Class",
                "3 Class",
                "4 Class",
                "5 Class",
                "6 Class",
                "7 Class",
                "8 Class",
                "9 Class",
                "10 Class",
                "Special Class",
              ].map((grade) => (
                <label key={grade} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={grade}
                    checked={formData.gradesOffered?.includes(grade) || false}
                    onChange={(e) => {
                      const currentGrades = Array.isArray(formData.gradesOffered) ? formData.gradesOffered : [];
                      let updatedGrades;
                      if (e.target.checked) {
                        updatedGrades = [...currentGrades, grade];
                      } else {
                        updatedGrades = currentGrades.filter((g: string) => g !== grade);
                      }
                      onInputChange("gradesOffered", updatedGrades.join(","));
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{grade}</span>
                </label>
              ))}
            </div>
            {invalidFields.includes("gradesOffered") && (
              <p className="text-sm text-red-600 mt-1">Grades offered is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="languagesOfInstruction">Language of Instruction *</Label>
            <select
              id="languagesOfInstruction"
              value={formData.languagesOfInstruction || ""}
              onChange={e => onInputChange("languagesOfInstruction", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('languagesOfInstruction') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Urdu">Urdu</option>
              <option value="Both">English and Urdu Both</option>
            </select>
            {invalidFields.includes("languagesOfInstruction") && (
              <p className="text-sm text-red-600 mt-1">Language of instruction is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="specialClasses">Special Classes (e.g. Montessori, Prep)</Label>
            <Input
              id="specialClasses"
              type="text"
              value={formData.specialClasses || ""}
              onChange={e => onInputChange("specialClasses", e.target.value)}
              placeholder="Montessori, Prep Section, etc"
            />
          </div>

          <div>
            <Label>Academic Year Start Date *</Label>
            <input
              type="date"
              value={formData.academicYearStartMonth || ""}
              onChange={e => onInputChange("academicYearStartMonth", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes("academicYearStartMonth") ? "border-red-500" : ""
                }`}
            />
            {invalidFields.includes("academicYearStartMonth") && (
              <p className="text-sm text-red-600 mt-1">Start date required</p>
            )}
          </div>

          <div>
            <Label>Academic Year End Date *</Label>
            <input
              type="date"
              value={formData.academicYearEndMonth || ""}
              onChange={e => onInputChange("academicYearEndMonth", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes("academicYearEndMonth") ? "border-red-500" : ""
                }`}
            />
            {invalidFields.includes("academicYearEndMonth") && (
              <p className="text-sm text-red-600 mt-1">End date required</p>
            )}
          </div>

          <div>
            <Label htmlFor="shiftAvailable">Shift Available *</Label>
            <select
              id="shiftAvailable"
              value={formData.shiftAvailable || ""}
              onChange={e => onInputChange("shiftAvailable", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('shiftAvailable') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Shift</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Both">Morning and Afternoon both</option>
            </select>
            {invalidFields.includes("shiftAvailable") && (
              <p className="text-sm text-red-600 mt-1">Shift is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="educationLevelAvailable">Education Level Available *</Label>
            <select
              id="educationLevelAvailable"
              value={formData.educationLevelAvailable || ""}
              onChange={e => onInputChange("educationLevelAvailable", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('educationLevelAvailable') ? 'border-red-500' : ''}`}
            >
              <option value="">Select Level</option>
              <option value="Pre-Primary">Pre-Primary</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="All">All</option>
            </select>
            {invalidFields.includes("educationLevelAvailable") && (
              <p className="text-sm text-red-600 mt-1">Education level is required</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="maleStudents">Total Male Students</Label>
            <Input
              id="maleStudents"
              type="text"
              value={formData.maleStudents || ""}
              onChange={e => onInputChange("maleStudents", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="femaleStudents">Total Female Students</Label>
            <Input
              id="femaleStudents"
              type="text"
              value={formData.femaleStudents || ""}
              onChange={e => onInputChange("femaleStudents", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="totalStudentCapacity">Total Student Capacity *</Label>
            <Input
              id="totalStudentCapacity"
              type="text"
              value={formData.totalStudentCapacity || ""}
              onChange={e => onInputChange("totalStudentCapacity", e.target.value)}
              className={invalidFields.includes("totalStudentCapacity") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalStudentCapacity") && (
              <p className="text-sm text-red-600 mt-1">Total student capacity is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="currentStudentEnrollment">Current Student Enrollment *</Label>
            <Input
              id="currentStudentEnrollment"
              type="text"
              value={formData.currentStudentEnrollment || ""}
              onChange={e => onInputChange("currentStudentEnrollment", e.target.value)}
              className={invalidFields.includes("currentStudentEnrollment") ? "border-red-500" : ""}
            />
            {invalidFields.includes("currentStudentEnrollment") && (
              <p className="text-sm text-red-600 mt-1">Current student enrollment is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalStaffMembers">Total Staff Members *</Label>
            <Input
              id="totalStaffMembers"
              type="text"
              value={formData.totalStaffMembers || ""}
              onChange={e => onInputChange("totalStaffMembers", e.target.value)}
              className={invalidFields.includes("totalStaffMembers") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalStaffMembers") && (
              <p className="text-sm text-red-600 mt-1">Total staff members is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="maleTeachers">Total Male Teachers</Label>
            <Input
              id="maleTeachers"
              type="number"
              value={formData.maleTeachers || ""}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange("maleTeachers", value);

                // Auto update total teachers
                const total =
                  (parseInt(value || "0") || 0) +
                  (parseInt(formData.femaleTeachers || "0") || 0);
                onInputChange("totalTeachers", total.toString());
              }}
            />
          </div>

          <div>
            <Label htmlFor="femaleTeachers">Total Female Teachers</Label>
            <Input
              id="femaleTeachers"
              type="number"
              value={formData.femaleTeachers || ""}
              onChange={(e) => {
                const value = e.target.value;
                onInputChange("femaleTeachers", value);

                // Auto update total teachers
                const total =
                  (parseInt(formData.maleTeachers || "0") || 0) +
                  (parseInt(value || "0") || 0);
                onInputChange("totalTeachers", total.toString());
              }}
            />
          </div>

          <div>
            <Label htmlFor="totalTeachers">Total Teachers *</Label>
            <Input
              id="totalTeachers"
              type="number"
              value={formData.totalTeachers || ""}
              readOnly
              className={
                invalidFields.includes("totalTeachers") ? "border-red-500" : ""
              }
            />
            {invalidFields.includes("totalTeachers") && (
              <p className="text-sm text-red-600 mt-1">Total teachers is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalCoordinators">Total Coordinators *</Label>
            <Input
              id="totalCoordinators"
              type="text"
              value={formData.totalCoordinators || ""}
              onChange={e => onInputChange("totalCoordinators", e.target.value)}
              className={invalidFields.includes("totalCoordinators") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalCoordinators") && (
              <p className="text-sm text-red-600 mt-1">Total coordinators is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalMaids">Total Maids *</Label>
            <Input
              id="totalMaids"
              type="text"
              value={formData.totalMaids || ""}
              onChange={e => onInputChange("totalMaids", e.target.value)}
              className={invalidFields.includes("totalMaids") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalMaids") && (
              <p className="text-sm text-red-600 mt-1">Total maids is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalGuards">Total Guards *</Label>
            <Input
              id="totalGuards"
              type="text"
              value={formData.totalGuards || ""}
              onChange={e => onInputChange("totalGuards", e.target.value)}
              className={invalidFields.includes("totalGuards") ? "border-red-500" : ""}
            />
            {invalidFields.includes("totalGuards") && (
              <p className="text-sm text-red-600 mt-1">Total guards is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="totalNonTeachingStaff">Total Non-Teaching Staff</Label>
            <Input
              id="totalNonTeachingStaff"
              type="number"
              value={formData.totalNonTeachingStaff || ""}
              onChange={e => onInputChange("totalNonTeachingStaff", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Small local UploadArea component to keep this file self-contained
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