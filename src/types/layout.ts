import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
	label: string;
	href?: string;
	icon?: React.ComponentType<{ className?: string }>;
};

export type StatCard = {
	title: string;
	value: string | number;
	change?: string;
	icon: LucideIcon;
	color?: string;
	description?: string;
};

export type FilterTab = {
	label: string;
	value: string;
	count?: number;
	active?: boolean;
	onClick?: () => void;
};

export type DashboardPageLayoutProps = {
	title: string;
	description?: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: ReactNode;
	headerExtras?: ReactNode; // Slot para contenidos de cabecera (stats, filtros, etc.)
	children: ReactNode;
	sidebar?: ReactNode;
	className?: string;
	contentClassName?: string;
	showSearch?: boolean;
	searchPlaceholder?: string;
	// Unified stats support rendered inside PageHeader
	stats?: StatCard[];
	statsLoading?: boolean;
};

export type PageHeaderProps = {
	title: string;
	description?: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: ReactNode;
	children?: ReactNode;
	showSearch?: boolean;
	searchPlaceholder?: string;
	className?: string;
	// Stats passed as objects to be rendered in the header
	stats?: StatCard[];
	statsLoading?: boolean;
};

export type ContentGridProps = {
	children: ReactNode;
	layout?: "single" | "two-column" | "three-column" | "grid";
	sidebar?: ReactNode;
	className?: string;
};

export type LayoutConfig = {
	showBreadcrumbs: boolean;
	showActions: boolean;
	contentLayout: "single" | "two-column" | "three-column" | "grid";
	spacing: "compact" | "normal" | "relaxed";
	theme: {
		useSecondaryAccents: boolean;
		headerStyle: "minimal" | "standard" | "prominent";
	};
};
