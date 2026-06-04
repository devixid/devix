import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
