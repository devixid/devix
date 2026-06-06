import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getNavBadges } from "@/actions/admin";
import { verifyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: Props) {
  try {
    await verifyAdminSession();
  } catch {
    redirect("/admin");
  }

  const badges = await getNavBadges();

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0A0A] md:flex-row">
      {/* Sidebar */}
      <AdminSidebar badges={badges} />

      {/* Main Content Pane */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <main className="flex-1 p-6 md:p-10 lg:p-12">{children}</main>
      </div>
    </div>
  );
}
