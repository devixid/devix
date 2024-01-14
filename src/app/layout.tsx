import { ReactNode } from "react";
import { Footer, Header } from "@/components";
import { archivo } from "./fonts";
import "@/styles/globals.css";
import Provider from "./provider";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body
        className={`${archivo.className}`}
        suppressHydrationWarning
      >
        <Provider>
          <a
            href="#main-content"
            className="hover:black-2 absolute -top-24 left-5 rounded-md bg-black-1 px-5 py-2 text-white shadow-lg transition-all duration-300 focus:top-20"
          >
            Skip to content
          </a>
          <Header />
          <main>{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
