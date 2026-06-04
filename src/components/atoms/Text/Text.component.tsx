"use client";

import type { TextProps } from "@/interface";
import { m } from "framer-motion";
import Link, { type LinkProps } from "next/link";
import { forwardRef } from "react";
import { Text } from "./Text.variant";

const CustomLinkComponent = forwardRef<
  HTMLAnchorElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LinkProps<any> & { className?: string }
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
CustomLinkComponent.displayName = "Link";

export const variant = Text;

export const p = ({ className, ...props }: TextProps<"p">) => (
  <m.p
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
  <m.span
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

export const link = m.create(CustomLinkComponent);
