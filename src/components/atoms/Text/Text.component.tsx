"use client";

import type { TextProps } from "@/interface";
import { motion } from "framer-motion";
import Link, { type LinkProps } from "next/link";
import { forwardRef } from "react";
import { Text } from "./Text.variant";

// eslint-disable-next-line react/display-name
const CustomLinkComponent = forwardRef<
  HTMLAnchorElement,
  LinkProps & { className?: string }
>(({ className, href, ...props }, ref) => (
  <Link
    href={href}
    ref={ref}
    className={Text({
      type: "link",
      className,
    })}
    {...props}
  />
));

export const variant = Text;

export const p = ({ className, ...props }: TextProps<"p">) => (
  <motion.p
    className={Text({
      type: "paragraph",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);

export const span = ({
  className,
  resetStyle,
  ...props
}: TextProps<"span">) => (
  <motion.span
    className={
      resetStyle
        ? className
        : Text({
            type: "span",
            className,
          })
    }
    animate={props.animate || false}
    {...props}
  />
);

export const link = motion(CustomLinkComponent);
