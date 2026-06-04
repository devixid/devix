"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
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
      setErrorMessage("Access denied. Your email is not whitelisted as an administrator.");
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
        const supabase = createSupabaseBrowser();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        // Successfully authenticated, redirect to /admin.
        // Middleware will perform the whitelist check and cache it in the cookie.
        router.push("/admin");
        router.refresh();
      } catch (err) {
        setErrorMessage("An unexpected error occurred. Please try again.");
        console.error("Login unexpected error:", err);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center px-6 relative overflow-hidden text-white selection:bg-[#C8A96E]/30 selection:text-white">
      {/* Background Decorative Grain/Gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black" />

      <div className="relative w-full max-w-md border border-zinc-800 bg-[#0F0F0F] p-8 md:p-12 transition-all duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-zinc-500 block mb-3">
            Devix Operations
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-light tracking-wide text-zinc-100">
            Control Panel Login
          </h1>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/20 border-l border-red-500 text-red-400 text-xs font-sans leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
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
              className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8A96E] transition-colors duration-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
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
              className="w-full bg-[#141414] border border-zinc-800 rounded-none px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8A96E] transition-colors duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#C8A96E] hover:bg-[#B6965C] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-sans font-medium text-xs uppercase tracking-[0.2em] py-4 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {isPending ? "Verifying..." : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
