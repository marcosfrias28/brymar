import { ReactNode } from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface DashboardPageLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    children: ReactNode;
    sidebar?: ReactNode;
    className?: string;
    contentClassName?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
}

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    showSearch?: boolean;
    searchPlaceholder?: string;
    className?: string;
}

export interface ContentGridProps {
    children: ReactNode;
    layout?: 'single' | 'two-column' | 'three-column' | 'grid';
    sidebar?: ReactNode;
    className?: string;
}

export interface LayoutConfig {
    showBreadcrumbs: boolean;
    showActions: boolean;
    contentLayout: 'single' | 'two-column' | 'three-column' | 'grid';
    spacing: 'compact' | 'normal' | 'relaxed';
    theme: {
        useSecondaryAccents: boolean;
        headerStyle: 'minimal' | 'standard' | 'prominent';
    };
}