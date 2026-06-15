import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Devix — Premium Software Development Agency";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative accent glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(200,169,110,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          Devix
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#a1a1aa",
            fontSize: 26,
            marginTop: 20,
            fontWeight: 400,
          }}
        >
          Premium Software Development Agency
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: "#C8A96E",
            marginTop: 32,
            borderRadius: 2,
          }}
        />

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "#52525b",
            fontSize: 16,
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
          }}
        >
          Digital Products & Dev Tools
        </div>
      </div>
    ),
    { ...size },
  );
}
