"use client";

import { LoginWrapper } from "@/components/auth/login-wrapper";


export default function Error() {
  return (
    <LoginWrapper>
      <div className="text-black dark:text-white text-9xl font-black [&>:h1]:italic">
        <h1>404...</h1>
        <p className="text-3xl">Oops, something went wrong.</p>
      </div>
    </LoginWrapper>
  );
}