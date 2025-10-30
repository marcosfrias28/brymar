/**
 * Profile-related server actions
 */

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { userProfiles, users } from "@/lib/db/schema";
import type { ActionState } from "@/lib/validations";

export type ProfileFormData = {
	name?: string;
	email?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	location?: string;
	website?: string;
	bio?: string;
};

export async function updateProfileAction(
	_prevState: ActionState<{ success: boolean; message: string }>,
	formData: FormData
): Promise<ActionState<{ success: boolean; message: string }>> {
	try {
		// Better Auth server action authentication - use the same pattern as middleware
		const headersList = await headers();
		const session = await auth.api.getSession({
			headers: headersList,
		});

		if (!session?.user) {
			return {
				success: false,
				error: "No estás autenticado",
			};
		}

		// Extract form data
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const avatar = formData.get("avatar") as string;
		const firstName = formData.get("firstName") as string;
		const lastName = formData.get("lastName") as string;
		const phone = formData.get("phone") as string;
		const location = formData.get("location") as string;
		const website = formData.get("website") as string;
		const bio = formData.get("bio") as string;

		// Update user using Better Auth's updateUser method (only fields that Better Auth allows)
		try {
			await auth.api.updateUser({
				body: {
					name: name || session.user.name,
					image: avatar || session.user.image,
				},
				headers: headersList,
			});

			// Update email separately in database if it changed
			if (email && email !== session.user.email) {
				await db
					.update(users)
					.set({
						email,
						updatedAt: new Date(),
						emailVerified: false,
					})
					.where(eq(users.id, session.user.id));
			}

			// Upsert extended profile fields in user_profiles table
			await db
				.insert(userProfiles)
				.values({
					userId: session.user.id,
					firstName,
					lastName,
					phone,
					location,
					website,
					bio,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: userProfiles.userId,
					set: {
						firstName,
						lastName,
						phone,
						location,
						website,
						bio,
						updatedAt: new Date(),
					},
				});
		} catch (_updateError) {
			return {
				success: false,
				error: "Error al actualizar el perfil",
			};
		}

		// Revalidate the profile page cache
		revalidatePath("/profile");

		return {
			success: true,
			data: {
				success: true,
				message: "Perfil actualizado exitosamente",
			},
		};
	} catch (_error) {
		return {
			success: false,
			error: "Error al actualizar el perfil",
		};
	}
}

/**
 * Get user profile data from the user_profiles table
 */
export async function getUserProfile(userId: string) {
	try {
		const profile = await db
			.select()
			.from(userProfiles)
			.where(eq(userProfiles.userId, userId))
			.limit(1);

		return profile[0] || null;
	} catch (_error) {
		return null;
	}
}
