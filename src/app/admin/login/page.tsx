"use client";

import { Suspense, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAdmin } from "@/actions/admin/auth";
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle URL errors like ?error=unauthorized
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam === "unauthorized") {
      setErrorMessage(
        "Access denied. Your email is not whitelisted as an administrator.",
      );
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        await loginAdmin(formData);

        // Successfully authenticated, redirect to /admin.
        router.push("/admin");
        router.refresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(
            err.message || "An unexpected error occurred. Please try again.",
          );
          console.error("Login unexpected error:", err);
        }
      }
    });
  };

  return (
    <div className="relative w-full max-w-md border border-zinc-200 bg-white p-8 pt-16 transition-all duration-300 md:p-12 md:pt-16 shadow-sm">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="group absolute top-6 left-6 inline-flex items-center gap-x-1.5 text-xs text-zinc-500 hover:text-black-1 transition-colors duration-300"
      >
        <span className="text-[14px] font-medium transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
        <span>Back to Site</span>
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Devix Operations
        </span>
        <h1 className="font-display text-2xl font-light tracking-wide text-zinc-900 md:text-3xl">
          Control Panel Login
        </h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 border-l border-red-500 bg-red-50 p-4 font-sans text-xs leading-relaxed text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-[11px] font-medium tracking-wider text-zinc-500 uppercase"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="name@company.com"
            required
            className="w-full rounded-none border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all duration-300 focus:border-[#C8A96E] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-[11px] font-medium tracking-wider text-zinc-500 uppercase"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
            required
            className="w-full rounded-none border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all duration-300 focus:border-[#C8A96E] focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 bg-[#C8A96E] py-4 font-sans text-xs font-medium tracking-[0.2em] text-black uppercase transition-colors duration-300 hover:bg-[#B6965C] disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          {isPending ? "Verifying..." : "Authenticate"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-6 text-zinc-900 selection:bg-[#C8A96E]/30 selection:text-zinc-900">
      {/* Background Decorative Grain/Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-200 via-zinc-100 to-white opacity-40" />
      <Suspense
        fallback={
          <div className="text-xs tracking-widest text-zinc-400 uppercase">
            Loading interface...
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}

