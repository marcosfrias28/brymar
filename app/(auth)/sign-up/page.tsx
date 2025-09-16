import { SignUpForm } from "@/components/auth/signup-form";
import { AuthWrapperLayout } from "@/components/auth/auth-wrapper-layout";

export default function SignUpPage() {
  return (
    <AuthWrapperLayout>
      <SignUpForm />
    </AuthWrapperLayout>
  );
}