import type { HTMLAttributes } from "react";
import { cn } from "@/utils";
import { Heading as headingVariants } from "./Heading.variant";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingStaticProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  level?: HeadingLevel;
}

export function HeadingStatic({
  as,
  level = "h2",
  className,
  children,
  ...props
}: HeadingStaticProps) {
  const Tag = as ?? level;
  return (
    <Tag
      className={cn(headingVariants({ type: level }), className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
