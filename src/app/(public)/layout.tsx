import { ReactNode } from "react";
import { Footer, Header } from "@/components";
import { LazyMotionProvider } from "@/components/providers/LazyMotionProvider";

interface Props {
  children: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  return (
    <LazyMotionProvider>
      <a
        href="#main-content"
        className="hover:black-2 bg-black-1 absolute -top-24 left-5 rounded-md px-5 py-2 text-white shadow-lg transition-all duration-300 focus:top-20"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </LazyMotionProvider>
  );
}
