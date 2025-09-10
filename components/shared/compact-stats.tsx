import type { ReactNode } from "react"

interface StatItem {
  label: string
  value: number | string
  icon: ReactNode // Cambiado de LucideIcon a ReactNode para aceptar elementos JSX
  color: string
}

interface CompactStatsProps {
  stats: StatItem[]
  className?: string
}

export function CompactStats({ stats, className = "" }: CompactStatsProps) {
  return (
    <div className={`bg-white border border-blackCoral rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-blackCoral/10">
              <div className={stat.color}>{stat.icon}</div>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blackCoral/70 truncate">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}