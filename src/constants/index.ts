import { ourTeams } from "./team";

export { ourTeams };

export const HeadingConstants = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
} as const;

export { NavMenu } from "./nav";
export { FOOTER_EXPLORE_LINKS, resolveFooterExploreLinks } from "./nav";
export type { FooterExploreLink, NavMenuItem } from "./nav";
