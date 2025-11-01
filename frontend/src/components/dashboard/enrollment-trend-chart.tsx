"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/types/dashboard"

interface EnrollmentTrendChartProps {
  data: ChartData[]
}

export function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-[#274C77]">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Students: <span className="font-medium text-foreground">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate dynamic Y-axis domain
  const maxValue = Math.max(...data.map(d => d.value), 0)
  const yMax = maxValue === 0 ? 100 : Math.ceil(maxValue * 1.2 / 100) * 100

  return (
    <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardTitle className="text-xl font-bold text-[#274c77]">Enrollment Trends</CardTitle>
        <CardDescription className="text-gray-600">Student enrollment by year</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#274C77" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#274C77" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                domain={[0, yMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#274C77" 
                strokeWidth={3}
                dot={{ fill: '#274C77', r: 5 }}
                activeDot={{ r: 7 }}
                fill="url(#enrollmentGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
