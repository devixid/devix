import { authState } from "@/features/auth";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { createStore } from "jotai";

export const store = createStore(); // Jotai Store
export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = store.get(authState);

    if (
      isAuthenticated &&
      (location.pathname === "/signin" || location.pathname === "/")
    ) {
      redirect({ to: "/dashboard" });
      return;
    }

    if (location.pathname === "/" && !isAuthenticated) {
      return redirect({ to: "/signin" });
    }
  },
});
