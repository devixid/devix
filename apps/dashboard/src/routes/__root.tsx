import { DashboardLayout, Error404NotFound } from "@/components";
import { authState } from "@/features/auth";
import { createRootRoute, redirect } from "@tanstack/react-router";
import { createStore } from "jotai";

export const store = createStore(); // Jotai Store

export const Route = createRootRoute({
  component: DashboardLayout,
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = store.get(authState);

    if (
      isAuthenticated &&
      (location.pathname === "/" || location.pathname === "/signin")
    ) {
      throw redirect({
        to: "/dashboard",
        from: location.pathname,
      });
    }

    if (!isAuthenticated && location.pathname !== "/signin") {
      throw redirect({
        to: "/signin",
        from: location.pathname,
      });
    }
  },
  notFoundComponent: Error404NotFound,
});
