import { type NextRequest, NextResponse } from "next/server";
import { getUserActivities } from "@/lib/actions/activities";
import { auth } from "@/lib/auth/auth";
import * as logger from "@/lib/logger";

export async function GET(request: NextRequest) {
	try {
		// Get current session
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
		const offset = Number.parseInt(searchParams.get("offset") || "0", 10);
		const type = searchParams.get("type") || undefined;
		const startDate = searchParams.get("startDate")
			? new Date(searchParams.get("startDate")!)
			: undefined;
		const endDate = searchParams.get("endDate")
			? new Date(searchParams.get("endDate")!)
			: undefined;

		// Get activities
		const result = await getUserActivities(session.user.id, {
			limit,
			offset,
			type,
			startDate,
			endDate,
		});

		if (!result.success) {
			await logger.error("Get activities API error", result.error, {
				userId: session.user.id,
			});
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		await logger.info("Activities API success", {
			userId: session.user.id,
			count: result.data?.activities?.length || 0,
		});

		return NextResponse.json(result.data || { activities: [] });
	} catch (error) {
		await logger.error("Activities API error", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
