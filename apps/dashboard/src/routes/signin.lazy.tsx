import { SignInPage } from "@/pages";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/signin")({
  component: SignInPage,
});
