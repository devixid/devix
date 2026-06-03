"use client";

import type { HeadingProps } from "@/interface";
import { motion } from "framer-motion";
import { Heading } from "./Heading.variant";

export const variant = Heading;

export const h1 = ({ className, ...props }: HeadingProps<"h1">) => (
  <motion.h1
    className={Heading({
      type: "h1",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);

export const h2 = ({ className, ...props }: HeadingProps<"h2">) => (
  <motion.h2
    className={Heading({
      type: "h2",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);

export const h3 = ({ className, ...props }: HeadingProps<"h3">) => (
  <motion.h3
    className={Heading({
      type: "h3",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);

export const h4 = ({ className, ...props }: HeadingProps<"h4">) => (
  <motion.h4
    className={Heading({
      type: "h4",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);

export const h5 = ({ className, ...props }: HeadingProps<"h5">) => (
  <motion.h5
    className={Heading({
      type: "h5",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);

export const h6 = ({ className, ...props }: HeadingProps<"h6">) => (
  <motion.h6
    className={Heading({
      type: "h6",
      className,
    })}
    animate={props.animate || false}
    {...props}
  />
);
