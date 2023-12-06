import { notFound } from "next/navigation";

// ini bisa ditaro metadata biar pas not-found title nya berubah

export default function NotFoundCatchAll(): null {
  // method ini buat manggil not-found page yang ada di folder app
  notFound();
  return null;
}
