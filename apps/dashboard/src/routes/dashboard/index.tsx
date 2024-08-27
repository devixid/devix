// import { authState } from "@/features/auth";
import { DashboardPage } from "@/pages";
import {
  createFileRoute,
  // redirect,
} from "@tanstack/react-router";
// import { store } from "../__root";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
  // beforeLoad: ({ location }) => {
  //   const { isAuthenticated } = store.get(authState);

  //   if (!isAuthenticated && location.pathname === "/dashboard") {
  //     throw redirect({
  //       to: "/signin",
  //       from: location.pathname,
  //     });
  //   }
  // },
});
