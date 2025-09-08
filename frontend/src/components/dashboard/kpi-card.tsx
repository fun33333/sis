"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  progress?: {
    value: number
    max: number
    color?: string
  }
  className?: string
}

export function KpiCard({ title, value, description, icon: Icon, trend, progress, className }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              <span className={cn("mr-1", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? "↗" : "↘"}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{description}</p>

        {progress && (
          <div className="space-y-1">
            <Progress value={(progress.value / progress.max) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.value}</span>
              <span>{progress.max}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
