import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/dashboard/portfolio")({
  component: () => <div>Hello /dashboard/portfolio/dashboard!</div>,
});
