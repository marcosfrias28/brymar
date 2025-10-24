/**
 * Profile-related server actions
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "@/lib/db/drizzle";
import { users, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ActionState } from "@/lib/validations";

export interface ProfileFormData {
	name?: string;
	email?: string;
	avatar?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	location?: string;
	website?: string;
	bio?: string;
}

export async function updateProfileAction(
	prevState: ActionState<{ success: boolean; message: string }>,
	formData: FormData
): Promise<ActionState<{ success: boolean; message: string }>> {
	try {
		// Better Auth server action authentication - use the same pattern as middleware
		const headersList = await headers();
		const session = await auth.api.getSession({
			headers: headersList,
		});

		console.log("Session retrieved:", {
			hasSession: !!session,
			hasUser: !!session?.user,
			userId: session?.user?.id,
		});

		if (!session?.user) {
			console.log("No session found, returning auth error");
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

		console.log("Profile update attempt:", {
			userId: session.user.id,
			name,
			email,
			avatar,
		});

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
						email: email,
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
					firstName: firstName,
					lastName: lastName,
					phone: phone,
					location: location,
					website: website,
					bio: bio,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: userProfiles.userId,
					set: {
						firstName: firstName,
						lastName: lastName,
						phone: phone,
						location: location,
						website: website,
						bio: bio,
						updatedAt: new Date(),
					},
				});

			console.log("Profile updated successfully using Better Auth API");
		} catch (updateError) {
			console.error("Better Auth update error:", updateError);
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
	} catch (error) {
		console.error("Error updating profile:", error);
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
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return null;
	}
}
