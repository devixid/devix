import { ReactNode } from "react";
import { Footer, Header } from "@/components";
import { LazyMotionProvider } from "@/components/providers/LazyMotionProvider";
import { MaintenanceGate } from "@/components/MaintenanceGate";
import { getSiteSection } from "@/lib/queries/site-content";

interface Props {
  children: ReactNode;
}

export default async function PublicLayout({ children }: Props) {
  const footerContent = await getSiteSection("FOOTER");

  // LazyMotionProvider: public routes only (Header, SlideUp, projects grid).
  // Estimator steps are code-split separately; hero keeps motion Heading.
  return (
    <LazyMotionProvider>
      <MaintenanceGate>
        <a
          href="#main-content"
          className="hover:black-2 bg-black-1 absolute -top-24 left-5 rounded-md px-5 py-2 text-white shadow-lg transition-all duration-300 focus:top-20"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer content={footerContent} />
      </MaintenanceGate>
    </LazyMotionProvider>
  );
}
