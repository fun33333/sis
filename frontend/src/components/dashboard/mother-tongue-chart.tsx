"use client"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from "recharts"
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle} from "@/components/ui/card"
import {ChartConfig,ChartContainer,ChartTooltip,ChartTooltipContent,} from "@/components/ui/chart"
import type { ChartData } from "@/types/dashboard"

interface MotherTongueChartProps {
  data: ChartData[]
}

export function MotherTongueChart({ data }: MotherTongueChartProps) {
  // Prepare chart data for recharts
  const chartData = data.map((item) => ({
    motherTongue: item.name,
    students: item.value,
  }))

  const BAR_COLORS = [
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
      color: BAR_COLORS[0],
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mother Tongue Distribution</CardTitle>
        <CardDescription>Student distribution by mother tongue</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: -20 }}
            >
              <XAxis type="number" dataKey="students" hide />
              <YAxis
                dataKey="motherTongue"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={110}
                tickFormatter={(value) => value}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="students" radius={5}>
                {chartData.map((entry, idx) => (
                  <Cell key={entry.motherTongue} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                ))}
                <LabelList dataKey="students" position="right" fontSize={12} className="fill-foreground" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total students by mother tongue
        </div>
      </CardFooter>
    </Card>
  )
}
