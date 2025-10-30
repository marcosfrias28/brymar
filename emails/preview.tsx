import { EmailVerificationEmail } from "../src/lib/email-templates/email-verification";
import { ForgotPasswordEmail } from "../src/lib/email-templates/forgot-password";
import { WelcomeEmail } from "../src/lib/email-templates/welcome";

// Preview data for development
const previewData = {
	userName: "María García",
	resetUrl: "https://arbry.com/reset-password?token=abc123",
	dashboardUrl: "https://arbry.com/dashboard",
	verificationUrl: "https://arbry.com/verify-email?token=xyz789",
};

// Export templates for react-email preview
export const ForgotPassword = () => (
	<ForgotPasswordEmail
		resetUrl={previewData.resetUrl}
		userName={previewData.userName}
	/>
);

export const Welcome = () => (
	<WelcomeEmail
		dashboardUrl={previewData.dashboardUrl}
		userName={previewData.userName}
	/>
);

export const EmailVerification = () => (
	<EmailVerificationEmail
		userName={previewData.userName}
		verificationUrl={previewData.verificationUrl}
	/>
);
