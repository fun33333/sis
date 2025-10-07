"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Layers, Plus, Users, BookOpen, Eye } from "lucide-react"
import { getCurrentUserRole } from "@/lib/permissions"
import Link from "next/link"
import { createLevel, getLevelChoices } from "@/lib/api"

export default function AddLevelPage() {
  useEffect(() => {
    document.title = "Add Level | IAK SMS";
  }, []);

  const [userRole, setUserRole] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    campus: "",
    coordinator: "none"
  })
  const [loading, setLoading] = useState(false)
  const [choices, setChoices] = useState({
    campuses: [],
    coordinators: []
  })

  useEffect(() => {
    setUserRole(getCurrentUserRole())
    
    // Load choices for dropdowns
    const loadChoices = async () => {
      try {
        const data = await getLevelChoices()
        setChoices(data as any)
      } catch (error) {
        console.error('Failed to load choices:', error)
      }
    }
    loadChoices()
  }, [])

  const loadLevels = async () => {
    // This function will be called from parent component or context
    // For now, we'll just log that levels should be refreshed
    console.log('Levels should be refreshed')
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
    
    // Form validation
    if (!formData.name.trim()) {
      alert('Error: Level name is required')
      setLoading(false)
      return
    }
    
    if (!formData.campus) {
      alert('Error: Campus is required')
      setLoading(false)
      return
    }
    
    try {
      const levelData = {
        name: formData.name,
        short_code: formData.short_code || null,
        campus: parseInt(formData.campus),
        coordinator: formData.coordinator && formData.coordinator !== 'none' ? parseInt(formData.coordinator) : null
      }
      
      console.log('Sending level data:', levelData)
      console.log('Form data:', formData)
      
      await createLevel(levelData)
      alert("Level added successfully!")
      
      // Reset form
      setFormData({
        name: "",
        short_code: "",
        campus: "",
        coordinator: "none"
      })
      
      // Refresh the lists
      loadLevels()
    } catch (error: any) {
      console.error('Failed to create level:', error)
      
      // Better error handling
      let errorMessage = 'Failed to create level. Please try again.'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        console.log('Error data:', errorData)
        
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
      
      // Show user-friendly message
      if (errorMessage.includes('already exists')) {
        alert(`Error: A level with this name already exists. Please choose a different name.`)
      } else {
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Add Level</h1>
          <p className="text-gray-600">Create a new educational level for your campus</p>
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
            <Layers className="h-5 w-5 mr-2" />
            Level Information
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new educational level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="name">Level Name *</Label>
                 <Input
                   id="name"
                   placeholder="e.g., Pre-Primary, Primary, Secondary"
                   value={formData.name}
                   onChange={(e) => handleInputChange("name", e.target.value)}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="short_code">Short Code</Label>
                 <Input
                   id="short_code"
                   placeholder="e.g., PP, PRI, SEC"
                   value={formData.short_code}
                   onChange={(e) => handleInputChange("short_code", e.target.value)}
                 />
               </div>

              <div className="space-y-2">
                <Label htmlFor="short_code">Short Code</Label>
                <Input
                  id="short_code"
                  placeholder="e.g., PP, P, S"
                  value={formData.short_code}
                  onChange={(e) => handleInputChange("short_code", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campus">Campus *</Label>
                 <Select value={formData.campus} onValueChange={(value) => handleInputChange("campus", value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Campus" />
                   </SelectTrigger>
                   <SelectContent>
                     {choices.campuses.map((campus: any) => (
                       <SelectItem key={campus.id} value={campus.id.toString()}>
                         {campus.campus_name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinator">Level Coordinator</Label>
                 <Select value={formData.coordinator} onValueChange={(value) => handleInputChange("coordinator", value)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select Coordinator (Optional)" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="none">No Coordinator</SelectItem>
                     {choices.coordinators.map((coord: any) => (
                       <SelectItem key={coord.id} value={coord.id.toString()}>
                         {coord.full_name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

            </div>

            {/* Level Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card className="p-4" style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Grades</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Manage grades for this level</p>
              </Card>

              <Card className="p-4" style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Classes</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Create classes within this level</p>
              </Card>

              <Card className="p-4" style={{ backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}>
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Structure</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Define level hierarchy</p>
              </Card>
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
                 {loading ? 'Saving...' : 'Save Level'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
