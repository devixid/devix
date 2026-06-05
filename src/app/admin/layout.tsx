import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-zinc-100 antialiased">
      {children}
    </div>
  );
}
