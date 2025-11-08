import EmailVerificationEmail from "../src/lib/email-templates/components/email-verification.tsx";
import ForgotPasswordEmail from "../src/lib/email-templates/components/forgot-password.tsx";
import WelcomeEmail from "../src/lib/email-templates/components/welcome.tsx";

// Preview data for development
const previewData = {
	username: "María García",
	resetPasswordUrl:
		"https://marbryinmobiliaria.com/reset-password?token=abc123",
	loginUrl: "https://marbryinmobiliaria.com/dashboard",
	verificationUrl: "https://marbryinmobiliaria.com/verify-email?token=xyz789",
};

// Export templates for react-email preview
export const ForgotPassword = () => (
	<ForgotPasswordEmail
		resetPasswordUrl={previewData.resetPasswordUrl}
		username={previewData.username}
	/>
);

export const Welcome = () => (
	<WelcomeEmail
		loginUrl={previewData.loginUrl}
		username={previewData.username}
	/>
);

export const EmailVerification = () => (
	<EmailVerificationEmail
		username={previewData.username}
		verificationUrl={previewData.verificationUrl}
	/>
);
