import { cn } from "@/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { GaugeIcon, BookImageIcon, UsersRoundIcon } from "lucide-react";
import SidebarNavigationProfile from "./profile";

import CloseIcon from "@/assets/icons/ic-plus.svg";

const SideNavigation = () => {
  const location = useLocation();

  const navigationList = [
    {
      title: "Dashboard",
      path: "/dashboard",
      Icon: GaugeIcon,
    },
    {
      title: "Portfolio",
      path: "/dashboard/portfolio",
      Icon: BookImageIcon,
    },
    {
      title: "Users",
      path: "/dashboard/users",
      Icon: UsersRoundIcon,
    },
  ];

  return (
    <div
      className={cn(
        "w-[80%] max-w-[320px] h-screen",
        "fixed top-0 left-0 lg:static",
        "bg-black text-white",
        "flex flex-col",
      )}
    >
      <div
        className={cn(
          "h-12 w-full lg:hidden",
          "mb-4 p-4 lg:p-6",
          "flex items-center justify-end",
        )}
      >
        <button
          type="button"
          className={cn("w-16 h-12", "flex items-center")}
          title="Close Sidebar"
        >
          <span>close</span>
          <CloseIcon className={cn("text-white", "rotate-45", "h-4 w-4")} />
        </button>
      </div>

      <div className={cn("flex flex-1 flex-col-reverse lg:flex-col", "h-full")}>
        <nav
          className={cn("h-full flex-1", "flex flex-col gap-2", "p-4 lg:p-6")}
        >
          {navigationList.map(({ title, path, Icon }) => (
            <Link
              to={path}
              key={title}
              title={title}
              className={cn(
                "px-4 py-3",
                "rounded-md outline-none focus:outline-none",
                "hover:bg-black-2 focus:bg-black-2",
                "transition-all duration-200 ease-in-out",
                "flex items-center gap-3",
                location.pathname === path &&
                  "bg-white hover:bg-white focus:bg-white text-black",
              )}
            >
              <Icon className={cn("inline-block", "w-4 h-4")} />
              {title}
            </Link>
          ))}
        </nav>

        <SidebarNavigationProfile />
      </div>
    </div>
  );
};

export default SideNavigation;
