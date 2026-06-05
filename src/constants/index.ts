import { Variants } from "framer-motion";

export const HeadingConstants = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
} as const;

export const NavMenu = [
  {
    title: "Home",
    id: "#home",
  },
  {
    title: "Services",
    id: "#services",
  },
  {
    title: "Team",
    id: "#team",
  },
  {
    title: "Portofolio",
    id: "#portfolio",
  },
  {
    title: "Projects",
    id: "/projects",
  },
];

export const scrollDownArrowAnimation: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 1,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

export const iconVariant: Variants = {
  hidden: {
    pathLength: 0,
  },
  visible: {
    pathLength: 1,
  },
};

export const headingText: string = "Professional website";
export const headingText2: string = "creation services";
export const subHeadingText: Array<string> = [
  "We",
  "design",
  "and",
  "build",
  "high-performance",
  "custom",
  "websites",
  "to",
  "grow",
  "your",
  "business",
  "online.",
];

export * from "./team";
