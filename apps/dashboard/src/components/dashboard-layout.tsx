import { authState } from "@/features/auth";
import { cn } from "@/utils";
import { Outlet } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { memo } from "react";
import { Helmet } from "react-helmet-async";
import SideNavigation from "./sidebar-navigation";

const DashboardLayout = () => {
  const { isAuthenticated } = useAtomValue(authState);

  return isAuthenticated ? (
    <>
      <Helmet>
        <title>Devix.id Dashboard</title>
      </Helmet>

      <div className={cn("relative h-screen", "flex flex-row")}>
        <SideNavigation />

        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </>
  ) : (
    <Outlet />
  );
};

export default memo(DashboardLayout);
