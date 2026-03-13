import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isUp: boolean
  }
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card className="shadow-sm border-none bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {icon && <div className="text-muted-foreground opacity-70">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="mt-1 flex items-center gap-1.5">
            {trend && (
              <span className={cn(
                "text-xs font-bold",
                trend.isUp ? "text-emerald-500" : "text-destructive"
              )}>
                {trend.isUp ? "+" : "-"}{trend.value}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
