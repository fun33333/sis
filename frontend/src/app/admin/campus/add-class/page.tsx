"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, GraduationCap, Users, Plus, Eye } from "lucide-react"
import { getCurrentUserRole } from "@/lib/permissions"
import Link from "next/link"
import { createClassroom, getClassroomChoices, getClassroomSections } from "@/lib/api"

export default function AddClassPage() {
  useEffect(() => {
    document.title = "Add Class | IAK SMS";
  }, []);

  const [userRole, setUserRole] = useState<string>("")
  const [formData, setFormData] = useState({
    grade: "",
    section: "",
    capacity: "",
    class_teacher: "none"
  })
  const [loading, setLoading] = useState(false)
  const [choices, setChoices] = useState({
    grades: [],
    teachers: [],
    sections: []
  })

  useEffect(() => {
    setUserRole(getCurrentUserRole())
    
    // Load choices for dropdowns
    const loadChoices = async () => {
      try {
        const [gradeData, sectionData] = await Promise.all([
          getClassroomChoices(),
          getClassroomSections()
        ])
        setChoices({
          grades: (gradeData as any).grades || [],
          teachers: (gradeData as any).teachers || [],
          sections: (sectionData as any) || []
        })
      } catch (error) {
        console.error('Failed to load choices:', error)
      }
    }
    loadChoices()
  }, [])

  const loadClassrooms = async () => {
    // This function will be called from parent component or context
    // For now, we'll just log that classrooms should be refreshed
    console.log('Classrooms should be refreshed')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const classroomData = {
        grade: parseInt(formData.grade),
        section: formData.section,
        capacity: parseInt(formData.capacity),
        class_teacher: formData.class_teacher && formData.class_teacher !== "none" ? parseInt(formData.class_teacher) : null
      }
      
      await createClassroom(classroomData)
      alert("Class added successfully!")
      
      // Reset form
      setFormData({
        grade: "",
        section: "",
        capacity: "",
        class_teacher: "none"
      })
      
      // Refresh the lists
      loadClassrooms()
    } catch (error: any) {
      console.error('Failed to create class:', error)
      
      // Better error handling
      let errorMessage = 'Failed to create class. Please try again.'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0]
        } else {
          // Handle field-specific errors
          const fieldErrors = Object.keys(errorData).map(field => 
            `${field}: ${Array.isArray(errorData[field]) ? errorData[field].join(', ') : errorData[field]}`
          ).join('; ')
          errorMessage = fieldErrors || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Add Class</h1>
          <p className="text-gray-600">Create a new class for your campus</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/campus/preview">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview All
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" style={{ color: '#6096ba' }} />
            <span className="text-sm text-gray-500">Campus Management</span>
          </div>
        </div>
      </div>

      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: '#274c77' }}>
            <GraduationCap className="h-5 w-5 mr-2" />
            Class Information
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="grade">Grade *</Label>
                 <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Grade" />
                   </SelectTrigger>
                   <SelectContent>
                     {choices.grades.map((grade: any) => (
                       <SelectItem key={grade.id} value={grade.id.toString()}>
                         {grade.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                 <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Section" />
                   </SelectTrigger>
                   <SelectContent>
                     {choices.sections.map((section: any) => (
                       <SelectItem key={section.value} value={section.value}>
                         {section.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Class Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  required
                />
              </div>

               <div className="space-y-2">
                 <Label htmlFor="class_teacher">Class Teacher</Label>
                 <Select value={formData.class_teacher} onValueChange={(value) => handleInputChange("class_teacher", value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Teacher (Optional)" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="none">No Teacher</SelectItem>
                     {choices.teachers.map((teacher: any) => (
                       <SelectItem key={teacher.id} value={teacher.id.toString()}>
                         {teacher.full_name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                 style={{ backgroundColor: '#274c77', color: 'white' }}
                 disabled={loading}
              >
                 {loading ? 'Saving...' : 'Save Class'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
