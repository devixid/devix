import { HeadingConstants } from "@/constants";
import { HTMLMotionProps } from "framer-motion";
import { ReactHTML } from "react";

// export interface HeadingProps<TagName extends keyof typeof HeadingConstants>
//   extends HTMLMotionProps<TagName> {
//   // as: keyof typeof HeadingConstants;
//   className?: string | undefined;
// }

export type HeadingProps<TagName extends keyof typeof HeadingConstants> =
  HTMLMotionProps<TagName> & {
    className?: string;
  };

export type TextProps<TextType extends keyof ReactHTML> =
  HTMLMotionProps<TextType> & {
    className?: string;
    /**
     * Reset styles
     * @description method to reset styles to tailwindcss typography
     */
    resetStyle?: boolean;
  };

export interface NavMenuInterface {
  title: string;
  id: string;
}

export interface NavbarProps extends HTMLMotionProps<"nav"> {}
