"use client";

import { Suspense, useEffect, useState } from "react";
import { getCsrfToken, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CredentialsSignin: "Invalid email or password.",
  google:
    "Google sign-in failed after you chose your account. Check: (1) Client Secret in Google Console has no extra spaces, (2) OAuth consent screen – add your email as a test user if the app is in Testing.",
  Default: "Sign-in failed. Try again or use the same URL you opened the app with (e.g. http://localhost:3000).",
};

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  useEffect(() => {
    getCsrfToken().then((v) => setCsrfToken(v ?? null));
  }, []);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCredentialsError("");
    setCredentialsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        setCredentialsError(ERROR_MESSAGES.CredentialsSignin);
        return;
      }
      if (result?.ok && result?.url) {
        window.location.href = result.url;
        return;
      }
      setCredentialsError(ERROR_MESSAGES.Default);
    } catch {
      setCredentialsError(ERROR_MESSAGES.Default);
    } finally {
      setCredentialsLoading(false);
    }
  }

  const showError = error ? (ERROR_MESSAGES[error] ?? `${ERROR_MESSAGES.Default} (error: ${error})`) : null;

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
          Sign in with Google or with your email and password.
        </p>
        {registered === "1" && (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            Account created. Sign in below.
          </p>
        )}
        {showError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-left text-sm text-destructive">
            {showError}
          </p>
        )}
        {credentialsError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-left text-sm text-destructive">
            {credentialsError}
          </p>
        )}

        {/* Email / password */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" variant="default" className="w-full" size="lg" disabled={credentialsLoading}>
            {credentialsLoading ? "Signing in…" : "Sign in with email"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
            <span className="bg-card/80 px-2">Or</span>
          </div>
        </div>

        {/* Google */}
        <form
          method="post"
          action="/api/auth/signin/google"
          className="w-full"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {csrfToken && <input type="hidden" name="csrfToken" value={csrfToken} />}
          <Button type="submit" variant="outline" className="w-full" size="lg" disabled={!csrfToken}>
            Sign in with Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Create account
          </Link>
        </p>

        <p className="text-muted-foreground text-xs">
          In Google Cloud Console, add this exact redirect URI:{" "}
          <strong className="break-all">{getRedirectUriHint() || "…/api/auth/callback/google"}</strong>
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
