"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

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

const chartConfig = {
  students: {
    label: "Students",
  },
  male: {
    label: "Male",
    color: "#274c77",
  },
  female: {
    label: "Female", 
    color: "#6096ba",
  },
  morning: {
    label: "Morning",
    color: "#a3cef1",
  },
  afternoon: {
    label: "Afternoon",
    color: "#8b8c89",
  },
} satisfies ChartConfig

interface RadialChartProps {
  data: {
    male_students: number
    female_students: number
    morning_students: number
    afternoon_students: number
    total_students: number
  }
}

export function StudentRadialChart({ data }: RadialChartProps) {
  const chartData = [
    { 
      category: "male", 
      students: data.male_students, 
      fill: "#274c77" 
    },
    { 
      category: "female", 
      students: data.female_students, 
      fill: "#6096ba" 
    },
    { 
      category: "morning", 
      students: data.morning_students, 
      fill: "#a3cef1" 
    },
    { 
      category: "afternoon", 
      students: data.afternoon_students, 
      fill: "#8b8c89" 
    },
  ]

  const malePercentage = data.total_students ? Math.round((data.male_students / data.total_students) * 100) : 0
  const femalePercentage = data.total_students ? Math.round((data.female_students / data.total_students) * 100) : 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Student Demographics</CardTitle>
        <CardDescription>Gender & Shift Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <RadialBar dataKey="students" background>
              <LabelList
                position="insideStart"
                dataKey="category"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Male: {malePercentage}% • Female: {femalePercentage}% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total Students: {data.total_students}
        </div>
      </CardFooter>
    </Card>
  )
}
