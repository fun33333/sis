"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/types/dashboard"

interface CampusPerformanceChartProps {
  data: ChartData[]
}

export function CampusPerformanceChart({ data }: CampusPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label} Campus</p>
          <p className="text-sm text-muted-foreground">
            Average Score: <span className="font-medium text-foreground">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campus Performance</CardTitle>
        <CardDescription>Average academic scores by campus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} domain={[60, 100]} />
              <Tooltip content={<CustomTooltip />} />
              {/* Custom palette for campus bars */}
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, idx) => {
                  const BAR_COLORS = [
                    '#E7ECEF',
                    '#A3CEF1',
                    '#6096BA',
                    '#8B8C89',
                    '#274C77',
                    '#BFD7ED',
                    '#C9D6DF',
                  ];
                  return (
                    <Cell key={entry.name} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
