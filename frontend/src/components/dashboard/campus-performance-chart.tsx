"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/types/dashboard"

interface CampusPerformanceChartProps {
  data: ChartData[]
  valueKind?: "average" | "count"
}

export function CampusPerformanceChart({ data, valueKind = "average" }: CampusPerformanceChartProps) {
  const maxValue = data.reduce((m, d) => Math.max(m, d.value), 0)
  const yDomain = valueKind === "count" ? [0, Math.max(5, Math.ceil(maxValue * 1.2))] : [0, 100]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {valueKind === "count" ? (
              <>
                Students: <span className="font-medium text-foreground">{payload[0].value}</span>
              </>
            ) : (
              <>
                Average Score: <span className="font-medium text-foreground">{payload[0].value}</span>
              </>
            )}
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
        <CardDescription>
          {valueKind === "count" ? "Students per campus" : "Average academic scores by campus"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} domain={yDomain as any} allowDecimals={false} />
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
