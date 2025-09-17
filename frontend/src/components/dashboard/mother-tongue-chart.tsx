"use client"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from "recharts"
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle} from "@/components/ui/card"
import {ChartConfig,ChartContainer,ChartTooltip} from "@/components/ui/chart"
import type { ChartData } from "@/types/dashboard"

interface MotherTongueChartProps {
  data: ChartData[]
}

// Custom tooltip to show full language and student count
function MotherTongueTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { payload: barData } = payload[0];
    return (
      <div style={{ background: 'white', border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
        <div><b>Language:</b> {barData.fullName}</div>
        <div><b>Students:</b> {barData.students}</div>
      </div>
    );
  }
  return null;
}

export function MotherTongueChart({ data }: MotherTongueChartProps) {
  // Group languages with < 20 students into 'Others'
  const threshold = 20;
  const mainLanguages = data.filter((item) => item.value >= threshold);
  const otherLanguages = data.filter((item) => item.value < threshold);

  const othersCount = otherLanguages.reduce((sum, item) => sum + item.value, 0);

  // Prepare chart data for recharts
  let chartData = mainLanguages.map((item) => ({
    motherTongue: item.name.slice(0, 3),
    fullName: item.name,
    students: item.value,
  }));

  if (othersCount > 0) {
    chartData.push({
      motherTongue: 'Oth',
      fullName: 'Others',
      students: othersCount,
    });
  }

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
              margin={{ bottom: 30 }}
            >
              <XAxis
                dataKey="motherTongue"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                dataKey="students"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<MotherTongueTooltip />} />
              <Bar dataKey="students" radius={5}>
                {chartData.map((entry, idx) => (
                  <Cell key={entry.fullName + idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                ))}
                <LabelList dataKey="students" position="top" fontSize={12} className="fill-foreground" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total students by mother tongue
        </div>
      </CardFooter> */}
    </Card>
  )
}
