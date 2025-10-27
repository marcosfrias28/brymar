import { render } from "@react-email/render";
import { ForgotPasswordEmail } from "./forgot-password";
import { WelcomeEmail } from "./welcome";
import { EmailVerificationEmail } from "./email-verification";

export const renderForgotPasswordEmail = (props: {
  userName?: string;
  resetUrl: string;
}) => {
  return render(ForgotPasswordEmail(props));
};

export const renderWelcomeEmail = (props: {
  userName: string;
  dashboardUrl?: string;
}) => {
  return render(WelcomeEmail(props));
};

export const renderEmailVerificationEmail = (props: {
  userName: string;
  verificationUrl: string;
}) => {
  return render(EmailVerificationEmail(props));
};