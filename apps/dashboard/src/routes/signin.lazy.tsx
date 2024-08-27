import { Error404NotFound } from "@/components";
import { authState } from "@/features/auth";
import { SignInPage } from "@/pages";
import { createLazyFileRoute } from "@tanstack/react-router";
import { store } from "./__root";

const { isAuthenticated } = store.get(authState);

export const Route = createLazyFileRoute("/signin")({
  component: isAuthenticated ? Error404NotFound : SignInPage,
});
