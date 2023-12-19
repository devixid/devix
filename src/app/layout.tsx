import { Analytics } from "@vercel/analytics/react";
import { ReactNode } from "react";
// import { inter } from "./fonts";
import { archivo } from "./fonts";

import "@/styles/globals.css";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body
        // className={`${inter.className}`}
        className={`${archivo.className}`}
        suppressHydrationWarning
      >
        <main>{children}</main>
      </body>
      <Analytics />
    </html>
  );
}
