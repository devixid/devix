import { NextFont } from "next/dist/compiled/@next/font";
import { Syne, DM_Sans } from "next/font/google";

export const syne: NextFont = Syne({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-display",
});

export const dmSans: NextFont = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-body",
});
