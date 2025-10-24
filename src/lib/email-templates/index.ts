// Email Templates Export
export { ForgotPasswordEmail } from "./forgot-password";
export { RegistrationSuccessTemplate } from "./registration-success";
export { VerifyEmailTemplate } from "./verify-email";

// Import for internal use
import { ForgotPasswordEmail } from "./forgot-password";
import { RegistrationSuccessTemplate } from "./registration-success";
import { VerifyEmailTemplate } from "./verify-email";

// Type definitions for email template props
export interface ForgotPasswordProps {
	userName?: string;
	resetUrl: string;
	companyName?: string;
}

export interface VerifyEmailProps {
	userName?: string;
	verificationUrl: string;
	otp?: string;
	companyName?: string;
}

export interface RegistrationSuccessProps {
	userName?: string;
	userEmail: string;
	loginUrl: string;
	companyName?: string;
	dashboardUrl?: string;
}

// Email template types
export type EmailTemplateType =
	| "forgot-password"
	| "verify-email"
	| "registration-success";

// Helper function to get template by type
export const getEmailTemplate = (type: EmailTemplateType) => {
	switch (type) {
		case "forgot-password":
			return ForgotPasswordEmail;
		case "verify-email":
			return VerifyEmailTemplate;
		case "registration-success":
			return RegistrationSuccessTemplate;
		default:
			throw new Error(`Unknown email template type: ${type}`);
	}
};

// Default company configuration
export const DEFAULT_EMAIL_CONFIG = {
	companyName: "Brymar",
	supportEmail: "support@brymar.com",
	logoUrl: "", // Add your logo URL here
	websiteUrl: "https://brymar.com", // Add your website URL here
};
