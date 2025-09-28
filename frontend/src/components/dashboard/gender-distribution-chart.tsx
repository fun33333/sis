"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/types/dashboard"

interface GenderDistributionChartProps {
  data: ChartData[]
}

// Custom palette for gender chart (case-insensitive keys)
const GENDER_COLORS: Record<string, string> = {
  female: '#274C77', // blue
  male: '#de3492ff', // teal-pink
  other: '#a3a3a3',
}

export function GenderDistributionChart({ data }: GenderDistributionChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Students: <span className="font-medium text-foreground">{data.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage:{" "}
            <span className="font-medium text-foreground">{((data.value / data.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate total for percentage calculation
  const dataWithTotal = data.map((item) => ({
    ...item,
    total: data.reduce((sum, d) => sum + d.value, 0),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Student enrollment by gender</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dataWithTotal} cx="50%" cy="50%" outerRadius={120} dataKey="value">
                {dataWithTotal.map((entry: any, index: number) => {
                  const key = (entry?.name ?? '').toString().trim().toLowerCase()
                  const mapped = GENDER_COLORS[key]
                  const fill = mapped || entry?.fill || '#3B82F6'
                  return <Cell key={`cell-${index}`} fill={fill} />
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
