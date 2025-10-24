"use server";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import db from "@/lib/db/drizzle";
import { userActivities } from "@/lib/db/schema";
import * as logger from "@/lib/logger";
import type { ActionResult } from "@/lib/types";
import { handleActionError } from "@/lib/utils/errors";

export interface ActivityData {
	type: "view" | "favorite" | "search" | "contact" | "message" | "login" | "profile" | "favorites" | "settings";
	title: string;
	description: string;
	details?: string;
	metadata?: Record<string, any>;
}

/**
 * Get user activities with pagination and filtering
 */
export async function getUserActivities(
	userId: string,
	options: {
		limit?: number;
		offset?: number;
		type?: string;
		startDate?: Date;
		endDate?: Date;
	} = {}
): Promise<ActionResult<{
	activities: Array<{
		id: string;
		type: string;
		title: string;
		description: string;
		details?: string;
		metadata?: Record<string, any>;
		timestamp: Date;
		ipAddress?: string;
		userAgent?: string;
	}>;
	total: number;
}>> {
	try {
		const { limit = 50, offset = 0, type, startDate, endDate } = options;

		// Build where conditions
		const conditions = [eq(userActivities.userId, userId)];

		if (type && type !== "all") {
			conditions.push(eq(userActivities.type, type));
		}

		if (startDate) {
			conditions.push(gte(userActivities.createdAt, startDate));
		}

		if (endDate) {
			conditions.push(sql`${userActivities.createdAt} <= ${endDate}`);
		}

		// Get activities with pagination
		const activities = await db
			.select({
				id: userActivities.id,
				type: userActivities.type,
				title: userActivities.title,
				description: userActivities.description,
				details: userActivities.details,
				metadata: userActivities.metadata,
				timestamp: userActivities.createdAt,
				ipAddress: userActivities.ipAddress,
				userAgent: userActivities.userAgent,
			})
			.from(userActivities)
			.where(and(...conditions))
			.orderBy(desc(userActivities.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count
		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(userActivities)
			.where(and(...conditions));

		const total = totalResult[0]?.count || 0;

		await logger.info("User activities retrieved", {
			userId,
			count: activities.length,
			total,
		});

		return {
			success: true,
			data: { activities, total },
		};
	} catch (error) {
		await logger.error("Get user activities error", error, { userId });
		return handleActionError(error);
	}
}

/**
 * Create a new user activity
 */
export async function createUserActivity(
	userId: string,
	activityData: ActivityData
): Promise<ActionResult<{ id: string }>> {
	try {
		// Get request information
		const headersList = await headers();
		const ipAddress = headersList.get("x-forwarded-for") || 
			headersList.get("x-real-ip") || 
			"unknown";
		const userAgent = headersList.get("user-agent") || "unknown";

		// Insert new activity
		const [newActivity] = await db
			.insert(userActivities)
			.values({
				userId,
				type: activityData.type,
				title: activityData.title,
				description: activityData.description,
				details: activityData.details,
				metadata: activityData.metadata,
				ipAddress,
				userAgent,
			})
			.returning({ id: userActivities.id });

		await logger.info("User activity created", {
			userId,
			activityId: newActivity.id,
			type: activityData.type,
		});

		// Revalidate profile page
		revalidatePath("/profile");

		return {
			success: true,
			data: { id: newActivity.id },
		};
	} catch (error) {
		await logger.error("Create user activity error", error, { userId });
		return handleActionError(error);
	}
}

/**
 * Create activity for authenticated user
 */
export async function createActivity(activityData: ActivityData): Promise<ActionResult<{ id: string }>> {
	try {
		// Get current session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				success: false,
				error: "Not authenticated",
			};
		}

		return createUserActivity(session.user.id, activityData);
	} catch (error) {
		await logger.error("Create activity error", error);
		return handleActionError(error);
	}
}

/**
 * Get activity statistics for user
 */
export async function getActivityStats(
	userId: string,
	options: {
		startDate?: Date;
		endDate?: Date;
	} = {}
): Promise<ActionResult<{
	total: number;
	byType: Record<string, number>;
	recentActivity: Date;
}>> {
	try {
		const { startDate, endDate } = options;

		// Build where conditions
		const conditions = [eq(userActivities.userId, userId)];

		if (startDate) {
			conditions.push(gte(userActivities.createdAt, startDate));
		}

		if (endDate) {
			conditions.push(sql`${userActivities.createdAt} <= ${endDate}`);
		}

		// Get total count
		const totalResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(userActivities)
			.where(and(...conditions));

		// Get count by type
		const typeStats = await db
			.select({
				type: userActivities.type,
				count: sql<number>`count(*)`,
			})
			.from(userActivities)
			.where(and(...conditions))
			.groupBy(userActivities.type);

		// Get most recent activity
		const recentResult = await db
			.select({ createdAt: userActivities.createdAt })
			.from(userActivities)
			.where(and(...conditions))
			.orderBy(desc(userActivities.createdAt))
			.limit(1);

		const total = totalResult[0]?.count || 0;
		const byType = typeStats.reduce((acc, stat) => {
			acc[stat.type] = stat.count;
			return acc;
		}, {} as Record<string, number>);
		const recentActivity = recentResult[0]?.createdAt || new Date();

		await logger.info("Activity stats retrieved", {
			userId,
			total,
			byType,
		});

		return {
			success: true,
			data: { total, byType, recentActivity },
		};
	} catch (error) {
		await logger.error("Get activity stats error", error, { userId });
		return handleActionError(error);
	}
}

/**
 * Delete old activities (cleanup function)
 */
export async function cleanupOldActivities(
	daysToKeep: number = 90
): Promise<ActionResult<{ deletedCount: number }>> {
	try {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

		const deletedResult = await db
			.delete(userActivities)
			.where(sql`${userActivities.createdAt} < ${cutoffDate}`)
			.returning({ id: userActivities.id });

		const deletedCount = deletedResult.length;

		await logger.info("Old activities cleaned up", {
			cutoffDate,
			deletedCount,
		});

		return {
			success: true,
			data: { deletedCount },
		};
	} catch (error) {
		await logger.error("Cleanup old activities error", error);
		return handleActionError(error);
	}
}
