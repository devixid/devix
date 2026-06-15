import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/molecules/LegalPageLayout";
import { termsOfService } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Devix website, project estimator, and inquiry forms.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/terms",
  },
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
