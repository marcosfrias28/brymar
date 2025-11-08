/**
 * Authentication and user-related types consolidating all user DTOs
 */

import type { ActionResult, BaseEntity, Currency, Language } from "./shared";

export type UserRole = "admin" | "editor" | "super_admin" | "user" | "agent";

export type UserPreferences = {
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
};

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

export type CreateUserInput = {
	email: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	role?: UserRole;
	preferences?: UserPreferences;
};

export type UpdateUserProfileInput = {
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
};

export type AuthenticateUserInput = {
	email: string;
	password: string;
	rememberMe?: boolean;
};

export type SignUpInput = {
	email: string;
	password: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
};

export type ForgotPasswordInput = {
	email: string;
};

export type ResetPasswordInput = {
	token: string;
	password: string;
	confirmPassword: string;
};

export type VerifyEmailInput = {
	token: string;
};

export type SendVerificationOTPInput = {
	email: string;
	username: string;
};

export type VerifyOTPInput = {
	email: string;
	otp: string;
};

export type ChangePasswordInput = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export type Session = {
	user: User;
	accessToken: string;
	refreshToken?: string;
	expiresAt: Date;
};

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

export type MarkNotificationAsReadInput = {
	id: string;
};

export type MarkAllNotificationsAsReadInput = {
	userId: string;
};

// Favorite types
export interface Favorite extends BaseEntity {
	userId: string;
	itemId: string;
	itemType: "property" | "land" | "blog";
}

export type AddFavoriteInput = {
	itemId: string;
	itemType: "property" | "land" | "blog";
};

export type RemoveFavoriteInput = {
	itemId: string;
	itemType: "property" | "land" | "blog";
};

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
