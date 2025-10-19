"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Edit, X } from "lucide-react"
import { getAllCoordinators } from "@/lib/api"
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions"

interface CoordinatorUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  role: string
  campus_name?: string
  is_active: boolean
  level?: string
  joining_date?: string
}

export default function CoordinatorListPage() {
  useEffect(() => {
    document.title = "Coordinator List - Coordinator | IAK SMS"
  }, [])

  const [search, setSearch] = useState("")
  const [coordinators, setCoordinators] = useState<CoordinatorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>("")
  const [userCampus, setUserCampus] = useState<string>("")
  const [editingCoordinator, setEditingCoordinator] = useState<CoordinatorUser | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Get user role and campus for principal filtering
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = getCurrentUserRole()
      console.log('User role:', role)
      setUserRole(role)
      
      const user = getCurrentUser() as any
      console.log('Current user:', user)
      
      // Check different possible campus data structures
      if (user?.campus?.campus_name) {
        console.log('User campus (campus.campus_name):', user.campus.campus_name)
        setUserCampus(user.campus.campus_name)
      } else if (user?.campus_name) {
        console.log('User campus (campus_name):', user.campus_name)
        setUserCampus(user.campus_name)
      } else if (user?.campus) {
        console.log('User campus (campus):', user.campus)
        setUserCampus(user.campus)
      } else {
        console.log('No campus found in user data, checking all user properties:', Object.keys(user || {}))
        // Try to get campus from username pattern (C06-M-24-P-0057)
        if (user?.username) {
          const campusMatch = user.username.match(/C(\d+)/);
          if (campusMatch) {
            const campusNumber = campusMatch[1];
            const campusName = `Campus ${campusNumber}`;
            console.log('Extracted campus from username:', campusName)
            setUserCampus(campusName)
          }
        }
      }
    }
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      
      try {
        console.log('Loading coordinators - userRole:', userRole, 'userCampus:', userCampus)
        
        // Principal: Get coordinators from their campus only
        if (userRole === 'principal' && userCampus) {
          console.log('Loading coordinators for principal from campus:', userCampus)
          const allCoordinators = await getAllCoordinators() as any
          console.log('All coordinators fetched:', allCoordinators)
          
          // Handle API response structure
          const coordinatorsList = allCoordinators?.results || allCoordinators || []
          console.log('Coordinators list:', coordinatorsList)
          
          // Filter coordinators by campus
          const campusCoordinators = coordinatorsList.filter((coord: any) => {
            const coordCampus = coord.campus?.campus_name || coord.campus
            console.log(`Coordinator ${coord.full_name} campus: ${coordCampus}, Principal campus: ${userCampus}`)
            
            // Handle different campus formats
            const coordCampusStr = String(coordCampus).toLowerCase()
            const userCampusStr = String(userCampus).toLowerCase()
            
            // Check exact match
            if (coordCampusStr === userCampusStr) {
              console.log(`Exact match found: ${coordCampus} === ${userCampus}`)
              return true
            }
            
            // Check if coordinator campus is just a number and user campus contains that number
            if (coordCampusStr === '6' && userCampusStr.includes('6')) {
              console.log(`Number match found: ${coordCampus} in ${userCampus}`)
              return true
            }
            
            // Check if user campus is just a number and coordinator campus contains that number
            if (userCampusStr === '6' && coordCampusStr.includes('6')) {
              console.log(`Reverse number match found: ${userCampus} in ${coordCampus}`)
              return true
            }
            
            console.log(`No match: ${coordCampus} !== ${userCampus}`)
            return false
          })
          
          console.log('Filtered coordinators for campus:', campusCoordinators)
          
          // Map to CoordinatorUser format
          const mappedCoordinators = campusCoordinators.map((coord: any) => {
            console.log('Coordinator level data:', coord.level)
            return {
              id: coord.id,
              username: coord.email || coord.username || '',
              email: coord.email || '',
              first_name: coord.full_name?.split(' ')[0] || coord.first_name || '',
              last_name: coord.full_name?.split(' ').slice(1).join(' ') || coord.last_name || '',
              role: 'coordinator',
              campus_name: coord.campus?.campus_name || coord.campus || userCampus,
              is_active: coord.is_currently_active !== false,
              level: coord.level?.name || (coord.level ? `Level ${coord.level}` : 'Not Assigned'),
              joining_date: coord.joining_date || 'Unknown'
            }
          })
          
          console.log('Mapped coordinators:', mappedCoordinators)
          setCoordinators(mappedCoordinators)
        } else {
          // For other roles, also use getAllCoordinators for consistency
          const allCoordinators = await getAllCoordinators() as any
          console.log('All coordinators response:', allCoordinators)
          
          // Handle API response structure
          const coordinatorsList = allCoordinators?.results || allCoordinators || []
          console.log('Coordinators list:', coordinatorsList)
          
          const mappedCoordinators = coordinatorsList.map((coord: any) => ({
            id: coord.id,
            username: coord.email || coord.username || '',
            email: coord.email || '',
            first_name: coord.full_name?.split(' ')[0] || coord.first_name || '',
            last_name: coord.full_name?.split(' ').slice(1).join(' ') || coord.last_name || '',
            role: 'coordinator',
            campus_name: coord.campus?.campus_name || coord.campus || 'Unknown',
            is_active: coord.is_currently_active !== false,
            level: coord.level?.name || 'Unknown',
            joining_date: coord.joining_date || 'Unknown'
          }))
          setCoordinators(mappedCoordinators)
        }
      } catch (error) {
        console.error('Error loading coordinators:', error)
        setCoordinators([])
      }
      
      setLoading(false)
    }
    load()
  }, [userRole, userCampus])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return coordinators
    return coordinators.filter(u =>
      (u.first_name || "").toLowerCase().includes(q) ||
      (u.last_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.level || "").toLowerCase().includes(q) ||
      (u.joining_date || "").toLowerCase().includes(q)
    )
  }, [search, coordinators])

  // No need to load campuses and levels since they're removed from edit form

  const handleEdit = async (coordinator: CoordinatorUser) => {
    setEditingCoordinator(coordinator)
    
    // Load full coordinator data from API
    try {
      const response = await fetch(`/api/coordinators/${coordinator.id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sis_token')}`
        }
      })
      
      if (response.ok) {
        const fullData = await response.json()
        setEditFormData({
          full_name: fullData.full_name || `${coordinator.first_name} ${coordinator.last_name}`.trim(),
          email: fullData.email || coordinator.email,
          dob: fullData.dob || '',
          gender: fullData.gender || '',
          phone: fullData.phone || '',
          permanent_address: fullData.permanent_address || '',
          education_level: fullData.education_level || '',
          institution_name: fullData.institution_name || '',
          year_of_passing: fullData.year_of_passing || '',
          total_experience_years: fullData.total_experience_years || '',
          campus: fullData.campus?.campus_name || coordinator.campus_name,
          level: fullData.level?.name || coordinator.level,
          joining_date: fullData.joining_date || coordinator.joining_date,
          is_currently_active: fullData.is_currently_active !== false,
          can_assign_class_teachers: fullData.can_assign_class_teachers || false
        })
      } else {
        // Fallback to basic data if API fails
        setEditFormData({
          full_name: `${coordinator.first_name} ${coordinator.last_name}`.trim(),
          email: coordinator.email,
          dob: '',
          gender: '',
          phone: '',
          permanent_address: '',
          education_level: '',
          institution_name: '',
          year_of_passing: '',
          total_experience_years: '',
          campus: coordinator.campus_name,
          level: coordinator.level,
          joining_date: coordinator.joining_date,
          is_currently_active: coordinator.is_active,
          can_assign_class_teachers: false
        })
      }
    } catch (error) {
      console.error('Error loading coordinator details:', error)
      // Fallback to basic data
      setEditFormData({
        full_name: `${coordinator.first_name} ${coordinator.last_name}`.trim(),
        email: coordinator.email,
        dob: '',
        gender: '',
        phone: '',
        permanent_address: '',
        education_level: '',
        institution_name: '',
        year_of_passing: '',
        total_experience_years: '',
        campus: coordinator.campus_name,
        level: coordinator.level,
        joining_date: coordinator.joining_date,
        is_currently_active: coordinator.is_active,
        can_assign_class_teachers: false
      })
    }
    
    setShowEditDialog(true)
  }

  const handleEditClose = () => {
    setEditingCoordinator(null)
    setShowEditDialog(false)
    setEditFormData({})
  }

  const handleEditSubmit = async () => {
    if (!editingCoordinator) return

    setIsSubmitting(true)
    try {
      // Prepare data for update - only send changed fields
      const updateData: any = {}
      
      // Add fields that have values (excluding campus and level)
      if (editFormData.full_name) updateData.full_name = editFormData.full_name
      if (editFormData.email) updateData.email = editFormData.email
      if (editFormData.dob) updateData.dob = editFormData.dob
      if (editFormData.gender) updateData.gender = editFormData.gender.toLowerCase() // Convert to lowercase
      if (editFormData.phone) updateData.phone = editFormData.phone
      if (editFormData.permanent_address) updateData.permanent_address = editFormData.permanent_address
      if (editFormData.education_level) updateData.education_level = editFormData.education_level
      if (editFormData.institution_name) updateData.institution_name = editFormData.institution_name
      if (editFormData.year_of_passing) updateData.year_of_passing = parseInt(editFormData.year_of_passing)
      if (editFormData.total_experience_years) updateData.total_experience_years = parseInt(editFormData.total_experience_years)
      if (editFormData.joining_date) updateData.joining_date = editFormData.joining_date
      
      // Always include boolean fields
      updateData.is_currently_active = editFormData.is_currently_active
      updateData.can_assign_class_teachers = editFormData.can_assign_class_teachers

      console.log('Updating coordinator with data:', updateData)

      // Use the correct API endpoint with proper base URL
      const baseUrl = 'http://127.0.0.1:8000'
      const endpoint = `${baseUrl}/api/coordinators/${editingCoordinator.id}/`
      
      console.log(`Updating coordinator at: ${endpoint}`)
      console.log('Update data:', updateData)
      console.log('Token:', localStorage.getItem('sis_access_token') ? 'Present' : 'Missing')
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sis_access_token')}`
        },
        body: JSON.stringify(updateData)
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      console.log('Update response status:', response.status)

      if (response.ok) {
        const updatedData = await response.json()
        console.log('Coordinator updated successfully:', updatedData)
        
        // Close dialog first
        handleEditClose()
        
        // Show success alert
        const coordinatorName = editFormData.full_name || (editingCoordinator?.first_name + ' ' + editingCoordinator?.last_name) || 'Coordinator'
        alert(`✅ Success! The information of coordinator "${coordinatorName}" has been updated successfully!`)
        
        // Reload coordinators
        window.location.reload()
      } else {
        const errorData = await response.text()
        console.error('Error updating coordinator:', response.status, errorData)
        alert(`❌ Error updating coordinator: ${response.status} - ${errorData}`)
      }
    } catch (error) {
      console.error('Error updating coordinator:', error)
      alert(`Error updating coordinator: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Coordinator List</h1>
          <p className="text-gray-600">
            {userRole === 'principal' && userCampus 
              ? `Coordinators from ${userCampus} campus` 
              : 'All coordinators across campuses'
            }
          </p>
        </div>
        <Badge style={{ backgroundColor: '#6096ba', color: 'white' }} className="px-4 py-2">
          {filtered.length} Coordinators
        </Badge>
      </div>

      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={
                userRole === 'principal' && userCampus 
                  ? `Search coordinators from ${userCampus}...`
                  : "Search by name, email, level..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              style={{ borderColor: '#a3cef1' }}
            />
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Coordinators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              {userRole === 'principal' && userCampus 
                ? `Loading coordinators from ${userCampus}...`
                : 'Loading coordinators...'
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#274c77' }}>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Level</TableHead>
                  <TableHead className="text-white">Joining Date</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u, index) => (
                  <TableRow key={u.id} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }} className="hover:bg-[#a3cef1] transition">
                    <TableCell className="font-medium">{`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.level || '—'}</TableCell>
                    <TableCell>{u.joining_date || '—'}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: u.is_active ? '#6096ba' : '#8b8c89', color: 'white' }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            router.push(`/admin/coordinator/profile/${u.id}`)
                          }}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            handleEdit(u)
                          }}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: '#274c77' }}>
              Edit Coordinator
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={editFormData.full_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={editFormData.gender || ''} onValueChange={(value) => setEditFormData({...editFormData, gender: value})}>
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
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="permanent_address">Permanent Address</Label>
                  <Input
                    id="permanent_address"
                    value={editFormData.permanent_address || ''}
                    onChange={(e) => setEditFormData({...editFormData, permanent_address: e.target.value})}
                    placeholder="Enter permanent address"
                  />
                </div>
              </div>
            </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Educational Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="education_level">Education Level</Label>
                  <Input
                    id="education_level"
                    value={editFormData.education_level || ''}
                    onChange={(e) => setEditFormData({...editFormData, education_level: e.target.value})}
                    placeholder="Enter education level"
                  />
                </div>
                <div>
                  <Label htmlFor="institution_name">Institution Name</Label>
                  <Input
                    id="institution_name"
                    value={editFormData.institution_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, institution_name: e.target.value})}
                    placeholder="Enter institution name"
                  />
                </div>
                <div>
                  <Label htmlFor="year_of_passing">Year of Passing</Label>
                  <Input
                    id="year_of_passing"
                    type="number"
                    value={editFormData.year_of_passing || ''}
                    onChange={(e) => setEditFormData({...editFormData, year_of_passing: e.target.value})}
                    placeholder="Enter year of passing"
                  />
                </div>
                <div>
                  <Label htmlFor="total_experience_years">Total Experience (Years)</Label>
                  <Input
                    id="total_experience_years"
                    type="number"
                    value={editFormData.total_experience_years || ''}
                    onChange={(e) => setEditFormData({...editFormData, total_experience_years: e.target.value})}
                    placeholder="Enter experience in years"
                  />
                </div>
              </div>
            </div>

            {/* Work Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Work Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="joining_date">Joining Date</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={editFormData.joining_date || ''}
                    onChange={(e) => setEditFormData({...editFormData, joining_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="is_currently_active">Status</Label>
                  <Select value={editFormData.is_currently_active ? 'true' : 'false'} onValueChange={(value) => setEditFormData({...editFormData, is_currently_active: value === 'true'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="can_assign_class_teachers">Can Assign Class Teachers</Label>
                  <Select value={editFormData.can_assign_class_teachers ? 'true' : 'false'} onValueChange={(value) => setEditFormData({...editFormData, can_assign_class_teachers: value === 'true'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleEditClose}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Coordinator...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Coordinator
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


