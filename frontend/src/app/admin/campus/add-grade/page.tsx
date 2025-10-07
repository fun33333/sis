"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, BookOpen, Plus, Users, Eye } from "lucide-react"
import { getCurrentUserRole } from "@/lib/permissions"
import Link from "next/link"
import { createGrade, getGradeChoices } from "@/lib/api"

export default function AddGradePage() {
  useEffect(() => {
    document.title = "Add Grade | IAK SMS";
  }, []);

  const [userRole, setUserRole] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    level: ""
  })
  const [loading, setLoading] = useState(false)
  const [choices, setChoices] = useState({
    levels: []
  })

  useEffect(() => {
    setUserRole(getCurrentUserRole())
    
    // Load choices for dropdowns
    const loadChoices = async () => {
      try {
        const data = await getGradeChoices()
        setChoices(data as any)
      } catch (error) {
        console.error('Failed to load choices:', error)
      }
    }
    loadChoices()
  }, [])

  const loadGrades = async () => {
    // This function will be called from parent component or context
    // For now, we'll just log that grades should be refreshed
    console.log('Grades should be refreshed')
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
      const gradeData = {
        name: formData.name,
        short_code: formData.short_code || null,
        level: parseInt(formData.level)
      }
      
      await createGrade(gradeData)
      alert("Grade added successfully!")
      
      // Reset form
      setFormData({
        name: "",
        short_code: "",
        level: ""
      })
      
      // Refresh the lists
      loadGrades()
    } catch (error: any) {
      console.error('Failed to create grade:', error)
      
      // Better error handling
      let errorMessage = 'Failed to create grade. Please try again.'
      
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
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Add Grade</h1>
          <p className="text-gray-600">Create a new grade for your campus</p>
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
            <BookOpen className="h-5 w-5 mr-2" />
            Grade Information
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new grade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="name">Grade Name *</Label>
                 <Input
                   id="name"
                   placeholder="e.g., Grade 1, Grade 2, Pre-Primary"
                   value={formData.name}
                   onChange={(e) => handleInputChange("name", e.target.value)}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="short_code">Grade Code</Label>
                 <Input
                   id="short_code"
                   placeholder="e.g., G1, G2, PP"
                   value={formData.short_code}
                   onChange={(e) => handleInputChange("short_code", e.target.value)}
                 />
               </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                 <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Level" />
                   </SelectTrigger>
                   <SelectContent>
                     {choices.levels.map((level: any) => (
                       <SelectItem key={level.id} value={level.id.toString()}>
                         {level.name}
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
                 {loading ? 'Saving...' : 'Save Grade'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
