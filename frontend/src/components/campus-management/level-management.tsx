"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, School, UserPlus } from "lucide-react"
import { 
  getLevels, createLevel, updateLevel, deleteLevel, getUserCampusId,
  assignCoordinatorToLevel, getAvailableCoordinators
} from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LevelManagementProps {
  campusId?: number
}

const LEVEL_OPTIONS = [
  { value: 'Pre-Primary', label: 'Pre-Primary (Nursery, KG-I, KG-II)' },
  { value: 'Primary', label: 'Primary (Grade 1-5)' },
  { value: 'Secondary', label: 'Secondary (Grade 6-10)' },
];

export default function LevelManagement({ campusId }: LevelManagementProps) {
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [saving, setSaving] = useState(false)
  
  // Coordinator assignment state
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<any>(null)
  const [availableCoordinators, setAvailableCoordinators] = useState<any[]>([])
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('')
  const [assigning, setAssigning] = useState(false)
  
  // Get campus ID from localStorage if not provided
  const userCampusId = campusId || getUserCampusId()

  useEffect(() => {
    fetchLevels()
  }, [userCampusId])

  async function fetchLevels() {
    setLoading(true)
    try {
      const data = await getLevels(userCampusId || undefined)
      // Handle paginated response
      const levelsArray = (data as any)?.results || (Array.isArray(data) ? data : [])
      setLevels(levelsArray)
    } catch (error) {
      console.error('Failed to fetch levels:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCreate() {
    setEditingLevel(null)
    setFormData({ name: '' })
    setIsDialogOpen(true)
  }

  function handleEdit(level: any) {
    setEditingLevel(level)
    setFormData({ name: level.name })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      alert('Please enter a level name')
      return
    }

    if (!userCampusId && !editingLevel) {
      alert('Campus information not found. Please log in again.')
      return
    }

    setSaving(true)
    try {
      if (editingLevel) {
        await updateLevel(editingLevel.id, formData)
      } else {
        // Include campus field for new level
        const dataWithCampus = {
          ...formData,
          campus: userCampusId
        }
        console.log('Creating level with data:', dataWithCampus)
        console.log('User campus ID:', userCampusId)
        await createLevel(dataWithCampus)
      }
      
      setIsDialogOpen(false)
      fetchLevels()
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save level. Please try again.'
      
      // Only log as error if it's not a validation error (400 status)
      if (error?.status !== 400) {
        console.error('Failed to save level:', error)
      } else {
        console.warn('Level validation:', errorMessage)
      }
      
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(level: any) {
    if (!confirm(`Are you sure you want to delete ${level.name}?`)) {
      return
    }

    try {
      await deleteLevel(level.id)
      fetchLevels()
    } catch (error) {
      console.error('Failed to delete level:', error)
      alert('Failed to delete level. It may have associated grades.')
    }
  }

  async function openCoordinatorModal(level: any) {
    setSelectedLevel(level)
    setSelectedCoordinatorId('')
    setCoordinatorModalOpen(true)
    
    try {
      const coordinators = await getAvailableCoordinators(userCampusId || undefined)
      setAvailableCoordinators(coordinators as any[])
    } catch (error) {
      console.error('Failed to fetch coordinators:', error)
      alert('Failed to load coordinators')
    }
  }

  async function handleCoordinatorAssignment() {
    if (!selectedCoordinatorId || !selectedLevel) return

    setAssigning(true)
    try {
      await assignCoordinatorToLevel(selectedLevel.id, parseInt(selectedCoordinatorId))
      setCoordinatorModalOpen(false)
      alert('Coordinator assigned successfully!')
      fetchLevels() // Refresh the list
    } catch (error) {
      console.error('Failed to assign coordinator:', error)
      alert('Failed to assign coordinator. Please try again.')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading levels..." />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Manage Levels</h2>
          <p className="text-sm text-gray-600">
            Create and manage educational levels for your campus
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Level
        </Button>
      </div>

      {levels.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No levels found for your campus</p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Level
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Coordinator</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {level.code}
                  </span>
                </TableCell>
                <TableCell>
                  {level.coordinator_name ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{level.coordinator_name}</span>
                      <span className="text-xs text-gray-500">({level.coordinator_code})</span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openCoordinatorModal(level)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign Coordinator
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(level)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(level)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? 'Edit Level' : 'Create New Level'}
            </DialogTitle>
            <DialogDescription>
              {editingLevel
                ? 'Update the level information. Code cannot be changed.'
                : 'Enter the level name. Code will be generated automatically.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Level Name *</Label>
              <Select value={formData.name} onValueChange={(value) => setFormData({ ...formData, name: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingLevel && (
              <div className="space-y-2">
                <Label>Level Code</Label>
                <Input
                  value={editingLevel.code}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">
                  System-generated code cannot be modified
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingLevel ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coordinator Assignment Modal */}
      <Dialog open={coordinatorModalOpen} onOpenChange={setCoordinatorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Coordinator to {selectedLevel?.name}</DialogTitle>
            <DialogDescription>
              Select a coordinator to assign to this level. Only coordinators from the same campus are available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Available Coordinators</Label>
              <Select value={selectedCoordinatorId} onValueChange={setSelectedCoordinatorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a coordinator" />
                </SelectTrigger>
                <SelectContent>
                  {availableCoordinators.map(coord => (
                    <SelectItem key={coord.id} value={coord.id.toString()}>
                      {coord.full_name} ({coord.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCoordinatorModalOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCoordinatorAssignment} 
              disabled={assigning || !selectedCoordinatorId}
            >
              {assigning ? 'Assigning...' : 'Assign Coordinator'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

