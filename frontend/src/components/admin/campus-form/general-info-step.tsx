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
              <option value="Both">Both</option>
            </select>
            {invalidFields.includes("languagesOfInstruction") && (
              <p className="text-sm text-red-600 mt-1">Language of instruction is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="gradesOffered">Grades Offered *</Label>
            <Input
              id="gradesOffered"
              placeholder="e.g. Grade 1 - Grade 12"
              value={formData.gradesOffered || ""}
              onChange={(e) => onInputChange("gradesOffered", e.target.value)}
              className={invalidFields.includes("gradesOffered") ? "border-red-500" : ""}
            />
            {invalidFields.includes("gradesOffered") && (
              <p className="text-sm text-red-600 mt-1">Grades offered is required</p>
            )}
          </div>

          <div>
            <Label>Academic Year Start Month *</Label>
            <select
              value={formData.academicYearStartMonth || ""}
              onChange={e => onInputChange("academicYearStartMonth", e.target.value)}
              className={`w-full border rounded px-3 py-2 ${invalidFields.includes('academicYearStartMonth') ? 'border-red-500' : ''}`}
            >
              <option value="">Month</option>
              {Array.from({length:12},(_,i)=>i+1).map(m=> (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {invalidFields.includes("academicYearStartMonth") && (
              <p className="text-sm text-red-600 mt-1">Start month required</p>
            )}
          </div>

          {/* Academic Year End removed per requirement */}

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
           {/* Newly added fields start here */}
           <div>
             <Label htmlFor="campusEstablishedYear">Campus Established Year *</Label>
             <Input
               id="campusEstablishedYear"
               type="number"
               value={formData.campusEstablishedYear || ""}
               onChange={e => onInputChange("campusEstablishedYear", e.target.value)}
               className={invalidFields.includes("campusEstablishedYear") ? "border-red-500" : ""}
             />
             {invalidFields.includes("campusEstablishedYear") && (
               <p className="text-sm text-red-600 mt-1">Established year is required</p>
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
               <option value="Both">Both</option>
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
             <Label htmlFor="currentGradeClass">Current Grade/Class *</Label>
             <Input
               id="currentGradeClass"
               value={formData.currentGradeClass || ""}
               onChange={e => onInputChange("currentGradeClass", e.target.value)}
               className={invalidFields.includes("currentGradeClass") ? "border-red-500" : ""}
               placeholder="e.g. Nursery, KG-1, Grade 10, Section A/B/C/D/Other"
             />
             {invalidFields.includes("currentGradeClass") && (
               <p className="text-sm text-red-600 mt-1">Current grade/class is required</p>
             )}
           </div>

           <div>
             <Label htmlFor="totalStudentCapacity">Total Student Capacity *</Label>
             <Input
               id="totalStudentCapacity"
               type="number"
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
               type="number"
               value={formData.currentStudentEnrollment || ""}
               onChange={e => onInputChange("currentStudentEnrollment", e.target.value)}
               className={invalidFields.includes("currentStudentEnrollment") ? "border-red-500" : ""}
             />
             {invalidFields.includes("currentStudentEnrollment") && (
               <p className="text-sm text-red-600 mt-1">Current student enrollment is required</p>
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

           <div>
             <Label htmlFor="totalStaffMembers">Total Staff Members *</Label>
             <Input
               id="totalStaffMembers"
               type="number"
               value={formData.totalStaffMembers || ""}
               onChange={e => onInputChange("totalStaffMembers", e.target.value)}
               className={invalidFields.includes("totalStaffMembers") ? "border-red-500" : ""}
             />
             {invalidFields.includes("totalStaffMembers") && (
               <p className="text-sm text-red-600 mt-1">Total staff members is required</p>
             )}
           </div>

           <div>
             <Label htmlFor="totalTeachers">Total Teachers *</Label>
             <Input
               id="totalTeachers"
               type="number"
               value={formData.totalTeachers || ""}
               onChange={e => onInputChange("totalTeachers", e.target.value)}
               className={invalidFields.includes("totalTeachers") ? "border-red-500" : ""}
             />
             {invalidFields.includes("totalTeachers") && (
               <p className="text-sm text-red-600 mt-1">Total teachers is required</p>
             )}
           </div>

           <div>
             <Label htmlFor="totalCoordinators">Total Coordinators *</Label>
             <Input
               id="totalCoordinators"
               type="number"
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
               type="number"
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
               type="number"
               value={formData.totalGuards || ""}
               onChange={e => onInputChange("totalGuards", e.target.value)}
               className={invalidFields.includes("totalGuards") ? "border-red-500" : ""}
             />
             {invalidFields.includes("totalGuards") && (
               <p className="text-sm text-red-600 mt-1">Total guards is required</p>
             )}
           </div>
           {/* Newly added fields end here */}
        </div>
      </CardContent>
    </Card>
  )
}
