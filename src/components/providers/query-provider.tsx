"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { getQueryClient } from "@/lib/query/client";
import { NotificationProvider } from "./notification-provider";

type QueryProviderProps = {
	children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
	// Create a stable QueryClient instance
	const [queryClient] = useState(() => getQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<NotificationProvider>
				{children}
				{/* Only show devtools in development */}
				{process.env.NODE_ENV === "development" && (
					<ReactQueryDevtools
						buttonPosition="bottom-left"
						initialIsOpen={false}
					/>
				)}
			</NotificationProvider>
		</QueryClientProvider>
	);
}
