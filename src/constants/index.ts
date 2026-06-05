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

export const NavMenu = [
  { id: "#home", title: "Home" },
  { id: "#services", title: "Services" },
  { id: "#about", title: "About" },
  { id: "#team", title: "Team" },
  { id: "#portfolio", title: "Portfolio" },
  { id: "/estimator", title: "Estimator" },
];

