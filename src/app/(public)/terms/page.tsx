import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/molecules/LegalPageLayout";
import { termsOfService } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms of Service | Devix",
  description:
    "Terms governing use of the Devix website, project estimator, and inquiry forms.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title={termsOfService.title}
      lastUpdated={termsOfService.lastUpdated}
      sections={termsOfService.sections}
    />
  );
}
