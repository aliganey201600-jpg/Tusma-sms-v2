"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

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

const chartData = [
  { month: "January", attendance: 92, enrollment: 400 },
  { month: "February", attendance: 94, enrollment: 450 },
  { month: "March", attendance: 91, enrollment: 520 },
  { month: "April", attendance: 95, enrollment: 600 },
  { month: "May", attendance: 97, enrollment: 750 },
  { month: "June", attendance: 96, enrollment: 800 },
]

const chartConfig = {
  attendance: {
    label: "Attendance %",
    color: "var(--chart-1)",
  },
  enrollment: {
    label: "Enrollment",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function DashboardCharts({ data = chartData, config = chartConfig }: { data?: any[], config?: ChartConfig }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>
            Showing monthly student attendance percentage for the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  left: -20,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="attendance"
                  type="natural"
                  fill="var(--color-attendance)"
                  fillOpacity={0.4}
                  stroke="var(--color-attendance)"
                  stackId="a"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                January - June 2026
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Enrollment Growth</CardTitle>
          <CardDescription>
            Showing total student registrations over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  left: -20,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                   tickLine={false}
                   axisLine={false}
                   tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="enrollment"
                  type="step"
                  fill="var(--color-enrollment)"
                  fillOpacity={0.4}
                  stroke="var(--color-enrollment)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 font-medium leading-none text-sm">
            Enrollment reached 800 students <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
