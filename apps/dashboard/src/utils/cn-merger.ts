import { cx } from "class-variance-authority";
import type { ClassValue } from "class-variance-authority/types";
import { twMerge } from "tailwind-merge";

/**
 * Class name merger
 * @param {ClassValue[]} classes
 * @returns {string}
 */
export const cn = (...classes: ClassValue[]): string => twMerge(cx(...classes));
