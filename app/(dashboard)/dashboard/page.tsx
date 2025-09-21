"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RouteGuard } from "@/components/auth/route-guard";

// Mock data for DataTable - replace with actual data source
const mockData = [
  {
    id: 1,
    header: "Propiedades Activas",
    type: "Real Estate",
    status: "Active",
    target: "25",
    limit: "30",
    reviewer: "Admin",
  },
  {
    id: 2,
    header: "Terrenos Disponibles",
    type: "Land",
    status: "Available",
    target: "15",
    limit: "20",
    reviewer: "Manager",
  },
  {
    id: 3,
    header: "Blog Posts",
    type: "Content",
    status: "Published",
    target: "10",
    limit: "15",
    reviewer: "Editor",
  },
];

export default function DashboardPage() {
  return (
    <RouteGuard requiredPermission="dashboard.access">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between space-y-2 px-4 lg:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Cards Section */}
        <SectionCards />

        {/* Charts and Activity Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 px-4 lg:px-6">
          <div className="col-span-4">
            <ChartAreaInteractive />
          </div>
          <div className="col-span-3">
            <RecentActivity />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 lg:px-6">
          <QuickActions />
        </div>

        {/* Data Table */}
        <DataTable data={mockData} />
      </div>
    </RouteGuard>
  );
}
