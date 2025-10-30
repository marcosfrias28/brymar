import { render } from "@react-email/render";
import { EmailVerificationEmail } from "./email-verification";
import { ForgotPasswordEmail } from "./forgot-password";
import { WelcomeEmail } from "./welcome";

export const renderForgotPasswordEmail = (props: {
	userName?: string;
	resetUrl: string;
}) => render(ForgotPasswordEmail(props));

export const renderWelcomeEmail = (props: {
	userName: string;
	dashboardUrl?: string;
}) => render(WelcomeEmail(props));

export const renderEmailVerificationEmail = (props: {
	userName: string;
	verificationUrl: string;
}) => render(EmailVerificationEmail(props));
