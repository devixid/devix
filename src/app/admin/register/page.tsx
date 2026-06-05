"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerAdmin } from "@/actions/admin/auth";
import Link from "next/link";

function RegisterContent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);

        await registerAdmin(formData);

        setSuccessMessage("Registration successful! You can now login.");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(
            err.message || "An unexpected error occurred. Please try again.",
          );
          console.error("Register unexpected error:", err);
        }
      }
    });
  };

  return (
    <div className="relative z-10 w-full max-w-md border border-zinc-800 bg-[#0F0F0F] p-8 transition-all duration-300 md:p-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Devix Operations
        </span>
        <h1 className="font-display text-2xl font-light tracking-wide text-zinc-100 md:text-3xl">
          Register Admin
        </h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 border-l border-red-500 bg-red-950/20 p-4 font-sans text-xs leading-relaxed text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 border-l border-[#C8A96E] bg-[#C8A96E]/10 p-4 font-sans text-xs leading-relaxed text-[#C8A96E]">
          {successMessage}
        </div>
      )}

      {/* Register Form */}
      <form
        onSubmit={handleRegister}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="block text-[11px] font-medium tracking-wider text-zinc-400 uppercase"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isPending}
              placeholder="John"
              className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors duration-300 focus:border-[#C8A96E] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="block text-[11px] font-medium tracking-wider text-zinc-400 uppercase"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isPending}
              placeholder="Doe"
              className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors duration-300 focus:border-[#C8A96E] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-[11px] font-medium tracking-wider text-zinc-400 uppercase"
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
            className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors duration-300 focus:border-[#C8A96E] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-[11px] font-medium tracking-wider text-zinc-400 uppercase"
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
            className="w-full rounded-none border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors duration-300 focus:border-[#C8A96E] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 bg-[#C8A96E] py-4 font-sans text-xs font-medium tracking-[0.2em] text-black uppercase transition-colors duration-300 hover:bg-[#B6965C] disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isPending ? "Registering..." : "Register"}
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase transition-colors hover:text-[#C8A96E]"
          >
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 text-white selection:bg-[#C8A96E]/30 selection:text-white">
      {/* Background Decorative Grain/Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black opacity-20" />
      <Suspense
        fallback={
          <div className="text-xs tracking-widest text-zinc-500 uppercase">
            Loading interface...
          </div>
        }
      >
        <RegisterContent />
      </Suspense>
    </div>
  );
}
