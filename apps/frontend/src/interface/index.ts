import { HeadingConstants } from "@/constants";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactHTML, Dispatch, SetStateAction } from "react";

export type HeadingProps<T extends keyof typeof HeadingConstants> =
  HTMLMotionProps<T> & {
    className?: string;
  };

export type TextProps<T extends keyof ReactHTML> = HTMLMotionProps<T> & {
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

export interface NavbarProps extends HTMLMotionProps<"nav"> {
  isNavbarOpen: boolean;
  setIsNavbarOpen: Dispatch<SetStateAction<boolean>>;
}

export interface TeamCardProps extends HTMLMotionProps<"div"> {
  description: string;
  image: string;
  name: string;
  title: string;
}
