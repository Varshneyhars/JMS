"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DEMO_CREDENTIALS = [
  { role: "Admin", email: "admin@jms.com", password: "admin123" },
  { role: "Reviewer", email: "reviewer@jms.com", password: "review123" },
  { role: "Author", email: "publisher@jms.com", password: "pub123" },
];

const FEATURES = [
  "Peer Review Management",
  "Multi-role Access",
  "Publication Tracking",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function fillDemo(cred: (typeof DEMO_CREDENTIALS)[0]) {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — dark branding side */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-zinc-950 px-12 py-14">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white">JMS</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>

        {/* Center copy */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-snug text-white">
              Streamline your academic publishing workflow.
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              A unified platform for editors, reviewers, authors, and
              publishers — built for modern academic journals.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg
                    className="h-3 w-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Journal Management System
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-14 lg:w-[55%]">
        {/* Mobile brand */}
        <div className="mb-8 flex items-center justify-between w-full max-w-sm lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-zinc-900">JMS</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pb-8">
              <CardTitle className="text-2xl font-semibold text-zinc-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-9 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error banner */}
                {error && (
                  <div className="rounded-md bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-10">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  Demo accounts
                </p>
                <div className="space-y-2">
                  {DEMO_CREDENTIALS.map((cred) => (
                    <button
                      key={cred.role}
                      type="button"
                      onClick={() => fillDemo(cred)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-zinc-50 focus:outline-none"
                    >
                      <span className="font-medium text-zinc-500">{cred.role}</span>
                      <span className="font-mono text-zinc-400">{cred.email}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 px-2 text-[11px] text-zinc-300">
                  Click any row to autofill credentials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
