/* eslint-disable no-nested-ternary */

"use client";

import { HeadingProps } from "@/interface";
import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

function Heading({ as, children, className, ...props }: HeadingProps) {
  return as === "h1" ? (
    <motion.h1
      {...props}
      className={cn(`${className}`)}
    >
      {children}
    </motion.h1>
  ) : as === "h2" ? (
    <motion.h2
      {...props}
      className={cn(`${className}`)}
    >
      {children}
    </motion.h2>
  ) : as === "h3" ? (
    <motion.h3
      {...props}
      className={cn(`${className}`)}
    >
      {children}
    </motion.h3>
  ) : as === "h4" ? (
    <motion.h4
      {...props}
      className={cn(`${className}`)}
    >
      {children}
    </motion.h4>
  ) : (
    <motion.h1
      {...props}
      className={cn(`${className}`)}
    >
      {children}
    </motion.h1>
  );
}

export default memo(Heading);
