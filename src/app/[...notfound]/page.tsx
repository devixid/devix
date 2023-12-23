import { Metadata } from "next";
import { notFound } from "next/navigation";

// ini bisa ditaro metadata biar pas not-found title nya berubah

export const metadata: Metadata = {
  title: "Not found",
  description: "Page Not Found",
  referrer: "no-referrer",
  keywords: ["devix", "devix id", "devix.id"],
};

export default function NotFoundCatchAll(): null {
  // method ini buat manggil not-found page yang ada di folder app
  notFound();
  return null;
}
