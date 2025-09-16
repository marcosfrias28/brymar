import { SignInForm } from "@/components/auth/signin-form";
import { AuthWrapperLayout } from "@/components/auth/auth-wrapper-layout";

export default function SignInPage() {
  return (
    <AuthWrapperLayout>
      <SignInForm />
    </AuthWrapperLayout>
  );
}