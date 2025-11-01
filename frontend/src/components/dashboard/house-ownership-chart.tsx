"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import type { ChartData } from "@/types/dashboard"

interface HouseOwnershipChartProps {
  data: ChartData[]
}

const HOUSE_COLORS: Record<string, string> = {
  owned: '#274C77',
  rented: '#6096BA',
}

export function HouseOwnershipChart({ data }: HouseOwnershipChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const total = data.reduce((sum, d) => sum + d.value, 0)
      const percentage = ((item.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium capitalize">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            Families: <span className="font-medium text-foreground">{item.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate total for percentage
  const dataWithTotal = data.map((item) => ({
    ...item,
    total: data.reduce((sum, d) => sum + d.value, 0),
  }))

  return (
    <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-[#274c77]" />
          <CardTitle className="text-xl font-bold text-[#274c77]">House Ownership</CardTitle>
        </div>
        <CardDescription className="text-gray-600">Family housing status</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[240px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={dataWithTotal} 
                cx="50%" 
                cy="50%" 
                innerRadius="45%"
                outerRadius="70%" 
                dataKey="value"
                label={false}
                labelLine={false}
              >
                {dataWithTotal.map((entry: any, index: number) => {
                  const key = (entry?.name ?? '').toString().trim().toLowerCase()
                  const fill = HOUSE_COLORS[key] || '#8B8C89'
                  return <Cell key={`cell-${index}`} fill={fill} />
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {/* Legend removed – we show detailed list below */}
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Mobile-friendly legend with details */}
        <div className="mt-3 text-sm sm:text-xs">
          {(() => {
            const total = data.reduce((sum, d) => sum + d.value, 0)
            return data.map((d, idx) => {
              const key = (d?.name || '').toString().toLowerCase().trim()
              const color = HOUSE_COLORS[key] || '#8B8C89'
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
              return (
                <div key={idx} className="flex items-center gap-2 py-0.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="capitalize font-medium text-[#274c77]">{d.name}</span>
                  <span className="ml-auto text-gray-500">{d.value} ({pct}%)</span>
                </div>
              )
            })
          })()}
        </div>
      </CardContent>
    </Card>
  )
}

