import { ReactNode } from "react";
import { syne, dmSans } from "./fonts";
import "@/styles/globals.css";
import Provider from "./provider";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning className={`${syne.className} ${dmSans.className}`}>
      <body
        className={`${dmSans.className}`}
        suppressHydrationWarning
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
