import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SystemHealthMonitor } from "@/components/dashboard/system-health-monitor";
import { WizardAnalyticsDashboard } from "@/components/dashboard/wizard-analytics-dashboard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
	title: "Wizard Analytics | Brymar Inmobiliaria",
	description: "Property wizard analytics and performance monitoring",
};

export default async function WizardAnalyticsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/sign-in");
	}

	// Only admins can access analytics
	if (session.user.role !== "admin") {
		redirect("/dashboard");
	}

	// Mock analytics data
	const analyticsData = {
		totalWizardSessions: 1247,
		completedWizards: 892,
		averageCompletionTime: 8.5,
		conversionRate: 71.6,
		activeUsers: 156,
		systemUptime: 99.8,
	};

	// Generate stats cards using the admin adapter (since this is admin-only analytics)
	const statsAdapter = getStatsAdapter("admin");
	const statsCards = statsAdapter
		? statsAdapter.generateStats(analyticsData)
		: [];

	// Define filter tabs for analytics sections
	const filterTabs = [
		{ label: "Analytics Dashboard", value: "analytics" },
		{ label: "System Health", value: "health" },
	];

	// Handle export analytics
	const _handleExportAnalytics = () => {
		// Here you would trigger analytics export
	};

	return (
		<DashboardPageLayout
			actions={
				<Button variant="outline">
					<BarChart3 className="mr-2 h-4 w-4" />
					Exportar Datos
				</Button>
			}
			description="Monitor property wizard performance, user behavior, and system health"
			headerExtras={
				<div className="space-y-4">
					<StatsCards className="mb-4" isLoading={false} stats={statsCards} />
					<FilterTabs className="mb-4" tabs={filterTabs} />
				</div>
			}
			title="Wizard Analytics"
		>
			<Tabs className="space-y-6" defaultValue="analytics">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
					<TabsTrigger value="health">System Health</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-6" value="analytics">
					<WizardAnalyticsDashboard />
				</TabsContent>

				<TabsContent className="space-y-6" value="health">
					<SystemHealthMonitor />
				</TabsContent>
			</Tabs>
		</DashboardPageLayout>
	);
}
