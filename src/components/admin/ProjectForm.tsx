"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProject, updateProject } from "@/actions/admin/projects";
import { Project, ProjectDeveloper, ProjectTechStack } from "@prisma/client";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { UploadCloud, X, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ProjectWithRelations = Project & {
  techStacks: ProjectTechStack[];
  developers: ProjectDeveloper[];
};

interface ProjectFormProps {
  initialData?: ProjectWithRelations;
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.imageUrl || "",
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    category: initialData?.category || "E-Commerce",
    liveUrl: initialData?.liveUrl || "",
    githubUrl: initialData?.githubUrl || "",
    isFeatured: initialData?.isFeatured ?? false,
    isVisible: initialData?.isVisible ?? true,
    completedAt: initialData?.completedAt
      ? new Date(initialData.completedAt).toISOString().split("T")[0]
      : "",
  });

  // Dynamic Lists State
  const [techStacks, setTechStacks] = useState<string[]>(
    initialData?.techStacks.map((t) => t.name) || [""],
  );
  const [developers, setDevelopers] = useState<
    { name: string; role: string }[]
  >(
    initialData?.developers.length
      ? initialData.developers.map((d) => ({
          name: d.name,
          role: d.role || "",
        }))
      : [{ name: "", role: "" }],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const result = await uploadToSupabaseStorage(file, "portfolio", "projects");
    return result.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalImageUrl = imagePreview;

      // 1. Upload new image if selected
      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await uploadImageToSupabase(imageFile);
        setUploadingImage(false);
      }

      if (!finalImageUrl) {
        throw new Error("Project image is required.");
      }

      // 2. Clean arrays
      const cleanTechStacks = techStacks.filter((t) => t.trim() !== "");
      const cleanDevelopers = developers.filter((d) => d.name.trim() !== "");

      if (cleanTechStacks.length === 0)
        throw new Error("At least one Tech Stack is required.");
      if (cleanDevelopers.length === 0)
        throw new Error("At least one Developer is required.");

      const payload = {
        title: formData.title,
        slug:
          formData.slug ||
          formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
        description: formData.description,
        content: formData.content.trim() || null,
        category: formData.category,
        imageUrl: finalImageUrl,
        liveUrl: formData.liveUrl || null,
        githubUrl: formData.githubUrl || null,
        completedAt: formData.completedAt
          ? new Date(formData.completedAt)
          : null,
        isFeatured: formData.isFeatured,
        isVisible: formData.isVisible,
        techStacks: cleanTechStacks,
        developers: cleanDevelopers,
      };

      if (initialData) {
        await updateProject(initialData.id, payload);
      } else {
        await createProject(payload);
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);

        setError(err.message || "Something went wrong.");
      }
      setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-4xl flex-col gap-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-x-4">
        <Link
          href="/admin/projects"
          className="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
          {initialData ? "Edit Project" : "Add New Project"}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="flex flex-col gap-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-800 bg-[#121212] p-6">
            <h2 className="mb-6 text-lg font-medium text-white">
              General Information
            </h2>

            <div className="flex flex-col gap-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-zinc-400"
                >
                  Project Title
                </label>
                <input
                  id="title"
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setFormData({
                      ...formData,
                      title,
                      slug: initialData ? formData.slug : slug,
                    });
                  }}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-zinc-400"
                  >
                    Slug (URL)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const slug = formData.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "");
                      setFormData({ ...formData, slug });
                    }}
                    className="text-[10px] tracking-wider text-[#C8A96E] uppercase hover:underline"
                  >
                    Regenerate from title
                  </button>
                </div>
                <input
                  id="slug"
                  required
                  type="text"
                  readOnly={!!initialData}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, ""),
                    })
                  }
                  className={`w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E] ${initialData ? "cursor-not-allowed opacity-70" : ""}`}
                />
                {initialData && (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Slug is locked on edit. Use &quot;Regenerate from title&quot; to change it.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-zinc-400"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-sm font-medium text-zinc-400"
                  >
                    Category
                  </label>
                  <input
                    id="category"
                    required
                    type="text"
                    placeholder="e.g. E-Commerce"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="completedAt"
                    className="mb-1.5 block text-sm font-medium text-zinc-400"
                  >
                    Completion Date
                  </label>
                  <input
                    id="completedAt"
                    type="date"
                    value={formData.completedAt}
                    onChange={(e) =>
                      setFormData({ ...formData, completedAt: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#121212] p-6">
            <h2 className="mb-2 text-lg font-medium text-white">
              Case Study Content
            </h2>
            <p className="mb-4 text-xs text-zinc-500">
              Optional rich content shown below the overview on the project page.
            </p>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="Describe the challenge, solution, and results..."
            />
          </div>

          {/* Links & Status */}
          <div className="rounded-xl border border-zinc-800 bg-[#121212] p-6">
            <h2 className="mb-6 text-lg font-medium text-white">
              Links & Status
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="liveUrl"
                  className="mb-1.5 block text-sm font-medium text-zinc-400"
                >
                  Live URL
                </label>
                <input
                  id="liveUrl"
                  type="url"
                  placeholder="https://"
                  value={formData.liveUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                />
              </div>
              <div>
                <label
                  htmlFor="githubUrl"
                  className="mb-1.5 block text-sm font-medium text-zinc-400"
                >
                  GitHub URL
                </label>
                <input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-white outline-none focus:border-[#C8A96E] focus:ring-1 focus:ring-[#C8A96E]"
                />
              </div>

              <div className="col-span-2 flex gap-x-6 pt-2">
                <label className="flex cursor-pointer items-center gap-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) =>
                      setFormData({ ...formData, isVisible: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#C8A96E] focus:ring-[#C8A96E] focus:ring-offset-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-300">
                    Visible to Public
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#C8A96E] focus:ring-[#C8A96E] focus:ring-offset-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-300">
                    Featured on Homepage
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Image & Arrays */}
        <div className="flex flex-col gap-y-6">
          {/* Image Upload */}
          <div className="rounded-xl border border-zinc-800 bg-[#121212] p-6">
            <h2 className="mb-4 text-lg font-medium text-white">
              Project Image
            </h2>
            <div className="flex flex-col items-center justify-center">
              {imagePreview ? (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border border-zinc-800">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/80"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="mb-4 flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 transition-colors hover:bg-zinc-800/50">
                  <UploadCloud
                    size={32}
                    className="mb-2 text-zinc-500"
                  />
                  <span className="text-sm text-zinc-400">
                    Click to upload image
                  </span>
                  <span className="mt-1 text-[10px] text-zinc-500">
                    Max size 2MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="text-xs tracking-wider text-[#C8A96E] uppercase hover:underline"
              >
                Choose from library
              </button>
            </div>
            {uploadingImage && (
              <p className="text-center text-xs text-[#C8A96E]">
                Uploading image to Supabase...
              </p>
            )}
          </div>

          {/* Tech Stacks */}
          <div className="rounded-xl border border-zinc-800 bg-[#121212] p-6">
            <h2 className="mb-4 text-lg font-medium text-white">Tech Stacks</h2>
            <div className="flex flex-col gap-y-3">
              {techStacks.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-x-2"
                >
                  <input
                    type="text"
                    value={tech}
                    placeholder="e.g. Next.js"
                    onChange={(e) => {
                      const newStacks = [...techStacks];
                      newStacks[idx] = e.target.value;
                      setTechStacks(newStacks);
                    }}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white outline-none focus:border-[#C8A96E]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setTechStacks(techStacks.filter((_, i) => i !== idx))
                    }
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTechStacks([...techStacks, ""])}
                className="mt-2 flex items-center justify-center gap-x-2 rounded-lg border border-dashed border-zinc-700 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <Plus size={16} /> Add Tech Stack
              </button>
            </div>
          </div>

          {/* Developers */}
          <div className="rounded-xl border border-zinc-800 bg-[#121212] p-6">
            <h2 className="mb-4 text-lg font-medium text-white">Developers</h2>
            <div className="flex flex-col gap-y-4">
              {developers.map((dev, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-y-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                      Member {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDevelopers(developers.filter((_, i) => i !== idx))
                      }
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={dev.name}
                    placeholder="Name (e.g. Noval Ramdhani)"
                    onChange={(e) => {
                      const newDevs = [...developers];
                      newDevs[idx].name = e.target.value;
                      setDevelopers(newDevs);
                    }}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white outline-none focus:border-[#C8A96E]"
                  />
                  <input
                    type="text"
                    value={dev.role}
                    placeholder="Role (e.g. Backend Developer)"
                    onChange={(e) => {
                      const newDevs = [...developers];
                      newDevs[idx].role = e.target.value;
                      setDevelopers(newDevs);
                    }}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white outline-none focus:border-[#C8A96E]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setDevelopers([...developers, { name: "", role: "" }])
                }
                className="mt-2 flex items-center justify-center gap-x-2 rounded-lg border border-dashed border-zinc-700 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <Plus size={16} /> Add Developer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-x-4 border-t border-zinc-800 pt-6 pb-20">
        <Link
          href="/admin/projects"
          className="rounded-lg px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="rounded-lg bg-[#C8A96E] px-8 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#D4B87A] disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Save Changes"
              : "Create Project"}
        </button>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          setImageFile(null);
          setImagePreview(url);
        }}
      />
    </form>
  );
}
