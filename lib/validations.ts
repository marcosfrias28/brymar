import { z } from 'zod';
import { User } from './db/schema';
import { getUser } from '../app/actions/auth-actions';

// Base ActionState
export type BaseActionState = {
    error?: string;
    success?: boolean;
    message?: string;
};

// Specific action states
export type SignInActionState = BaseActionState & {
    user?: User;
    redirect?: boolean;
    url?: string;
};

export type SignUpActionState = BaseActionState & {
    user?: User;
    redirect?: boolean;
    url?: string;
};

export type ForgotPasswordActionState = BaseActionState;

export type ResetPasswordActionState = BaseActionState & {
    redirect?: boolean;
    url?: string;
};

export type VerifyEmailActionState = BaseActionState & {
    redirect?: boolean;
    url?: string;
};

export type SendVerificationActionState = BaseActionState;

// Legacy type for backward compatibility
export type ActionState = BaseActionState & {
    [key: string]: any;
};

type ValidatedActionFunction<T> = (
    formData: FormData
) => Promise<T>;

export function validatedAction<T>(
    schema: z.ZodType<any, any>,
    action: ValidatedActionFunction<T>
) {
    return async (formData: FormData): Promise<T> => {
        const result = schema.safeParse(Object.fromEntries(formData));
        if (!result.success) {
            return { error: result.error.errors[0].message } as T;
        }

        return action(formData);
    };
}

type ValidatedActionWithUserFunction<T> = (
    formData: FormData,
    user: User
) => Promise<T>;

export function validatedActionWithUser<T>(
    schema: z.ZodType<any, any>,
    action: ValidatedActionWithUserFunction<T>
) {
    return async (formData: FormData): Promise<T> => {
        const user = await getUser();
        if (!user) {
            throw new Error('User is not authenticated');
        }

        const result = schema.safeParse(Object.fromEntries(formData));
        if (!result.success) {
            return { error: result.error.errors[0].message } as T;
        }

        return action(formData, user);
    };
}