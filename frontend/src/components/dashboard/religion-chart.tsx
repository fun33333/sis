"use client"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, Sector, ResponsiveContainer, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface ReligionChartProps {
  data: ChartData[]
}

export function ReligionChart({ data }: ReligionChartProps) {
  // Prepare chart data for recharts
  const chartData = data.map((item) => ({
    religion: item.name,
    students: item.value,
    fill: item.fill || undefined,
  }))

  // Custom palette for pie slices
  const PIE_COLORS = [
    '#E7ECEF',
    '#A3CEF1',
    '#6096BA',
    '#8B8C89',
    '#274C77',
    '#BFD7ED',
    '#C9D6DF',
  ];
  const chartConfig = {
    students: {
      label: "Students",
    },
    ...Object.fromEntries(
      chartData.map((item, idx) => [item.religion.toLowerCase(), {
        label: item.religion,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }])
    ),
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Religion Distribution</CardTitle>
        <CardDescription>Student distribution by religion</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="students"
                nameKey="religion"
                innerRadius={60}
                strokeWidth={5}
                activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                  <Sector {...props} outerRadius={outerRadius + 10} />
                )}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={entry.religion} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total students by religion
        </div>
      </CardFooter>
    </Card>
  )
}
