'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getRealtimeMetrics } from '@/lib/api'
import { 
  RefreshCw, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface ClassroomMetrics {
  id: number
  name: string
  status: 'draft' | 'submitted' | 'under_review' | 'final' | 'not_marked'
  status_color: 'gray' | 'yellow' | 'blue' | 'orange' | 'green'
  total_students: number
  present_count: number
  absent_count: number
  percentage: number
}

interface RealtimeMetrics {
  today: string
  classrooms: ClassroomMetrics[]
}

const statusConfig = {
  not_marked: {
    label: 'Not Marked',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle,
    description: 'Attendance not marked'
  },
  draft: {
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Being prepared'
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Activity,
    description: 'Waiting for review'
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: RefreshCw,
    description: 'Coordinator reviewing'
  },
  final: {
    label: 'Final',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Finalized'
  }
}

export default function RealtimeAttendanceMatrix() {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({ today: '', classrooms: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchMetrics()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchMetrics()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const data = await getRealtimeMetrics()
      setMetrics(data as RealtimeMetrics)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error)
      toast.error('Failed to load attendance data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (statusColor: string) => {
    const colorMap = {
      gray: 'bg-gray-200',
      yellow: 'bg-yellow-200',
      blue: 'bg-blue-200',
      orange: 'bg-orange-200',
      green: 'bg-green-200'
    }
    return colorMap[statusColor as keyof typeof colorMap] || 'bg-gray-200'
  }

  const getOverallStats = () => {
    const totalClassrooms = metrics.classrooms.length
    const markedClassrooms = metrics.classrooms.filter(c => c.status !== 'not_marked').length
    const finalizedClassrooms = metrics.classrooms.filter(c => c.status === 'final').length
    const totalStudents = metrics.classrooms.reduce((sum, c) => sum + c.total_students, 0)
    const presentStudents = metrics.classrooms.reduce((sum, c) => sum + c.present_count, 0)
    const overallPercentage = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0

    return {
      totalClassrooms,
      markedClassrooms,
      finalizedClassrooms,
      totalStudents,
      presentStudents,
      overallPercentage
    }
  }

  const stats = getOverallStats()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Attendance Matrix
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalClassrooms}</div>
            <div className="text-sm text-blue-600">Total Classes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.markedClassrooms}</div>
            <div className="text-sm text-green-600">Marked</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.finalizedClassrooms}</div>
            <div className="text-sm text-purple-600">Finalized</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.overallPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-orange-600">Overall Attendance</div>
          </div>
        </div>

        {/* Attendance Matrix */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Classroom Status
          </h3>
          
          {metrics.classrooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No classroom data available</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {metrics.classrooms.map((classroom) => {
                const statusInfo = statusConfig[classroom.status]
                const StatusIcon = statusInfo.icon
                
                return (
                  <div
                    key={classroom.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      classroom.status === 'not_marked' 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(classroom.status_color)}`} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{classroom.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {statusInfo.description}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {classroom.percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {classroom.present_count}/{classroom.total_students} students
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {classroom.present_count} present
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-500" />
                            {classroom.absent_count} absent
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            classroom.percentage >= 90 ? 'bg-green-500' :
                            classroom.percentage >= 75 ? 'bg-yellow-500' :
                            classroom.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(classroom.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
