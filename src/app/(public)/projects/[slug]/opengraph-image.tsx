import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";
export const alt = "Devix Project Case Study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    select: { title: true, category: true, description: true },
  });

  const title = project?.title || "Project";
  const category = project?.category || "Case Study";
  const description = project?.description?.substring(0, 120) || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative accent glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(ellipse, rgba(200,169,110,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top: Category badge */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#C8A96E",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "4px",
              textTransform: "uppercase" as const,
              marginBottom: 24,
            }}
          >
            {category}
          </div>

          {/* Title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                color: "#71717a",
                fontSize: 22,
                marginTop: 20,
                lineHeight: 1.4,
                maxWidth: "800px",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom: Devix branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            Devix
          </div>
          <div
            style={{
              color: "#52525b",
              fontSize: 16,
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
            }}
          >
            Case Study
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
