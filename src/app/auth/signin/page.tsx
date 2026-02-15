"use client";

import { Suspense, useEffect, useState } from "react";
import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

function getRedirectUriHint(): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  return `${origin}/api/auth/callback/google`;
}

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Server configuration error. Check NEXTAUTH_URL and Google OAuth settings.",
  AccessDenied: "Access denied.",
  Verification: "Verification failed. The link may have expired.",
  Callback: "Sign-in callback failed. Ensure redirect URI in Google Console is exactly http://localhost:3000/api/auth/callback/google and you open the app at http://localhost:3000.",
  OAuthCallback: "Google sign-in callback failed. Check redirect URI and try again.",
  OAuthSignin: "Sign-in could not start. Use the button below (full page redirect), or try in an incognito window with cookies allowed.",
  google:
    "Google sign-in failed after you chose your account. Check: (1) Client Secret in Google Console has no extra spaces, (2) OAuth consent screen – add your email as a test user if the app is in Testing.",
  Default: "Sign-in failed. Try again or use the same URL you opened the app with (e.g. http://localhost:3000).",
};

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    getCsrfToken().then((v) => setCsrfToken(v ?? null));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-grid-subtle">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-card/80 p-8 text-center shadow-xl shadow-black/20 backdrop-blur-xl">
        <h1 className="text-2xl">
          <Logo />
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          AI survival toolkit for international students in Germany
        </p>
        <p className="text-muted-foreground text-sm">
          Sign in with your Google account to use practice exams and letter scanning.
        </p>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-left text-sm text-destructive">
            {ERROR_MESSAGES[error] ?? `${ERROR_MESSAGES.Default} (error: ${error})`}
          </p>
        )}
        <form
          method="post"
          action="/api/auth/signin/google"
          className="w-full"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {csrfToken && <input type="hidden" name="csrfToken" value={csrfToken} />}
          <Button type="submit" className="w-full" size="lg" disabled={!csrfToken}>
            Sign in with Google
          </Button>
        </form>
        <p className="text-muted-foreground text-xs">
          In Google Cloud Console, add this exact redirect URI: <strong className="break-all">{getRedirectUriHint() || "…/api/auth/callback/google"}</strong>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}
