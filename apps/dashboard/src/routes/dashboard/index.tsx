import { createFileRoute } from "@tanstack/react-router";
import { authState } from "@/features/auth";
import { store } from "../__root";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: () => <div>Hello /dashboard</div>,
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = store.get(authState);

    if (!isAuthenticated) {
      return redirect({ to: "/signin", from: location.pathname });
    }
  },
});
