"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { ReactNode } from "react";

export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
