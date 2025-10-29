"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FacilitiesStepProps {
  formData: any
  invalidFields: string[]
  onInputChange: (field: string, value: any) => void
}

export function FacilitiesStep({ formData, invalidFields, onInputChange }: FacilitiesStepProps) {
  
  // Auto-calculate total rooms
  useEffect(() => {
    const total = (parseInt(formData.total_classrooms) || 0) + 
                  (parseInt(formData.total_offices) || 0) + 
                  (parseInt(formData.num_computer_labs) || 0) + 
                  (parseInt(formData.num_science_labs) || 0) +
                  (parseInt(formData.num_biology_labs) || 0) +
                  (parseInt(formData.num_chemistry_labs) || 0) +
                  (parseInt(formData.num_physics_labs) || 0)
    onInputChange("total_rooms", total.toString())
  }, [
    formData.total_classrooms, 
    formData.total_offices, 
    formData.num_computer_labs, 
    formData.num_science_labs,
    formData.num_biology_labs,
    formData.num_chemistry_labs,
    formData.num_physics_labs
  ])

  // Auto-calculate total washrooms
  useEffect(() => {
    const staffTotal = (parseInt(formData.male_teachers_washrooms) || 0) + (parseInt(formData.female_teachers_washrooms) || 0)
    const studentTotal = (parseInt(formData.male_student_washrooms) || 0) + (parseInt(formData.female_student_washrooms) || 0)
    const totalCarl = staffTotal + studentTotal
    
    onInputChange("staff_washrooms", staffTotal.toString())
    onInputChange("student_washrooms", studentTotal.toString())
    onInputChange("total_washrooms", totalCarl.toString())
  }, [
    formData.male_teachers_washrooms, formData.female_teachers_washrooms,
    formData.male_student_washrooms, formData.female_student_washrooms
  ])

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Facilities & Infrastructure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rooms Section */}
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold text-lg mb-4">Rooms in Campus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_classrooms">Total Classrooms *</Label>
              <Input id="total_classrooms" type="number" value={formData.total_classrooms || ""} onChange={e => onInputChange("total_classrooms", e.target.value)} placeholder="e.g. 20" />
            </div>
            
            <div>
              <Label htmlFor="total_offices">Total Office Rooms *</Label>
              <Input id="total_offices" type="number" value={formData.total_offices || ""} onChange={e => onInputChange("total_offices", e.target.value)} placeholder="e.g. 5" />
            </div>
            
            <div>
              <Label htmlFor="num_biology_labs">Biology Lab</Label>
              <Input id="num_biology_labs" type="number" value={formData.num_biology_labs || ""} onChange={e => onInputChange("num_biology_labs", e.target.value)} placeholder="e.g. 1" />
            </div>
            
            <div>
              <Label htmlFor="num_chemistry_labs">Chemistry Lab</Label>
              <Input id="num_chemistry_labs" type="number" value={formData.num_chemistry_labs || ""} onChange={e => onInputChange("num_chemistry_labs", e.target.value)} placeholder="e.g. 1" />
            </div>
            
            <div>
              <Label htmlFor="num_computer_labs">Computer Lab</Label>
              <Input id="num_computer_labs" type="number" value={formData.num_computer_labs || ""} onChange={e => onInputChange("num_computer_labs", e.target.value)} placeholder="e.g. 2" />
            </div>
            
            <div>
              <Label htmlFor="num_physics_labs">Physics Lab</Label>
              <Input id="num_physics_labs" type="number" value={formData.num_physics_labs || ""} onChange={e => onInputChange("num_physics_labs", e.target.value)} placeholder="e.g. 1" />
            </div>
            
            <div className="md:col-span-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <Label htmlFor="total_rooms">Total Rooms (Auto-calculated)</Label>
              <Input id="total_rooms" type="number" value={formData.total_rooms || ""} readOnly className="bg-green-100 font-bold text-lg" />
            </div>
          </div>
        </div>

        {/* Washrooms Section */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Washrooms</h3>
          <div className="space-y-4">
            {/* Staff Washrooms */}
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-[#6096BA] mb-3">Staff Washrooms</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="male_teachers_washrooms">Male Teachers Toilets</Label>
                  <Input id="male_teachers_washrooms" type="number" value={formData.male_teachers_washrooms || ""} onChange={e => onInputChange("male_teachers_washrooms", e.target.value)} placeholder="e.g. 3" />
                </div>
                <div>
                  <Label htmlFor="female_teachers_washrooms">Female Teachers Toilets</Label>
                  <Input id="female_teachers_washrooms" type="number" value={formData.female_teachers_washrooms || ""} onChange={e => onInputChange("female_teachers_washrooms", e.target.value)} placeholder="e.g. 3" />
                </div>
                <div>
                  <Label htmlFor="staff_washrooms">Total Staff Washrooms (Auto)</Label>
                  <Input id="staff_washrooms" type="number" value={formData.staff_washrooms || ""} readOnly className="bg-gray-100 font-semibold" />
                </div>
              </div>
            </div>

            {/* Student Washrooms */}
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium text-[#6096BA] mb-3">Student Washrooms</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="male_student_washrooms">Male Student Toilets</Label>
                  <Input id="male_student_washrooms" type="number" value={formData.male_student_washrooms || ""} onChange={e => onInputChange("male_student_washrooms", e.target.value)} placeholder="e.g. 10" />
                </div>
                <div>
                  <Label htmlFor="female_student_washrooms">Female Student Toilets</Label>
                  <Input id="female_student_washrooms" type="number" value={formData.female_student_washrooms || ""} onChange={e => onInputChange("female_student_washrooms", e.target.value)} placeholder="e.g. 10" />
                </div>
                <div>
                  <Label htmlFor="student_washrooms">Total Student Washrooms (Auto)</Label>
                  <Input id="student_washrooms" type="number" value={formData.student_washrooms || ""} readOnly className="bg-gray-100 font-semibold" />
                </div>
              </div>
            </div>

            {/* Total Washrooms */}
            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <Label htmlFor="total_washrooms">Total Washrooms in Campus (Auto-calculated)</Label>
              <Input id="total_washrooms" type="number" value={formData.total_washrooms || ""} readOnly className="bg-green-100 font-bold text-lg" />
            </div>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="power_backup">Power Backup *</Label>
            <select id="power_backup" value={formData.power_backup || ""} onChange={e => onInputChange("power_backup", e.target.value)} className={`w-full border rounded px-3 py-2 ${invalidFields.includes('power_backup') ? 'border-red-500' : ''}`}>
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            {invalidFields.includes("power_backup") && <p className="text-sm text-red-600 mt-1">This field is required</p>}
          </div>

          <div>
            <Label htmlFor="internet_available">Internet Availability *</Label>
            <select id="internet_available" value={formData.internet_available || ""} onChange={e => onInputChange("internet_available", e.target.value)} className={`w-full border rounded px-3 py-2 ${invalidFields.includes('internet_available') ? 'border-red-500' : ''}`}>
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            {invalidFields.includes("internet_available") && <p className="text-sm text-red-600 mt-1">This field is required</p>}
          </div>

          <div>
            <Label htmlFor="sports_available">Sports Available</Label>
            <Textarea id="sports_available" value={formData.sports_available || ""} onChange={e => onInputChange("sports_available", e.target.value)} placeholder="e.g. Cricket, Football, Basketball" className="min-h-[60px]" />
          </div>

          <div>
            <Label htmlFor="canteen_facility">Canteen Available *</Label>
            <select id="canteen_facility" value={formData.canteen_facility || ""} onChange={e => onInputChange("canteen_facility", e.target.value)} className={`w-full border rounded px-3 py-2 ${invalidFields.includes('canteen_facility') ? 'border-red-500' : ''}`}>
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            {invalidFields.includes("canteen_facility") && <p className="text-sm text-red-600 mt-1">This field is required</p>}
          </div>

          <div>
            <Label htmlFor="teacher_transport">Teacher Transport</Label>
            <select id="teacher_transport" value={formData.teacher_transport || ""} onChange={e => onInputChange("teacher_transport", e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <Label htmlFor="meal_program">Meal Program</Label>
            <select id="meal_program" value={formData.meal_program || ""} onChange={e => onInputChange("meal_program", e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <Label htmlFor="library_available">Library Available *</Label>
            <select id="library_available" value={formData.library_available || ""} onChange={e => onInputChange("library_available", e.target.value)} className={`w-full border rounded px-3 py-2 ${invalidFields.includes('library_available') ? 'border-red-500' : ''}`}>
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            {invalidFields.includes("library_available") && <p className="text-sm text-red-600 mt-1">This field is required</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
