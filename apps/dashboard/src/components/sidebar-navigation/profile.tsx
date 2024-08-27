import { authState } from "@/features/auth";
import { store } from "@/routes/__root";
import { cn } from "@/utils";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import LogoutIcon from "@/assets/icons/ic-logout.svg";

const SidebarNavigationProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = store.get(authState);

  const getAbbreviation = useCallback((name: string) => {
    const nameSplit = name.split(/\s/);

    if (nameSplit.length === 1) {
      return (nameSplit[0] || "-").substring(0, 2).toUpperCase();
    } else if (nameSplit.length === 2) {
      return nameSplit[0][0] + nameSplit[1][0] || "-";
    }
  }, []);

  const handleLogout = useCallback(() => {
    if (isAuthenticated) {
      store.set(authState, (state) => ({
        ...state,
        isAuthenticated: false,
      }));
    }

    navigate({ to: "/signin", replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div
      className={cn("w-full", "flex flex-row items-center gap-4", "p-4 lg:p-6")}
    >
      <div
        className={cn(
          "min-w-12 min-h-12",
          "bg-white rounded-full",
          "flex items-center justify-center",
          "text-black",
        )}
      >
        <span>{getAbbreviation("Andrian Fadhilla Zendrato")}</span>
      </div>

      <div className={cn("flex-1", "h-12")}>
        <span className={cn("block", "truncate")}>Andrian Fadhilla</span>
        <span className={cn("text-body-sm text-gray-2", "block", "truncate")}>
          @andrianfaa
        </span>
      </div>

      <button
        type="button"
        className={cn("flex items-center justify-center", "w-12 h-12")}
        title="Logout"
        onClick={handleLogout}
      >
        <LogoutIcon />
      </button>
    </div>
  );
};

export default SidebarNavigationProfile;
