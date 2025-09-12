import { LoginWrapper } from "@/components/auth/login-wrapper";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <LoginWrapper>
      <SignUpForm />
    </LoginWrapper>
  );
}