import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { inter } from "./fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
        suppressHydrationWarning
      >
        <main>{children}</main>
      </body>
      <Analytics />
    </html>
  );
}
