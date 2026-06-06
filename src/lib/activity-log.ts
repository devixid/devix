import { prisma } from "@/lib/prisma";
import { getSessionCookie } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function logActivity(input: {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  actorEmail?: string;
  actorId?: string;
}) {
  let actorEmail = input.actorEmail ?? "system";
  let actorId = input.actorId ?? null;

  if (!input.actorEmail) {
    try {
      const session = await getSessionCookie();
      if (session) {
        actorEmail = session.email as string;
        actorId = session.userId as string;
      }
    } catch {
      // Public/server actions without session
    }
  }

  const delegate = prisma.activityLog;
  if (!delegate || typeof delegate.create !== "function") {
    return;
  }

  try {
    await delegate.create({
      data: {
        actorId,
        actorEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.warn("[ActivityLog] Failed to write:", error);
  }
}
