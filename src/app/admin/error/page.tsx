import Link from "next/link";

export const metadata = {
  title: "Admin System Error — Devix",
  description: "Temporary failure verifying admin credentials.",
};

export default function AdminErrorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative overflow-hidden text-white selection:bg-[#C8A96E]/30 selection:text-white">
      {/* Subtle Grain & Light Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black" />
      
      <div className="relative max-w-md w-full border border-zinc-800 bg-[#0F0F0F] p-8 md:p-12 text-center transition-all duration-300">
        {/* Eyebrow */}
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-500 block mb-6">
          System Diagnostics
        </span>

        {/* Title */}
        <h1 className="font-display text-2xl md:text-3xl font-light tracking-wide text-zinc-100 mb-4">
          Connection Interrupted
        </h1>

        {/* Description */}
        <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-10">
          The server could not verify your administrator authorization status. This might be due to a temporary database timeout or maintenance.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href="/admin"
            className="w-full bg-[#C8A96E] hover:bg-[#B6965C] text-black font-sans font-medium text-xs uppercase tracking-[0.2em] py-4 transition-colors duration-300 block"
          >
            Try Again
          </a>
          <Link
            href="/admin/login"
            className="w-full border border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white font-sans font-medium text-xs uppercase tracking-[0.2em] py-4 transition-colors duration-300 block"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
