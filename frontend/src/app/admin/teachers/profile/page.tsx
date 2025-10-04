"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Edit, 
  User, 
  Clock,
  Award,
  Building,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  Save,
  X
} from "lucide-react"
import { getAllTeachers, getAllCampuses, apiPatch } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function TeacherProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get('teacherId')
  
  const [teacher, setTeacher] = useState<any>(null)
  const [campus, setCampus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [campuses, setCampuses] = useState<any[]>([])

  useEffect(() => {
    document.title = "Teacher Profile | IAK SMS";
  }, []);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!teacherId) {
        setError("No teacher ID provided")
        setLoading(false)
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const [teachersData, campusesData] = await Promise.all([
          getAllTeachers(),
          getAllCampuses()
        ])
        
        // Find the specific teacher
        const foundTeacher = Array.isArray(teachersData) 
          ? teachersData.find((t: any) => t.id.toString() === teacherId.toString())
          : null

        if (!foundTeacher) {
          setError("Teacher not found")
          setLoading(false)
          return
        }

        // Find the campus
        let foundCampus = null
        if (foundTeacher.current_campus) {
          if (typeof foundTeacher.current_campus === 'object') {
            foundCampus = foundTeacher.current_campus
          } else {
            foundCampus = Array.isArray(campusesData) 
              ? campusesData.find((c: any) => c.id === foundTeacher.current_campus)
              : null
          }
        }

        setTeacher(foundTeacher)
        setCampus(foundCampus)
        
        // Set campuses for edit form
        let actualCampusData = campusesData
        if (campusesData && typeof campusesData === 'object' && 'results' in campusesData && Array.isArray((campusesData as any).results)) {
          actualCampusData = (campusesData as any).results
        } else if (Array.isArray(campusesData)) {
          actualCampusData = campusesData
        }
        setCampuses(Array.isArray(actualCampusData) ? actualCampusData : [])
      } catch (err: any) {
        console.error("Error fetching teacher data:", err)
        setError(err.message || "Failed to load teacher data")
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [teacherId])

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Not provided') return 'Not provided'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const openEditForm = () => {
    if (teacher) {
      setEditFormData({
        full_name: teacher.full_name || '',
        email: teacher.email || '',
        contact_number: teacher.contact_number || '',
        permanent_address: teacher.permanent_address || '',
        gender: teacher.gender || '',
        dob: teacher.dob ? teacher.dob.split('T')[0] : '',
        marital_status: teacher.marital_status || '',
        cnic: teacher.cnic || '',
        blood_group: teacher.blood_group || '',
        religion: teacher.religion || '',
        nationality: teacher.nationality || '',
        education_level: teacher.education_level || '',
        year_of_passing: teacher.year_of_passing || '',
        institution_name: teacher.institution_name || '',
        degree_diploma: teacher.degree_diploma || '',
        total_experience_years: teacher.total_experience_years || '',
        current_subjects: teacher.current_subjects || '',
        current_classes_taught: teacher.current_classes_taught || '',
        current_campus: teacher.current_campus ? 
          (typeof teacher.current_campus === 'object' ? teacher.current_campus.id : teacher.current_campus) : '',
        emergency_contact: teacher.emergency_contact || '',
        is_currently_active: teacher.is_currently_active || false
      })
      setIsEditOpen(true)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!teacher) return

    setIsSaving(true)
    try {
      const updateData = {
        full_name: editFormData.full_name,
        email: editFormData.email,
        contact_number: editFormData.contact_number,
        permanent_address: editFormData.permanent_address,
        gender: editFormData.gender,
        dob: editFormData.dob,
        marital_status: editFormData.marital_status,
        cnic: editFormData.cnic,
        blood_group: editFormData.blood_group,
        religion: editFormData.religion,
        nationality: editFormData.nationality,
        education_level: editFormData.education_level,
        year_of_passing: editFormData.year_of_passing ? parseInt(editFormData.year_of_passing) : null,
        institution_name: editFormData.institution_name,
        degree_diploma: editFormData.degree_diploma,
        total_experience_years: editFormData.total_experience_years ? parseFloat(editFormData.total_experience_years) : null,
        current_subjects: editFormData.current_subjects,
        current_classes_taught: editFormData.current_classes_taught,
        current_campus: editFormData.current_campus ? parseInt(editFormData.current_campus) : null,
        emergency_contact: editFormData.emergency_contact,
        is_currently_active: editFormData.is_currently_active
      }

      await apiPatch(`/api/teachers/${teacher.id}/`, updateData)
      
      // Update local state
      setTeacher((prev: any) => ({
        ...prev,
        ...updateData
      }))
      
      toast.success("Teacher updated successfully!")
      setIsEditOpen(false)
    } catch (err: any) {
      console.error("Error updating teacher:", err)
      toast.error(err.message || "Failed to update teacher")
    } finally {
      setIsSaving(false)
    }
  }

  const renderValue = (value: any, fallback: string = 'Not provided') => {
    if (value === null || value === undefined || value === '') return fallback
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : fallback
    if (typeof value === 'object') return JSON.stringify(value)
    return value.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || "Teacher not found"}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
              </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Profile</h1>
                <p className="text-gray-600 mt-1">Detailed information about {teacher.full_name || 'Unknown Teacher'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={openEditForm}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
        </div>
      </div>
                    </div>
                  </div>

      <div className="p-6 space-y-6">
        {/* Teacher Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 bg-white/20 text-white font-bold rounded-full flex items-center justify-center text-2xl">
                  {getInitials(teacher.full_name || 'Unknown')}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{teacher.full_name || 'Unknown Teacher'}</h2>
                  <p className="text-blue-100 text-lg mb-4">{teacher.education_level || 'Not specified'}</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      <span>{campus?.campus_name || campus?.name || 'Unknown Campus'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{teacher.current_subjects || 'Not Assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <span>{teacher.current_classes_taught || 'Not Assigned'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={teacher.is_currently_active ? "default" : "secondary"}
                    className={`px-4 py-2 text-sm ${
                      teacher.is_currently_active 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {teacher.is_currently_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <p className="text-blue-100 text-sm mt-2">
                    Employee ID: {teacher.employee_code || 'Not assigned'}
                  </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{renderValue(teacher.full_name)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900">{renderValue(teacher.gender)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(teacher.dob)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Marital Status</label>
                <p className="text-gray-900">{renderValue(teacher.marital_status)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CNIC</label>
                <p className="text-gray-900">{renderValue(teacher.cnic)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{renderValue(teacher.email)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{renderValue(teacher.contact_number)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{renderValue(teacher.permanent_address)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Professional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <label className="text-sm font-medium text-gray-500">Employee Code</label>
                <p className="text-gray-900 font-mono">{renderValue(teacher.employee_code)}</p>
                </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teacher ID</label>
                <p className="text-gray-900 font-mono">{renderValue(teacher.teacher_id)}</p>
                </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Experience</label>
                <p className="text-gray-900">{renderValue(teacher.total_experience_years)} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role Start Date</label>
                <p className="text-gray-900">{formatDate(teacher.role_start_date)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Education & Experience Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education */}
          <Card>
                  <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education Details
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
                            <div>
                <label className="text-sm font-medium text-gray-500">Education Level</label>
                <p className="text-gray-900">{renderValue(teacher.education_level)}</p>
                            </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Year of Passing</label>
                <p className="text-gray-900">{renderValue(teacher.year_of_passing)}</p>
                    </div>
                            <div>
                <label className="text-sm font-medium text-gray-500">Institution</label>
                <p className="text-gray-900">{renderValue(teacher.institution_name)}</p>
                    </div>
                            <div>
                <label className="text-sm font-medium text-gray-500">Degree/Diploma</label>
                <p className="text-gray-900">{renderValue(teacher.degree_diploma)}</p>
                    </div>
              </CardContent>
            </Card>

          {/* Current Assignment */}
          <Card>
                  <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Current Assignment
                    </CardTitle>
                  </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Subjects</label>
                <p className="text-gray-900">{renderValue(teacher.current_subjects)}</p>
              </div>
                            <div>
                <label className="text-sm font-medium text-gray-500">Classes</label>
                <p className="text-gray-900">{renderValue(teacher.current_classes_taught)}</p>
                  </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Campus</label>
                <p className="text-gray-900">{campus?.campus_name || campus?.name || 'Unknown Campus'}</p>
                  </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2">
                  {teacher.is_currently_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={teacher.is_currently_active ? 'text-green-600' : 'text-red-600'}>
                    {teacher.is_currently_active ? 'Currently Active' : 'Inactive'}
                  </span>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>

        {/* Additional Information */}
        <Card>
                  <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                <p className="text-gray-900">{renderValue(teacher.emergency_contact)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Group</label>
                <p className="text-gray-900">{renderValue(teacher.blood_group)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Religion</label>
                <p className="text-gray-900">{renderValue(teacher.religion)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-gray-900">{renderValue(teacher.nationality)}</p>
                </div>
                            <div>
                <label className="text-sm font-medium text-gray-500">Date Created</label>
                <p className="text-gray-900">{formatDate(teacher.created_at)}</p>
                            </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(teacher.updated_at)}</p>
                          </div>
                    </div>
                  </CardContent>
                </Card>
      </div>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Teacher Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={editFormData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_number">Phone Number *</Label>
                  <Input
                    id="contact_number"
                    value={editFormData.contact_number || ''}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={editFormData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>
                            <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Select value={editFormData.marital_status || ''} onValueChange={(value) => handleInputChange('marital_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                            </div>
                <div>
                  <Label htmlFor="cnic">CNIC</Label>
                  <Input
                    id="cnic"
                    value={editFormData.cnic || ''}
                    onChange={(e) => handleInputChange('cnic', e.target.value)}
                    placeholder="Enter CNIC"
                  />
                          </div>
                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select value={editFormData.blood_group || ''} onValueChange={(value) => handleInputChange('blood_group', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                        </div>
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={editFormData.religion || ''}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    placeholder="Enter religion"
                  />
                    </div>
                            <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={editFormData.nationality || ''}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Enter nationality"
                  />
                            </div>
                          </div>
              <div>
                <Label htmlFor="permanent_address">Permanent Address</Label>
                <Textarea
                  id="permanent_address"
                  value={editFormData.permanent_address || ''}
                  onChange={(e) => handleInputChange('permanent_address', e.target.value)}
                  placeholder="Enter permanent address"
                  rows={3}
                />
                        </div>
              </div>

            {/* Education Information */}
                    <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Education Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="education_level">Education Level</Label>
                  <Select value={editFormData.education_level || ''} onValueChange={(value) => handleInputChange('education_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matric">Matric</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="bachelor">Bachelor</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                          </div>
                <div>
                  <Label htmlFor="year_of_passing">Year of Passing</Label>
                  <Input
                    id="year_of_passing"
                    type="number"
                    value={editFormData.year_of_passing || ''}
                    onChange={(e) => handleInputChange('year_of_passing', e.target.value)}
                    placeholder="Enter year of passing"
                  />
                        </div>
                <div>
                  <Label htmlFor="institution_name">Institution Name</Label>
                  <Input
                    id="institution_name"
                    value={editFormData.institution_name || ''}
                    onChange={(e) => handleInputChange('institution_name', e.target.value)}
                    placeholder="Enter institution name"
                  />
                    </div>
                            <div>
                  <Label htmlFor="degree_diploma">Degree/Diploma</Label>
                  <Input
                    id="degree_diploma"
                    value={editFormData.degree_diploma || ''}
                    onChange={(e) => handleInputChange('degree_diploma', e.target.value)}
                    placeholder="Enter degree/diploma"
                  />
                  </div>
                  </div>
                  </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_experience_years">Total Experience (Years)</Label>
                  <Input
                    id="total_experience_years"
                    type="number"
                    step="0.01"
                    min="0"
                    max="999.99"
                    value={editFormData.total_experience_years || ''}
                    onChange={(e) => handleInputChange('total_experience_years', e.target.value)}
                    placeholder="Enter experience in years"
                  />
                </div>
                <div>
                  <Label htmlFor="current_campus">Current Campus</Label>
                  <Select value={editFormData.current_campus || ''} onValueChange={(value) => handleInputChange('current_campus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map(campus => (
                        <SelectItem key={campus.id} value={campus.id.toString()}>
                          {campus.campus_name || campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    </div>
                <div>
                  <Label htmlFor="current_subjects">Current Subjects</Label>
                  <Input
                    id="current_subjects"
                    value={editFormData.current_subjects || ''}
                    onChange={(e) => handleInputChange('current_subjects', e.target.value)}
                    placeholder="Enter subjects (comma separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="current_classes_taught">Current Classes</Label>
                  <Input
                    id="current_classes_taught"
                    value={editFormData.current_classes_taught || ''}
                    onChange={(e) => handleInputChange('current_classes_taught', e.target.value)}
                    placeholder="Enter classes (comma separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={editFormData.emergency_contact || ''}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_currently_active"
                    checked={editFormData.is_currently_active || false}
                    onChange={(e) => handleInputChange('is_currently_active', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_currently_active">Currently Active</Label>
                  </div>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
                </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
                </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
