'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  createHoliday, 
  getHolidays 
} from '@/lib/api'
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Holiday {
  id: number
  date: string
  reason: string
  created_by: string
}

interface HolidayManagementProps {
  levelId: number
  levelName: string
}

export default function HolidayManagement({ levelId, levelName }: HolidayManagementProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    reason: ''
  })

  useEffect(() => {
    fetchHolidays()
  }, [levelId])

  const fetchHolidays = async () => {
    setIsLoading(true)
    try {
      const data = await getHolidays(levelId)
      setHolidays(data as Holiday[])
    } catch (error) {
      console.error('Failed to fetch holidays:', error)
      toast.error('Failed to load holidays')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.reason.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      await createHoliday(formData)
      toast.success('Holiday created successfully')
      setFormData({ date: '', reason: '' })
      setShowCreateDialog(false)
      fetchHolidays()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create holiday')
    } finally {
      setIsLoading(false)
    }
  }

  const isHolidayToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  }

  const isHolidayPast = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date < today
  }

  const isHolidayUpcoming = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date > today
  }

  const getHolidayStatus = (date: string) => {
    if (isHolidayToday(date)) {
      return { label: 'Today', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    } else if (isHolidayPast(date)) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    } else {
      return { label: 'Upcoming', color: 'bg-green-100 text-green-800 border-green-200' }
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Holidays - {levelName}
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Create New Holiday
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateHoliday} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reason for holiday..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Holiday'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No holidays defined for this level</p>
            <p className="text-xs">Click "Add Holiday" to create one</p>
          </div>
        ) : (
          <div className="space-y-3 h-full flex flex-col">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {holidays.filter(h => isHolidayToday(h.date)).length}
                </div>
                <div className="text-xs text-blue-600">Today</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {holidays.filter(h => isHolidayUpcoming(h.date)).length}
                </div>
                <div className="text-xs text-green-600">Upcoming</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">
                  {holidays.filter(h => isHolidayPast(h.date)).length}
                </div>
                <div className="text-xs text-gray-600">Past</div>
              </div>
            </div>

            {/* Holidays Table */}
            <div className="flex-1 overflow-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((holiday) => {
                    const status = getHolidayStatus(holiday.date)
                    return (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {holiday.reason}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {holiday.created_by}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
