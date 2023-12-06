import { HeadingConstants } from "@/constants";
import { HTMLMotionProps } from "framer-motion";

export interface HeadingProps
  extends HTMLMotionProps<keyof typeof HeadingConstants> {
  as: keyof typeof HeadingConstants;
  className?: string | undefined;
}
