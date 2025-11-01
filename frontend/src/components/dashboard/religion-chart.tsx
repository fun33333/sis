"use client"
import { Pie, PieChart, Sector, Cell, ResponsiveContainer } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
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

  // Colors: distinct per religion (theme-aligned); fallback cycles palette
  const COLOR_MAP: Record<string, string> = {
    islam: '#274C77',
    christianity: '#6096BA',
    hinduism: '#365486',
    sikhism: '#0f3b66',
    buddhism: '#8B8C89',
    other: '#A3CEF1',
  }
  const PALETTE = ['#274C77', '#365486', '#6096BA', '#49729b', '#0f3b66', '#8B8C89', '#A3CEF1']
  const getSliceColor = (name: string) => {
    const key = name.trim().toLowerCase()
    if (COLOR_MAP[key]) return COLOR_MAP[key]
    // stable hash to color index
    let h = 0
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
    return PALETTE[h % PALETTE.length]
  }
  const chartConfig = {
    students: {
      label: "Students",
    },
    ...Object.fromEntries(
      chartData.map((item) => [item.religion.toLowerCase(), {
        label: item.religion,
        color: getSliceColor(item.religion),
      }])
    ),
  } satisfies ChartConfig

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="items-center pb-0 bg-gradient-to-r from-[#E7ECEF] to-[#BFD7ED]">
        <CardTitle className="text-xl font-bold text-[#274c77]">Religion Distribution</CardTitle>
        <CardDescription className="text-gray-600">Student distribution by religion</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 pt-6">
        <div className="relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[240px] sm:h-[300px] w-full drop-shadow-sm"
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
              innerRadius="45%"
              outerRadius="70%"
              stroke="#ffffff"
              strokeWidth={6}
              paddingAngle={3}
              cornerRadius={10}
              label={false}
              labelLine={false}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            >
              {chartData.map((entry) => (
                <Cell key={entry.religion} fill={getSliceColor(entry.religion)} />
              ))}
            </Pie>
          </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        {/* Center KPI-like caption */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-semibold text-[#274c77]">Total</div>
            <div className="text-2xl font-extrabold text-[#274c77]">
              {chartData.reduce((s, d) => s + (d as any).students, 0)}
            </div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  )
}
