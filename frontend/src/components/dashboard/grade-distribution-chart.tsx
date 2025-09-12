"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/types/dashboard"

interface GradeDistributionChartProps {
  data: ChartData[]
}

// Custom palette: e7ecef, 8b8c89, 6096ba, a3cef1, 274c77 and their shades
const COLORS = [
  '#274C77', // light blue gray
  '#2e6ea2ff', // light blue
  '#6096BA', // blue
  '#7fa2b9ff', // gray
  '#494a48ff', // lighter blue
  '#67696aff', // lighter gray
  '#73787dff', // repeat for more slices
  '#aeb5baff',
  '#51815fff',
  '#579169ff',
  '#5e8e6cff',
  '#81b591ff', // dark blue

]

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
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

  const dataWithTotal = data.map((item) => ({
    ...item,
    total: data.reduce((sum, d) => sum + d.value, 0),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>Student enrollment by grade level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full overflow-x-auto flex flex-col">
          <div className="mb-0.5 flex flex-wrap gap-1 items-center justify-center">
            {dataWithTotal.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-0.5 text-[9px]">
                <span style={{ display: 'inline-block', width: 8, height: 8, background: COLORS[index % COLORS.length], borderRadius: 1, marginRight: 1 }}></span>
                <span>{entry.name}</span>
                <span className="font-semibold">({entry.value})</span>
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="outside" fontSize={12} className="fill-foreground" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
