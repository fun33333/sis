"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrendData } from "@/types/dashboard"

interface EnrollmentTrendChartProps {
  data: TrendData[]
}

export function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
              {entry.dataKey === "retention" && "%"}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment & Retention Trends</CardTitle>
        <CardDescription>Student enrollment and retention rates over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="enrollment"
                stroke="#7ec8e3" // Light blue
                strokeWidth={3}
                dot={{ fill: "#b3e0ff", stroke: "#7ec8e3", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#fff', stroke: '#7ec8e3', strokeWidth: 3 }}
                name="Enrollment"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retention"
                stroke="#f7b267" // Light orange
                strokeWidth={3}
                dot={{ fill: "#ffe0b2", stroke: "#f7b267", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#fff', stroke: '#f7b267', strokeWidth: 3 }}
                name="Retention Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
