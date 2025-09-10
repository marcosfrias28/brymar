"use client";

import { LoginWrapper } from "../login-wrapper";
import { useLangStore } from "@/utils/store/lang-store";
import { VerifyEmailTranslations as translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
  const language = useLangStore((prev) => prev.language);
  const params = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const token = params?.get("token");
  const callbackURL = params?.get("callbackURL");
  const email = params?.get("email");

  const { title, subtitle } = translations[language];

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;
    
    setVerificationStatus('loading');
    
    try {
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL || '/dashboard/properties')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setVerificationStatus('success');
        setTimeout(() => {
          router.push(callbackURL || '/dashboard/properties');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setVerificationStatus('error');
        setErrorMessage(errorData.message || 'Verification failed');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error?.message || 'Network error occurred');
    }
  };

  if (!language || !translations[language]) return null;

  const renderContent = () => {
    if (token) {
      switch (verificationStatus) {
        case 'loading':
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
              </div>
              <h1 className="text-4xl font-black text-center">Verifying...</h1>
              <p className="text-lg text-pretty text-center">Please wait while we verify your email address.</p>
            </>
          );
        case 'success':
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-4xl font-black text-center text-green-600">Email Verified!</h1>
              <p className="text-lg text-pretty text-center">Your email has been successfully verified. Redirecting you to the dashboard...</p>
            </>
          );
        case 'error':
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-4xl font-black text-center text-red-600">Verification Failed</h1>
              <p className="text-lg text-pretty text-center text-red-500">{errorMessage}</p>
              <Button 
                onClick={() => router.push('/sign-in')} 
                className="w-full mt-4"
              >
                Go to Sign In
              </Button>
            </>
          );
        default:
          return (
            <>
              <h1 className="text-4xl font-black">{title}</h1>
              <p className="text-lg text-pretty">{subtitle}</p>
            </>
          );
      }
    }
    
    return (
      <>
        <h1 className="text-4xl font-black">{title}</h1>
        <p className="text-lg text-pretty">{subtitle}</p>
        {email && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verification email sent to: <strong>{email}</strong>
          </p>
        )}
      </>
    );
  };

  return (
    <LoginWrapper>
      <div
        className={cn(
          "space-y-6 max-w-md p-10 rounded-lg shadow-2xl shadow-black/40 dark:shadow-white/10",
          "backdrop-blur-xs backdrop-saturate-180 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10",
          "text-gray-800 dark:text-gray-100"
        )}
      >
        {renderContent()}
      </div>
    </LoginWrapper>
  );
};

export default VerifyEmailPage;
