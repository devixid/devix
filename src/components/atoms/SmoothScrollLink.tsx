"use client";

import { handleSmoothScroll } from "@/utils";
import { ComponentProps } from "react";

export function SmoothScrollLink({
  children,
  href,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      href={href}
      {...props}
      onClick={(e) => {
        handleSmoothScroll(e);
        props.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
