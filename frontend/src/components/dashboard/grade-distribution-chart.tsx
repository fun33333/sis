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
  // recharts expects dataKey to be a string, so we use 'name' for grade and 'value' for count
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>Student enrollment by grade level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 1000]}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
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
