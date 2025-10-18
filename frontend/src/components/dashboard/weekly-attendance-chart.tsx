"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface WeeklyAttendanceData {
  day: string
  present: number
  absent: number
}

interface WeeklyAttendanceChartProps {
  data: WeeklyAttendanceData[]
}

export function WeeklyAttendanceChart({ data }: WeeklyAttendanceChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{payload[0].payload.day}</p>
          <p className="text-sm text-green-600">
            Present: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-red-600">
            Absent: <span className="font-medium">{payload[1].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate dynamic Y-axis domain
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.present, d.absent)),
    0
  )
  const yMax = Math.ceil(maxValue * 1.2 / 10) * 10

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#274c77]" />
          <CardTitle className="text-xl font-bold text-[#274c77]">Weekly Attendance Overview</CardTitle>
        </div>
        <CardDescription className="text-gray-600">Daily attendance pattern for this week</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                domain={[0, yMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span style={{ 
                    color: value === 'present' ? '#10b981' : '#ef4444', 
                    fontWeight: 500 
                  }}>
                    {value === 'present' ? 'Present' : 'Absent'}
                  </span>
                )}
              />
              <Line 
                type="monotone" 
                dataKey="present" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="absent" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

