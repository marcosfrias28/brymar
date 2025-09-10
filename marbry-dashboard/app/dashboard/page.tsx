"use client"

import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PropertyChart } from "@/components/dashboard/property-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  const { language } = useLangStore()
  const t = translations[language]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-arsenic font-serif">{t.dashboard}</h1>
        <p className="text-blackCoral">Bienvenido al sistema de gestión de Marbry Inmobiliaria</p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Chart */}
        <div className="lg:col-span-2">
          <PropertyChart />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
