import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Provider as JotaiProvider } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { routeTree } from "./routeTree.gen";
import { store } from "./routes/__root";

import "./index.css";

const router = createRouter({
  routeTree,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <JotaiProvider store={store}>
        <RouterProvider router={router} />
      </JotaiProvider>
    </HelmetProvider>
  </StrictMode>,
);
