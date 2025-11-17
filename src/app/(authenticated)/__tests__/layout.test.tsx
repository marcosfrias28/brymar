import type React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardLayout from "@/app/(authenticated)/layout";
import { AuthProvider } from "@/components/providers/auth-provider";

jest.mock("@/lib/auth/auth-client", () => ({
	authClient: {
		getSession: jest.fn(),
	},
}));
jest.mock("@/hooks/use-auth-actions", () => ({
	useSignIn: () => ({
		mutateAsync: jest.fn().mockResolvedValue({ success: true }),
	}),
	useSignOut: () => ({
		mutateAsync: jest.fn().mockResolvedValue({ success: true }),
	}),
	useUpdateUserProfile: () => ({
		mutateAsync: jest.fn().mockResolvedValue({ success: true }),
	}),
}));

function wrapper(children: React.ReactNode) {
	const client = new QueryClient();
	return (
		<QueryClientProvider client={client}>
			<AuthProvider>{children}</AuthProvider>
		</QueryClientProvider>
	);
}

describe("(authenticated)/layout route protection", () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it("shows access denied when unauthenticated", async () => {
		const { authClient } = require("@/lib/auth/auth-client");
		authClient.getSession.mockResolvedValue({ user: null });

		render(
			wrapper(
				<DashboardLayout>
					<div>Private</div>
				</DashboardLayout>
			)
		);

		await waitFor(() => {
			expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
		});
	});

	it("renders children when authenticated", async () => {
		const { authClient } = require("@/lib/auth/auth-client");
		authClient.getSession.mockResolvedValue({
			user: { id: "u1", email: "x@y.com", name: "User" },
		});

		render(
			wrapper(
				<DashboardLayout>
					<div>Private</div>
				</DashboardLayout>
			)
		);

		await waitFor(() => {
			expect(screen.getByText("Private")).toBeInTheDocument();
		});
	});
});
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
render(
	wrapper(
		<DashboardLayout>
			<div>Private</div>
		</DashboardLayout>
	)
);

await waitFor(() => {
	expect(screen.getByText("Private")).toBeInTheDocument();
});
})
})
jest.mock("@/components/navigation/unified-sidebar", () => ({
	UnifiedSidebar: () => <div />,
}));
jest.mock("@/components/site-header", () => ({
	SiteHeader: () => <div />,
}));
