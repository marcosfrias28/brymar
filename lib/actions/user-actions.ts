'use server'

import { eq } from 'drizzle-orm'
import db from '../db/drizzle'
import { users, accounts } from '../db/schema'
import { validatedAction } from '../validations'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import type { ActionState } from '../validations'

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
})

export const signIn = validatedAction(
  signInSchema,
  async (data: { email: string; password: string }): Promise<ActionState> => {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1)

      if (existingUser.length === 0) {
        return { error: 'Invalid email or password' }
      }

      // Find the account with password for this user
      const userAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, existingUser[0].id))
        .limit(1)

      if (userAccount.length === 0 || !userAccount[0].password) {
        return { error: 'Invalid email or password' }
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(data.password, userAccount[0].password)

      if (!isPasswordValid) {
        return { error: 'Invalid email or password' }
      }

      return {
        success: true,
        message: 'Signed in successfully',
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An error occurred during sign in' }
    }
  }
)

const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
})

export const signUp = validatedAction(
  signUpSchema,
  async (data: { email: string; password: string; name: string }): Promise<ActionState> => {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1)

      if (existingUser.length > 0) {
        return { error: 'User with this email already exists' }
      }

      // Generate user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(data.password, 12)

      // Create user record
      await db.insert(users).values({
        id: userId,
        email: data.email,
        name: data.name,
        role: 'user', // Default role
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Create account record with hashed password
      const accountId = crypto.randomUUID();
      await db.insert(accounts).values({
        id: accountId,
        userId: userId,
        accountId: data.email, // Use email as account identifier
        providerId: 'email', // Email/password provider
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return {
        success: true,
        message: 'Account created successfully',
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'An error occurred during sign up' }
    }
  }
)

export const signOut = async (): Promise<ActionState> => {
  try {
    // Here you would typically clear the session/cookies
    // This depends on your authentication implementation
    revalidatePath('/')
    return {
      success: true,
      message: 'Signed out successfully',
    }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'An error occurred during sign out' }
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255),
})

export const forgotPassword = validatedAction(
  forgotPasswordSchema,
  async (data: { email: string }): Promise<ActionState> => {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1)

      if (existingUser.length === 0) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        }
      }

      // Here you would typically generate a reset token and send an email
      // For now, we'll just return a success message
      return {
        success: true,
        message: 'Password reset link sent to your email',
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return { error: 'An error occurred while processing your request' }
    }
  }
)

export const getCurrentUser = async () => {
  try {
    // This would typically get the current user from session/cookies
    // For now, return null as we don't have session management implemented
    return null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const getUser = async (id: string) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return user.length > 0 ? user[0] : null
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
})

export const updateUser = validatedAction(
  updateUserSchema,
  async (data: { id: string; name?: string; email?: string }): Promise<ActionState> => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      }

      if (data.name) updateData.name = data.name
      if (data.email) updateData.email = data.email

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, data.id))

      revalidatePath('/dashboard')
      return {
        success: true,
        message: 'User updated successfully',
      }
    } catch (error) {
      console.error('Update user error:', error)
      return { error: 'An error occurred while updating user' }
    }
  }
)

export const deleteUser = async (id: string): Promise<ActionState> => {
  try {
    await db.delete(users).where(eq(users.id, id))

    revalidatePath('/dashboard')
    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    console.error('Delete user error:', error)
    return { error: 'An error occurred while deleting user' }
  }
}