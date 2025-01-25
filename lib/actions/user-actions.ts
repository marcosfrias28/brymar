"use server";

import { put } from "@vercel/blob";
import { auth } from "../auth/auth";
import { validatedAction } from "../validations";
import { z } from "zod";
import { BetterCallAPIError } from "@/utils/types/types";
import { headers } from "next/headers";
import { User } from "../db/schema";

const signInSchema = z.object({
    email: z.string().email().min(3).max(255).describe('Email must be valid'),
    password: z.string().min(8).max(100).describe('Password must be at least 8 characters long'),
});

export const signIn = validatedAction(signInSchema,
    async (_: any, formData: FormData) => {
        const email = formData.get("email") as string | null;
        const password = formData.get("password") as string | null;

        if (!email || !password) {
            return { error: "All fields are required" };
        }

        try {
            const data = await auth.api.signInEmail({
                method: "POST",
                body: {
                    email,
                    password,
                },
            })
            if (!data?.user) return { error: "Error during authentication" };
            return { success: true, redirect: true, url: '/dashboard/properties', message: 'You has been logged in successfully' }
        } catch (error) {
            const Error = error as BetterCallAPIError
            return { error: Error?.body?.message || "Error during authentication" };
        }
    });

const signUpSchema = z.object({
    email: z.string().email().min(3).max(255),
    password: z.string().min(8).max(100),
    name: z.string().min(3).max(100),
    image: z.instanceof(File),
});


export const signUp = validatedAction(signUpSchema, async (_: any, formData: FormData) => {
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const name = formData.get("name") as string | null;
    const image = formData.get("image") as File | null;
    let imageUrl = null;
    if (!email || !password || !name || !image) {
        return { error: "All fields are required" };
    }
    try {
        let { url } = await put(`user/${email}`, image, { access: "public" });
        imageUrl = url;
    } catch (error) {
        return { error: "Error during image upload" };
    }

    if (imageUrl) {
        try {
            await auth.api.signUpEmail({
                method: "POST",
                body: {
                    email,
                    password,
                    name,
                    image: imageUrl
                },
            })
            return { success: true, redirect: true, url: `/verify-email?email=${email}`, message: 'Verification email sent successfully' }
        }
        catch (error) {
            const Error = error as BetterCallAPIError
            return { error: Error.body.message || "Error during authentication" };
        }
    }
});

export const getUser = async () => {
    const data = await auth.api.getSession({
        headers: await headers(),
    }) as unknown as { user: User | null };
    if (!data?.user) return null;
    return data.user;
}

const signOutSchema = z.object({
    redirect: z.string().optional(),
});

export const signOut = validatedAction(signOutSchema, async (_: any, formData: FormData) => {
    try {
        await auth.api.signOut({
            method: "POST",
            headers: await headers(),
        });

        return { success: true, redirect: true, url: `/`, message: 'You have been logged out successfully' }
    } catch (error) {
        const Error = error as BetterCallAPIError
        return { error: Error.body.message || "Error during authentication" };
    }
});


const forgotPasswordScherma = z.object({
    email: z.string().email().min(3).max(255).describe('Email must be valid'),
})

export const forgotPassword = validatedAction(forgotPasswordScherma, async (_: any, formData: FormData) => {
    const email = formData.get("email") as string | null;

    if (!email) {
        return { error: "All fields are required" };
    }

    try {
        await auth.api.forgetPassword({
            method: "POST",
            body: {
                email,
                redirectTo: '/dashboard/properties',
            },
        })
        return { success: true, message: 'Reset password link sent successfully' }
    } catch (error) {
        const Error = error as BetterCallAPIError
        return { error: Error.body.message || "Error during authentication" };
    }
});