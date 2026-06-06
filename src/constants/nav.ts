export type NavMenuItem = {
  id: string;
  title: string;
};

export const NavMenu: NavMenuItem[] = [
  { id: "#home", title: "Home" },
  { id: "#services", title: "Services" },
  { id: "#about", title: "About" },
  { id: "#team", title: "Team" },
  { id: "#portfolio", title: "Portfolio" },
  { id: "/estimator", title: "Estimator" },
];

export type FooterExploreLink = {
  label: string;
  href: string;
};

export const FOOTER_EXPLORE_LINKS: FooterExploreLink[] = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Portfolio", href: "/projects" },
  { label: "Estimator", href: "/estimator" },
  { label: "Contact", href: "#contact" },
];

const ESTIMATOR_LINK: FooterExploreLink = {
  label: "Estimator",
  href: "/estimator",
};

/** CMS navLinks with fallback + ensure Estimator is always present */
export function resolveFooterExploreLinks(
  cmsNavLinks?: FooterExploreLink[],
): FooterExploreLink[] {
  const links =
    cmsNavLinks && cmsNavLinks.length > 0 ? cmsNavLinks : FOOTER_EXPLORE_LINKS;

  const hasEstimator = links.some((link) => link.href === "/estimator");
  if (hasEstimator) return links;

  const contactIndex = links.findIndex((link) => link.href === "#contact");
  if (contactIndex >= 0) {
    return [
      ...links.slice(0, contactIndex),
      ESTIMATOR_LINK,
      ...links.slice(contactIndex),
    ];
  }

  return [...links, ESTIMATOR_LINK];
}
