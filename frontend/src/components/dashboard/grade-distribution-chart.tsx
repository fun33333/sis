"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LabelList, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/types/dashboard"

interface GradeDistributionChartProps {
  data: ChartData[]
}

// Bar colors
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
  // Calculate dynamic Y-axis domain based on actual data
  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0);
  const yMax = Math.ceil(maxValue * 1.2); // Add 20% padding
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl font-bold text-[#274c77]">Grade Distribution</CardTitle>
        <CardDescription className="text-gray-600">Student enrollment by grade level</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={11}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[0, yMax]}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Students: <span className="font-medium text-foreground">{d.value}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="value" radius={8}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
