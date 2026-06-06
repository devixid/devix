import { ReactNode } from "react";
import { Footer, Header } from "@/components";
import { LazyMotionProvider } from "@/components/providers/LazyMotionProvider";
import { MaintenanceGate } from "@/components/MaintenanceGate";
import {
  getSiteSection,
  getSiteSettingsPublic,
} from "@/lib/queries/site-content";
import type { SocialLinks } from "@/lib/site-settings";

interface Props {
  children: ReactNode;
}

export default async function PublicLayout({ children }: Props) {
  const [footerContent, siteSettings] = await Promise.all([
    getSiteSection("FOOTER"),
    getSiteSettingsPublic(),
  ]);
  const socialLinks =
    (siteSettings?.socialLinks as SocialLinks | null) ?? null;

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
        <Footer content={footerContent} socialLinks={socialLinks} />
      </MaintenanceGate>
    </LazyMotionProvider>
  );
}
