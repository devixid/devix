import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client with Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.redirect(new URL("/download/invalid", req.url));
    }

    const purchase = await prisma.purchase.findUnique({
      where: { downloadToken: token },
      include: { product: true },
    });

    if (!purchase) {
      return NextResponse.redirect(new URL("/download/invalid", req.url));
    }

    if (purchase.tokenUsed) {
      return NextResponse.redirect(new URL("/download/used", req.url));
    }

    if (purchase.tokenExpiresAt < new Date()) {
      return NextResponse.redirect(new URL("/download/expired", req.url));
    }

    // Atomic update to mark token as used
    const updateResult = await prisma.purchase.updateMany({
      where: {
        id: purchase.id,
        tokenUsed: false, // ensures we only update if it's currently false
      },
      data: {
        tokenUsed: true,
      },
    });

    // If count is 0, it means another concurrent request already marked it as used
    if (updateResult.count === 0) {
      return NextResponse.redirect(new URL("/download/used", req.url));
    }

    // Generate signed URL (valid for 60 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from("products")
      .createSignedUrl(purchase.product.fileKey, 60);

    if (error || !data?.signedUrl) {
      console.error("[Download] Failed to generate signed URL:", error);
      return NextResponse.redirect(new URL("/download/error", req.url));
    }

    // Redirect user to the actual download link
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("[Download] Unexpected error:", error);
    return NextResponse.redirect(new URL("/download/error", req.url));
  }
}
