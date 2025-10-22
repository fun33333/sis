"use client"
import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartData } from "@/types/dashboard"

interface MotherTongueChartProps {
  data: ChartData[]
}

export function MotherTongueChart({ data }: MotherTongueChartProps) {
  // Sort data by value and get top 5, rest goes to "Others"
  const sortedData = [...data].sort((a, b) => b.value - a.value)
  const top5 = sortedData.slice(0, 5)
  const others = sortedData.slice(5)
  const othersTotal = others.reduce((sum, item) => sum + item.value, 0)
  
  // Prepare data for interactive bar chart
  const allData = [
    ...top5,
    ...(othersTotal > 0 ? [{ name: "Others", value: othersTotal }] : [])
  ]
  
  // Create chart data with proper structure
  const colorPalette = [
    '#365486',
    '#6096ba',
    '#a3cef1',
    '#8b8c89',
    '#274c77',
    '#bfd7ed',
    '#c9d6df',
  ]
  
  const chartData = allData.map((item, index) => ({
    language: item.name,
    students: item.value,
    fill: colorPalette[index % colorPalette.length],
  }))
  
  const chartConfig = {
    students: {
      label: "Students",
    },
    language: {
      label: "Language",
    },
  } satisfies ChartConfig

  const [activeChart, setActiveChart] = React.useState<"students">("students")
  
  const total = React.useMemo(
    () => ({
      students: chartData.reduce((acc, curr) => acc + curr.students, 0),
    }),
    [chartData]
  )

  return (
    <Card className="py-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="text-xl font-bold text-[#274c77]">Mother Tongue Distribution</CardTitle>
          <CardDescription className="text-gray-600">
            Students by mother tongue (interactive view)
          </CardDescription>
        </div>
        <div className="flex">
          <button
            data-active={activeChart === "students"}
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6"
            onClick={() => setActiveChart("students")}
          >
            <span className="text-muted-foreground text-xs">
              {chartConfig.students.label}
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {total.students.toLocaleString()}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="language"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="students"
                  labelFormatter={(value) => `Language: ${value}`}
                />
              }
            />
            <Bar dataKey="students" fill="#3B82F6" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
