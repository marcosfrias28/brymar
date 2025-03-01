"use client";

import { LoginWrapper } from "./(auth)/login-wrapper";

export default function NotFound() {
  return (
    <LoginWrapper>
      <div className="text-black dark:text-white text-9xl font-black [&>:h1]:italic">
        <h1>404...</h1>
        <p className="text-3xl">
          'This is not the page you are looking for...'
        </p>
      </div>
    </LoginWrapper>
  );
}
