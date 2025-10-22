'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  submitAttendance, 
  reviewAttendance, 
  finalizeAttendance, 
  reopenAttendance 
} from '@/lib/api'
import { 
  Send, 
  Eye, 
  CheckCircle, 
  RotateCcw, 
  Clock, 
  AlertCircle,
  User,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceStateControlsProps {
  attendance: {
    id: number
    status: 'draft' | 'submitted' | 'under_review' | 'final'
    classroom_name: string
    date: string
    submitted_at?: string
    submitted_by?: string
    reviewed_at?: string
    reviewed_by?: string
    finalized_at?: string
    finalized_by?: string
    reopened_at?: string
    reopened_by?: string
    reopen_reason?: string
  }
  userRole: 'teacher' | 'coordinator' | 'principal' | 'superuser'
  onStatusChange: () => void
}

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Attendance is being prepared'
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Send,
    description: 'Waiting for coordinator review'
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Eye,
    description: 'Coordinator is reviewing'
  },
  final: {
    label: 'Final',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Attendance is finalized'
  }
}

export default function AttendanceStateControls({ 
  attendance, 
  userRole, 
  onStatusChange 
}: AttendanceStateControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [showReopenDialog, setShowReopenDialog] = useState(false)

  const currentStatus = statusConfig[attendance.status]
  const StatusIcon = currentStatus.icon

  const handleSubmit = async () => {
    if (attendance.status !== 'draft') return
    
    setIsLoading(true)
    try {
      await submitAttendance(attendance.id)
      toast.success('Attendance submitted for review')
      onStatusChange()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async () => {
    if (attendance.status !== 'submitted') return
    
    setIsLoading(true)
    try {
      await reviewAttendance(attendance.id)
      toast.success('Attendance moved to under review')
      onStatusChange()
    } catch (error: any) {
      toast.error(error.message || 'Failed to review attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (attendance.status !== 'under_review') return
    
    setIsLoading(true)
    try {
      await finalizeAttendance(attendance.id)
      toast.success('Attendance finalized successfully')
      onStatusChange()
    } catch (error: any) {
      toast.error(error.message || 'Failed to finalize attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      toast.error('Please provide a reason for reopening')
      return
    }
    
    setIsLoading(true)
    try {
      await reopenAttendance(attendance.id, reopenReason)
      toast.success('Attendance reopened successfully')
      setReopenReason('')
      setShowReopenDialog(false)
      onStatusChange()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reopen attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = userRole === 'teacher' && attendance.status === 'draft'
  const canReview = userRole === 'coordinator' && attendance.status === 'submitted'
  const canFinalize = userRole === 'coordinator' && attendance.status === 'under_review'
  const canReopen = userRole === 'coordinator' && attendance.status === 'final'

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Attendance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
            <span className="text-sm text-gray-600">
              {currentStatus.description}
            </span>
          </div>
        </div>

        {/* Status History */}
        <div className="space-y-2 text-sm">
          {attendance.submitted_at && (
            <div className="flex items-center gap-2 text-blue-600">
              <Send className="w-4 h-4" />
              <span>Submitted by {attendance.submitted_by} on {new Date(attendance.submitted_at).toLocaleString()}</span>
            </div>
          )}
          
          {attendance.reviewed_at && (
            <div className="flex items-center gap-2 text-orange-600">
              <Eye className="w-4 h-4" />
              <span>Reviewed by {attendance.reviewed_by} on {new Date(attendance.reviewed_at).toLocaleString()}</span>
            </div>
          )}
          
          {attendance.finalized_at && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Finalized by {attendance.finalized_by} on {new Date(attendance.finalized_at).toLocaleString()}</span>
            </div>
          )}
          
          {attendance.reopened_at && (
            <div className="flex items-center gap-2 text-red-600">
              <RotateCcw className="w-4 h-4" />
              <span>Reopened by {attendance.reopened_by} on {new Date(attendance.reopened_at).toLocaleString()}</span>
              {attendance.reopen_reason && (
                <span className="text-gray-500">- {attendance.reopen_reason}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {canSubmit && (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </Button>
          )}
          
          {canReview && (
            <Button 
              onClick={handleReview}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Move to Review
            </Button>
          )}
          
          {canFinalize && (
            <Button 
              onClick={handleFinalize}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Finalize
            </Button>
          )}
          
          {canReopen && (
            <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reopen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Reopen Attendance
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Please provide a reason for reopening this attendance record.
                  </p>
                  <Textarea
                    placeholder="Enter reason for reopening..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReopenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleReopen}
                      disabled={isLoading || !reopenReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? 'Reopening...' : 'Reopen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>Class: {attendance.classroom_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>Date: {new Date(attendance.date).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
