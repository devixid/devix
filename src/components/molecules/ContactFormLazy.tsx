"use client";

import dynamic from "next/dynamic";

const ContactForm = dynamic(
  () => import("./ContactForm").then((m) => ({ default: m.ContactForm })),
  {
    loading: () => (
      <div
        className="min-h-[400px] animate-pulse rounded-xl bg-zinc-100 lg:col-span-2"
        aria-hidden
      />
    ),
    ssr: true,
  },
);

export default function ContactFormLazy() {
  return <ContactForm />;
}
