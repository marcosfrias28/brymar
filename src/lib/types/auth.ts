/**
 * Authentication and user-related types consolidating all user DTOs
 */

import { BaseEntity, ActionResult, Language, Currency } from "./shared";

export type UserRole = "admin" | "editor" | "super_admin" | "user" | "agent";

export interface UserPreferences {
    notifications?: {
        email: boolean;
        push: boolean;
        marketing: boolean;
    };
    privacy?: {
        profileVisible: boolean;
        showEmail: boolean;
        showPhone: boolean;
    };
    display?: {
        theme: "light" | "dark" | "system";
        language: Language;
        currency: Currency;
    };
}

export interface User extends BaseEntity {
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    role: UserRole;
    emailVerified?: Date;
    phoneVerified?: Date;
    preferences: UserPreferences;
    lastLoginAt?: Date;
    isActive: boolean;
}

export interface CreateUserInput {
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: UserRole;
    preferences?: UserPreferences;
}

export interface UpdateUserProfileInput {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    preferences?: UserPreferences;
}

export interface AuthenticateUserInput {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface SignUpInput {
    email: string;
    password: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface VerifyEmailInput {
    token: string;
}

export interface SendVerificationOTPInput {
    email: string;
}

export interface VerifyOTPInput {
    email: string;
    otp: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface Session {
    user: User;
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
}

// Notification types
export interface Notification extends BaseEntity {
    userId: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    readAt?: Date;
    actionUrl?: string;
}

export interface MarkNotificationAsReadInput {
    id: string;
}

export interface MarkAllNotificationsAsReadInput {
    userId: string;
}

// Favorite types
export interface Favorite extends BaseEntity {
    userId: string;
    itemId: string;
    itemType: "property" | "land" | "blog";
}

export interface AddFavoriteInput {
    itemId: string;
    itemType: "property" | "land" | "blog";
}

export interface RemoveFavoriteInput {
    itemId: string;
    itemType: "property" | "land" | "blog";
}

// Action result types
export type CreateUserResult = ActionResult<User>;
export type UpdateUserProfileResult = ActionResult<User>;
export type AuthenticateUserResult = ActionResult<Session>;
export type SignUpResult = ActionResult<User>;
export type ForgotPasswordResult = ActionResult<void>;
export type ResetPasswordResult = ActionResult<void>;
export type VerifyEmailResult = ActionResult<void>;
export type SendVerificationOTPResult = ActionResult<void>;
export type VerifyOTPResult = ActionResult<void>;
export type ChangePasswordResult = ActionResult<void>;
export type GetCurrentUserResult = ActionResult<User>;
export type SignOutResult = ActionResult<void>;
export type MarkNotificationAsReadResult = ActionResult<Notification>;
export type MarkAllNotificationsAsReadResult = ActionResult<void>;
export type AddFavoriteResult = ActionResult<Favorite>;
export type RemoveFavoriteResult = ActionResult<void>;