"use client";

import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { PropertyChart } from "@/components/dashboard/property-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardPageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useLands } from "@/hooks/use-lands";
import { useProperties } from "@/hooks/use-properties";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";

export default function DashboardPage() {
	const breadcrumbs = useBreadcrumbs();

	// Fetch data for stats
	const { data: propertiesData, isLoading: propertiesLoading } =
		useProperties();
	const { data: landsData, isLoading: landsLoading } = useLands();
	const { data: blogPostsData, isLoading: postsLoading } = useBlogPosts();

	const properties = propertiesData || [];
	const _lands = landsData?.items || [];
	const blogPosts = blogPostsData?.posts || [];

	const isLoading = propertiesLoading || landsLoading || postsLoading;

	// Handle dashboard refresh
	const _handleRefreshDashboard = () => {
		// Here you would trigger data refetch
		// refetch functions from the hooks could be called here
	};

	// Generate stats using the adapter system
	const adminAdapter = getStatsAdapter("admin");
	const statsCards =
		adminAdapter?.generateStats({
			totalUsers: 150, // This would come from a users hook
			totalProperties: properties.length,
			totalPosts: blogPosts.length,
			systemHealth: "good" as const,
		}) || [];

	const actions = (
		<div className="flex items-center gap-3">
			<Button
				asChild
				className="transition-colors hover:border-secondary/30 hover:bg-secondary/10"
				size="sm"
				variant="outline"
			>
				<Link href="/dashboard/settings">
					<Settings className="mr-2 h-4 w-4" />
					Configuración
				</Link>
			</Button>
			<Button
				asChild
				className="bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary/50"
				size="sm"
			>
				<Link href="/dashboard/properties/new">
					<Plus className="mr-2 h-4 w-4" />
					Agregar Propiedad
				</Link>
			</Button>
		</div>
	);

	return (
		<RouteGuard requiredPermission="dashboard.access">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Panel de control principal"
				headerExtras={
					<StatsCards
						className="mb-4"
						isLoading={isLoading}
						stats={statsCards}
					/>
				}
				title="Dashboard"
			>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Quick Actions */}
					<div className="md:col-span-2 lg:col-span-1">
						<QuickActions />
					</div>

					{/* Property Chart */}
					<div className="md:col-span-2 lg:col-span-2">
						<PropertyChart />
					</div>

					{/* Recent Activity */}
					<div className="md:col-span-2 lg:col-span-3">
						<RecentActivity />
					</div>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
