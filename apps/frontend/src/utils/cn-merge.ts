import { cx } from "class-variance-authority";
import type { ClassValue } from "class-variance-authority/types";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind class merger
 * @param {Array<ClassValue>} classes
 * @returns {string} className
 */
export const cn = (...classes: Array<ClassValue>): string =>
  twMerge(cx(...classes));
