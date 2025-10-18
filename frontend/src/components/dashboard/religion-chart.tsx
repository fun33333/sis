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
  // Merge all 'islam'/'Islam' (case-insensitive) into one 'Islam' entry
  let islamCount = 0;
  const otherReligions: { religion: string; students: number; fill?: string }[] = [];
  data.forEach((item) => {
    if (item.name.trim().toLowerCase() === 'islam') {
      islamCount += item.value;
    } else {
      otherReligions.push({ religion: item.name, students: item.value, fill: item.fill || undefined });
    }
  });
  const chartData = [
    ...(islamCount > 0 ? [{ religion: 'Islam', students: islamCount }] : []),
    ...otherReligions,
  ];

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
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="items-center pb-0 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="text-xl font-bold text-[#274c77]">Religion Distribution</CardTitle>
        <CardDescription className="text-gray-600">Student distribution by religion</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[320px]"
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
                outerRadius={100}
                strokeWidth={5}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
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
    </Card>
  )
}
