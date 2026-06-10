"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { minorToMajor, resolveProductAmount } from "@/lib/money";
import { MAX_PRODUCT_FILE_BYTES } from "@/lib/product-storage";
import { ArrowLeft, UploadCloud } from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  fileExists?: boolean;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

const CURRENCIES = ["usd", "eur", "gbp", "idr"] as const;

export default function ProductForm({
  initialData,
  fileExists,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialPrice = initialData
    ? minorToMajor(
        resolveProductAmount(initialData).amountMinor,
        initialData.currency,
      )
    : "";

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    price: initialPrice === "" ? "" : String(initialPrice),
    currency: initialData?.currency ?? "usd",
    previewUrl: initialData?.previewUrl ?? "",
    lemonSqueezyVariantId: initialData?.lemonSqueezyVariantId ?? "",
    isVisible: initialData?.isVisible ?? true,
    order: String(initialData?.order ?? 0),
  });

  const [slugTouched, setSlugTouched] = useState(Boolean(initialData));
  const [productFile, setProductFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(formData.previewUrl);
  const [uploadingPreview, setUploadingPreview] = useState(false);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PRODUCT_FILE_BYTES) {
      setError("Digital file must be 50 MB or smaller.");
      return;
    }
    setProductFile(file);
    setError("");
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Preview image must be under 2 MB.");
      return;
    }
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isEdit && !productFile) {
        throw new Error("Please select a digital product file.");
      }

      let finalPreviewUrl = previewUrl;
      if (previewFile) {
        setUploadingPreview(true);
        const result = await uploadToSupabaseStorage(
          previewFile,
          "media",
          "products",
        );
        finalPreviewUrl = result.publicUrl;
        setUploadingPreview(false);
      }

      const payload = new FormData();
      payload.set("name", formData.name.trim());
      payload.set("slug", formData.slug.trim());
      payload.set("description", formData.description.trim());
      payload.set("price", formData.price);
      payload.set("currency", formData.currency);
      payload.set("previewUrl", finalPreviewUrl || "");
      payload.set(
        "lemonSqueezyVariantId",
        formData.lemonSqueezyVariantId.trim(),
      );
      payload.set("isVisible", String(formData.isVisible));
      payload.set("order", formData.order);
      if (productFile) {
        payload.set("productFile", productFile);
      }

      if (isEdit && initialData) {
        await updateProduct(initialData.id, payload);
      } else {
        await createProduct(payload);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setUploadingPreview(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
        {isEdit ? "Edit product" : "New product"}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        {isEdit
          ? "Update metadata or replace the digital file."
          : "Upload a digital file and publish to the store."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="product-name"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Name
            </label>
            <input
              id="product-name"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            />
          </div>

          <div>
            <label
              htmlFor="product-slug"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Slug
            </label>
            <input
              id="product-slug"
              required
              value={formData.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setFormData((prev) => ({ ...prev, slug: e.target.value }));
              }}
              pattern="[a-z0-9-]+"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 font-mono text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            />
          </div>

          <div>
            <label
              htmlFor="product-order"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Sort order
            </label>
            <input
              id="product-order"
              type="number"
              min={0}
              value={formData.order}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, order: e.target.value }))
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            />
          </div>

          <div>
            <label
              htmlFor="product-price"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Price
            </label>
            <input
              id="product-price"
              required
              type="number"
              min={0}
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            />
          </div>

          <div>
            <label
              htmlFor="product-currency"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Currency
            </label>
            <select
              id="product-currency"
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            >
              {CURRENCIES.map((c) => (
                <option
                  key={c}
                  value={c}
                >
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="product-lemon-variant"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Lemon Squeezy variant ID (optional)
            </label>
            <input
              id="product-lemon-variant"
              type="text"
              value={formData.lemonSqueezyVariantId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lemonSqueezyVariantId: e.target.value,
                }))
              }
              placeholder="e.g. 123456"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Required when Lemon Squeezy is the active payment provider in
              Settings → Payments.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="product-description"
              className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
            >
              Description
            </label>
            <textarea
              id="product-description"
              required
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#C8A96E]"
            />
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
              Preview image (optional)
            </p>
            {previewUrl && (
              <div className="relative mb-3 h-32 w-48 overflow-hidden rounded-lg border border-zinc-800">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-4 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300">
              <UploadCloud className="h-5 w-5 shrink-0" />
              <span>Upload preview (max 2 MB) — stored in media bucket</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePreviewChange}
              />
            </label>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
              {isEdit ? "Replace digital file (optional)" : "Digital file"}
            </p>
            {isEdit && initialData && (
              <p className="mb-2 font-mono text-xs text-zinc-500">
                Current: {initialData.fileKey}
                {fileExists === false && (
                  <span className="ml-2 text-amber-400">— missing in storage</span>
                )}
                {fileExists === true && (
                  <span className="ml-2 text-emerald-400">— OK</span>
                )}
              </p>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-4 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300">
              <UploadCloud className="h-5 w-5 shrink-0" />
              <span>
                {productFile
                  ? productFile.name
                  : isEdit
                    ? "Choose a new .zip, .pdf, or .tar.gz (max 50 MB)"
                    : "Choose .zip, .pdf, or .tar.gz (max 50 MB)"}
              </span>
              <input
                type="file"
                accept=".zip,.pdf,.tar.gz,.tgz"
                className="hidden"
                onChange={handleProductFileChange}
              />
            </label>
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <input
              id="isVisible"
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isVisible: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-[#C8A96E] focus:ring-[#C8A96E]"
            />
            <label
              htmlFor="isVisible"
              className="text-sm text-zinc-300"
            >
              Visible on store
            </label>
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-800 pt-6">
          <button
            type="submit"
            disabled={loading || uploadingPreview}
            className="rounded-lg bg-[#C8A96E] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? uploadingPreview
                ? "Uploading preview…"
                : "Saving…"
              : isEdit
                ? "Save changes"
                : "Create product"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
