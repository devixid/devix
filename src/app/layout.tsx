import { ReactNode } from "react";
import { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { syne, dmSans } from "./fonts";
import "@/styles/globals.css";
import Provider from "./provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://devixid.vercel.app",
  ),
  title: {
    default: "Devix | Premium Software Development Agency",
    template: "%s | Devix",
  },
  description:
    "Devix designs and builds high-performance custom web applications and software solutions for global brands.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Devix",
  },
  twitter: {
    card: "summary_large_image",
    site: "@devix",
  },
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.className} ${dmSans.className}`}
    >
      <body
        className={`${dmSans.className}`}
        suppressHydrationWarning
      >
        <Provider>{children}</Provider>
        <SpeedInsights />
      </body>
    </html>
  );
}
