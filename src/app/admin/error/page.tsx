import Link from "next/link";

export const metadata = {
  title: "Admin System Error — Devix",
  description: "Temporary failure verifying admin credentials.",
};

export default function AdminErrorPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 text-white selection:bg-[#C8A96E]/30 selection:text-white">
      {/* Subtle Grain & Light Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black opacity-20" />

      <div className="relative w-full max-w-md border border-zinc-800 bg-[#0F0F0F] p-8 text-center transition-all duration-300 md:p-12">
        {/* Eyebrow */}
        <span className="mb-6 block text-[11px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
          System Diagnostics
        </span>

        {/* Title */}
        <h1 className="font-display mb-4 text-2xl font-light tracking-wide text-zinc-100 md:text-3xl">
          Connection Interrupted
        </h1>

        {/* Description */}
        <p className="mb-10 font-sans text-sm leading-relaxed text-zinc-400">
          The server could not verify your administrator authorization status.
          This might be due to a temporary database timeout or maintenance.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href="/admin"
            className="block w-full bg-[#C8A96E] py-4 font-sans text-xs font-medium tracking-[0.2em] text-black uppercase transition-colors duration-300 hover:bg-[#B6965C]"
          >
            Try Again
          </a>
          <Link
            href="/admin/login"
            className="block w-full border border-zinc-800 bg-transparent py-4 font-sans text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase transition-colors duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
