"use server";

import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  verifyCsrfOrigin,
  getSessionCookie,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import type { StorageBucket } from "@/lib/supabase-storage";

const PAGE_SIZE = 24;

export async function listMediaAssets(
  params: {
    page?: number;
    mimeType?: string;
  } = {},
) {
  await verifyAdminSession();
  const page = Math.max(1, params.page ?? 1);
  const where = params.mimeType
    ? { mimeType: { startsWith: params.mimeType } }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE };
}

export async function registerMediaAsset(data: {
  bucket: StorageBucket;
  path: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  alt?: string;
}) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const session = await getSessionCookie();

  const asset = await prisma.mediaAsset.create({
    data: {
      bucket: data.bucket,
      path: data.path,
      publicUrl: data.publicUrl,
      filename: data.filename,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      alt: data.alt,
      uploadedById: session?.userId as string | undefined,
    },
  });

  await logActivity({
    action: "media.uploaded",
    entityType: "MediaAsset",
    entityId: asset.id,
    metadata: { filename: data.filename },
  });

  revalidatePath("/admin/media");
  return asset;
}

export async function deleteMediaAsset(id: string) {
  await verifyAdminSession();
  await verifyCsrfOrigin();

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) throw new Error("Asset not found.");

  const inUse =
    (await prisma.project.count({
      where: {
        OR: [
          { imageUrl: asset.publicUrl },
          { content: { contains: asset.publicUrl } },
        ],
      },
    })) +
    (await prisma.testimonial.count({
      where: { avatarUrl: asset.publicUrl },
    })) +
    (await prisma.teamMember.count({ where: { imageUrl: asset.publicUrl } }));

  if (inUse > 0) {
    throw new Error(
      "Asset is still referenced. Remove it from content before deleting.",
    );
  }

  await prisma.mediaAsset.delete({ where: { id } });

  await logActivity({
    action: "media.deleted",
    entityType: "MediaAsset",
    entityId: id,
  });

  revalidatePath("/admin/media");
  return { path: asset.path, bucket: asset.bucket };
}
