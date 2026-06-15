import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/molecules/LegalPageLayout";
import { privacyPolicy } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Devix collects, uses, and protects your personal information.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title={privacyPolicy.title}
      lastUpdated={privacyPolicy.lastUpdated}
      sections={privacyPolicy.sections}
    />
  );
}
