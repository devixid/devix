import type {
  DesignApproach,
  EstimatorState,
  PlatformType,
  ProjectComplexity,
  ProjectScope,
  ProjectTimeline,
  ProjectType,
  TemplateEligibleType,
} from "@/types/estimator";
import { BASE_PRICES, TEMPLATE_BASE_PRICES } from "@/types/estimator";

export const MAX_DELIVERABLE_REMOVALS = 5;
export const BASE_PRICE_FLOOR_RATIO = 0.55;

export interface DeliverableItem {
  id: string;
  label: string;
  deductionUsd: number;
  required?: boolean;
}

export interface EstimatorDetailContent {
  title: string;
  subtitle?: string;
  includes: DeliverableItem[];
  notIncluded?: string[];
}

/** Auto-excluded when parent is removed; does not consume an extra removal slot */
export const DELIVERABLE_DEPENDENCIES: Record<string, string[]> = {
  "ecommerce.payment_gateway": ["ecommerce.ssl_checkout"],
};

function req(id: string, label: string): DeliverableItem {
  return { id, label, deductionUsd: 0, required: true };
}

function opt(id: string, label: string, deductionUsd: number): DeliverableItem {
  return { id, label, deductionUsd, required: false };
}

function staticItem(label: string): DeliverableItem {
  const id = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 48);
  return { id, label, deductionUsd: 0, required: true };
}

export const PROJECT_TYPE_DELIVERABLES: Record<
  ProjectType,
  EstimatorDetailContent
> = {
  company_profile: {
    title: "Company Profile",
    subtitle: "A polished marketing website to establish credibility online.",
    includes: [
      req(
        "company_profile.responsive",
        "Responsive website (mobile, tablet, desktop)",
      ),
      req(
        "company_profile.core_pages",
        "Home, About, Services & Contact pages",
      ),
      opt(
        "company_profile.cms",
        "Content management system (CMS) for easy updates",
        130,
      ),
      opt(
        "company_profile.contact_form",
        "Contact form with email notifications",
        75,
      ),
      opt(
        "company_profile.seo",
        "Basic on-page SEO setup (meta tags, sitemap, robots.txt)",
        110,
      ),
      opt(
        "company_profile.analytics",
        "Google Analytics / tracking integration",
        50,
      ),
      opt(
        "company_profile.performance",
        "Performance optimization & fast loading",
        90,
      ),
      opt(
        "company_profile.cross_browser",
        "Cross-browser testing before launch",
        65,
      ),
      opt(
        "company_profile.deployment",
        "Deployment & domain connection support",
        85,
      ),
      opt("company_profile.support", "30 days post-launch bug-fix support", 95),
    ],
    notIncluded: [
      "Copywriting & photography (can be quoted separately)",
      "Multi-language localization",
      "Custom integrations beyond contact form",
    ],
  },
  ecommerce: {
    title: "E-Commerce",
    subtitle: "A fully functional online store ready to accept orders.",
    includes: [
      req("ecommerce.catalog", "Product catalog with categories & search"),
      req("ecommerce.product_pages", "Product detail pages with image gallery"),
      req("ecommerce.cart_checkout", "Shopping cart & checkout flow"),
      opt(
        "ecommerce.payment_gateway",
        "Payment gateway integration (Stripe, Midtrans, etc.)",
        200,
      ),
      opt("ecommerce.order_emails", "Order confirmation emails", 80),
      opt(
        "ecommerce.admin_panel",
        "Admin panel for products, orders & inventory",
        220,
      ),
      req("ecommerce.responsive", "Responsive design across all devices"),
      opt("ecommerce.seo", "Basic SEO for product & category pages", 110),
      opt("ecommerce.ssl_checkout", "SSL-ready secure checkout setup", 70),
      opt("ecommerce.deployment", "Deployment & launch support", 95),
      opt("ecommerce.support", "30 days post-launch bug-fix support", 100),
    ],
    notIncluded: [
      "Product photography & descriptions",
      "Marketplace sync (Tokopedia, Shopee, Amazon)",
      "Advanced loyalty / subscription features",
    ],
  },
  webapp: {
    title: "Custom Web App",
    subtitle: "A tailored web application built around your business logic.",
    includes: [
      req("webapp.ui_ux", "Custom UI/UX design & interactive prototypes"),
      opt("webapp.auth", "User authentication & role-based access", 350),
      req("webapp.dashboards", "Custom dashboards & data views"),
      opt("webapp.api", "REST or GraphQL API development", 400),
      opt("webapp.database", "Database design & implementation", 380),
      opt(
        "webapp.integrations",
        "Third-party API integrations (CRM, payment, etc.)",
        300,
      ),
      opt(
        "webapp.admin_panel",
        "Admin panel for content & user management",
        350,
      ),
      req(
        "webapp.responsive",
        "Responsive web app (desktop & mobile browsers)",
      ),
      opt("webapp.testing", "Automated testing for critical flows", 200),
      req("webapp.deployment", "CI/CD pipeline & production deployment"),
      opt("webapp.documentation", "Technical documentation & handover", 150),
      opt("webapp.support", "30 days post-launch bug-fix support", 150),
    ],
    notIncluded: [
      "Native mobile apps (available as separate tier)",
      "Ongoing maintenance retainers",
      "Legacy system data migration",
    ],
  },
  mobile_app: {
    title: "Mobile App",
    subtitle: "A native or cross-platform app published to app stores.",
    includes: [
      req("mobile_app.ui_ux", "Custom mobile UI/UX design"),
      req("mobile_app.development", "Cross-platform or native development"),
      req("mobile_app.auth", "User authentication & secure sessions"),
      opt("mobile_app.push", "Push notification setup", 180),
      opt(
        "mobile_app.offline",
        "Offline-ready core flows (where applicable)",
        220,
      ),
      opt("mobile_app.backend", "Backend API & database (if required)", 450),
      opt(
        "mobile_app.store_submission",
        "App Store & Google Play submission support",
        280,
      ),
      opt(
        "mobile_app.beta_testing",
        "Beta testing via TestFlight / internal track",
        160,
      ),
      opt(
        "mobile_app.crash_reporting",
        "Crash reporting & analytics integration",
        100,
      ),
      opt(
        "mobile_app.performance",
        "Performance optimization for target devices",
        150,
      ),
      opt("mobile_app.support", "30 days post-launch bug-fix support", 150),
    ],
    notIncluded: [
      "Apple Developer & Google Play account fees",
      "Ongoing app store compliance updates",
      "Wearable / tablet-specific layouts",
    ],
  },
};

function toStaticDetail(
  title: string,
  subtitle: string | undefined,
  labels: string[],
  notIncluded?: string[],
): EstimatorDetailContent {
  return {
    title,
    subtitle,
    includes: labels.map(staticItem),
    notIncluded,
  };
}

export const DESIGN_DELIVERABLES: Record<
  DesignApproach,
  EstimatorDetailContent
> = {
  template: toStaticDetail(
    "Template Design",
    "Faster delivery using a proven, professionally crafted layout.",
    [
      "Selection from curated Devix template library",
      "Brand customization (logo, colors, typography)",
      "Layout adjustments to fit your content structure",
      "Up to 2 design revision rounds",
      "Responsive adaptation across breakpoints",
      "Stock imagery guidance & placement",
      "Typical delivery 2–4 weeks faster than custom",
    ],
    [
      "Fully bespoke wireframes from scratch",
      "Custom illustration or 3D asset creation",
      "Unlimited design revision rounds",
    ],
  ),
  custom: toStaticDetail(
    "Custom Design",
    "A unique visual identity designed exclusively for your brand.",
    [
      "Discovery session & competitor research",
      "Wireframes for key pages / screens",
      "High-fidelity UI design in Figma",
      "Custom component & interaction design",
      "Design system with reusable tokens",
      "Up to 4 design revision rounds",
      "Developer-ready design handoff & specs",
      "Responsive designs for all target devices",
    ],
    [
      "Brand strategy & logo design (available as add-on)",
      "Print or social media asset packages",
    ],
  ),
};

export function getDesignDeliverables(
  approach: DesignApproach,
  projectType: TemplateEligibleType,
): EstimatorDetailContent {
  const base = DESIGN_DELIVERABLES[approach];
  const typeLabel =
    projectType === "company_profile" ? "company profile" : "e-commerce";

  return {
    ...base,
    subtitle: `${base.subtitle} Optimized for ${typeLabel} projects.`,
  };
}

export const SCOPE_DELIVERABLES: Record<ProjectScope, EstimatorDetailContent> =
  {
    small: toStaticDetail(
      "1 – 5 Pages",
      "Compact site for startups and focused offerings.",
      [
        "Up to 5 unique page layouts",
        "Single-level navigation menu",
        "One contact or lead-capture form",
        "CMS setup for all included pages",
        "Ideal for landing page + core info pages",
      ],
    ),
    medium: toStaticDetail(
      "5 – 15 Pages",
      "Room to showcase multiple services, cases, or categories.",
      [
        "Up to 15 unique page layouts",
        "Multi-level navigation & dropdown menus",
        "Blog or news section (optional)",
        "Reusable content blocks across pages",
        "CMS with structured content types",
        "Team, FAQ, or portfolio sections",
      ],
    ),
    large: toStaticDetail(
      "15+ Pages",
      "Enterprise-scale content architecture.",
      [
        "15+ unique page layouts",
        "Advanced CMS with custom content models",
        "Multiple content sections & landing variants",
        "Search functionality (site-wide)",
        "Role-based CMS access (editor vs admin)",
        "Documentation for content editors",
        "Scalable folder & URL structure",
      ],
    ),
  };

const SCOPE_DELIVERABLES_APP: Record<ProjectScope, EstimatorDetailContent> = {
  small: toStaticDetail(
    "3 – 5 Core Screens",
    "A focused MVP with essential user flows.",
    [
      "Up to 5 primary screens or views",
      "Single primary user journey (e.g. onboarding → core action)",
      "Basic navigation (tabs, drawer, or stack)",
      "One authentication flow if required",
      "Essential form inputs & validation",
    ],
  ),
  medium: toStaticDetail(
    "6 – 12 Screens",
    "Multiple modules with moderate feature depth.",
    [
      "Up to 12 screens across 2–3 feature modules",
      "Role-based or segmented user flows",
      "Search, filters, or list/detail patterns",
      "Notifications or activity feed (basic)",
      "Settings & profile management",
      "API integration with 1–2 external services",
    ],
  ),
  large: toStaticDetail(
    "13+ Screens",
    "Full product scope with advanced flows.",
    [
      "13+ screens with complex navigation",
      "Multiple user roles & permission levels",
      "Advanced dashboards & data visualization",
      "Deep third-party integrations",
      "Offline support or real-time features (as scoped)",
      "Admin panel for content or user management",
      "Documentation for handoff & maintenance",
    ],
  ),
};

export function getScopeDeliverables(
  type: ProjectType | null,
  scope: ProjectScope,
): EstimatorDetailContent {
  if (type === "webapp" || type === "mobile_app") {
    return SCOPE_DELIVERABLES_APP[scope];
  }
  return SCOPE_DELIVERABLES[scope];
}

export const COMPLEXITY_DELIVERABLES: Record<
  ProjectComplexity,
  EstimatorDetailContent
> = {
  basic: toStaticDetail(
    "Basic",
    "Clean, functional, and performance-focused.",
    [
      "Minimal, professional visual design",
      "Standard UI components & layouts",
      "Simple hover & focus states",
      "Optimized for fast load times (LCP < 2.5s target)",
      "Accessibility basics (semantic HTML, alt text)",
    ],
  ),
  standard: toStaticDetail(
    "Standard",
    "Modern feel with thoughtful motion and polish.",
    [
      "Everything in Basic, plus:",
      "Scroll-triggered reveal animations",
      "Smooth page transitions & micro-interactions",
      "Custom iconography & visual accents",
      "Enhanced typography hierarchy",
      "Parallax or stagger effects (where appropriate)",
    ],
  ),
  premium: toStaticDetail(
    "Premium",
    "Stand-out experience with advanced visuals.",
    [
      "Everything in Standard, plus:",
      "Bespoke UI components built from scratch",
      "Advanced motion design (GSAP / Framer Motion)",
      "3D elements or WebGL integrations (where applicable)",
      "Custom cursor, loader & page transitions",
      "Pixel-perfect attention to detail across breakpoints",
      "Extended animation prototyping in design phase",
    ],
  ),
};

export const TIMELINE_DELIVERABLES: Record<
  ProjectTimeline,
  EstimatorDetailContent
> = {
  relaxed: toStaticDetail(
    "Relaxed (8+ weeks)",
    "Flexible schedule — best value when deadline is open.",
    [
      "Phased milestone delivery",
      "Bi-weekly progress updates",
      "Standard revision turnaround (3–5 business days)",
      "10% estimate discount applied",
      "Ideal for pre-launch or planning-phase projects",
    ],
  ),
  standard: toStaticDetail(
    "Standard (4–8 weeks)",
    "Balanced pace for most projects.",
    [
      "Weekly progress calls or written updates",
      "Milestone-based delivery (design → dev → QA → launch)",
      "Revision turnaround within 2–3 business days",
      "Dedicated project channel (Slack or email)",
      "Structured QA before go-live",
    ],
  ),
  rush: toStaticDetail(
    "Rush (< 4 weeks)",
    "Priority delivery for time-sensitive launches.",
    [
      "Dedicated developer priority queue",
      "Daily or every-other-day progress updates",
      "Expedited revision turnaround (24–48 hours)",
      "Parallel design & development workstreams",
      "Extended team availability & overtime allocation",
      "40% rush surcharge reflected in estimate",
    ],
  ),
};

export const PLATFORM_DELIVERABLES: Record<
  PlatformType,
  EstimatorDetailContent
> = {
  android: toStaticDetail(
    "Android Only",
    "Optimized for the Google Play ecosystem.",
    [
      "Android-native or cross-platform build (Android target)",
      "Material Design guidelines compliance",
      "Google Play Store listing & submission support",
      "Testing on popular Android devices & screen sizes",
      "Firebase / Google services integration (if needed)",
    ],
  ),
  ios: toStaticDetail(
    "iOS Only",
    "Optimized for Apple's App Store ecosystem.",
    [
      "iOS-native or cross-platform build (iOS target)",
      "Apple Human Interface Guidelines compliance",
      "App Store Connect listing & submission support",
      "TestFlight beta distribution",
      "Testing on iPhone & iPad form factors",
    ],
  ),
  both: toStaticDetail(
    "Both Platforms",
    "One codebase, two app stores — maximum reach.",
    [
      "Cross-platform development (React Native / Flutter)",
      "Shared codebase with platform-specific polish",
      "iOS App Store & Google Play submission support",
      "TestFlight & internal Android track beta testing",
      "Unified backend & push notification setup",
      "Platform-specific UI adjustments (iOS vs Android patterns)",
    ],
  ),
};

export function getProjectTypeDeliverables(
  type: ProjectType,
): DeliverableItem[] {
  return PROJECT_TYPE_DELIVERABLES[type].includes;
}

export function getRemovableItems(type: ProjectType): DeliverableItem[] {
  return getProjectTypeDeliverables(type)
    .filter((item) => !item.required && item.deductionUsd > 0)
    .sort((a, b) => a.deductionUsd - b.deductionUsd);
}

export function getDeliverableItemById(
  type: ProjectType,
  id: string,
): DeliverableItem | undefined {
  return getProjectTypeDeliverables(type).find((item) => item.id === id);
}

function resolveBaseForState(state: EstimatorState): number {
  if (!state.type) return 0;
  if (
    state.designApproach === "template" &&
    (state.type === "company_profile" || state.type === "ecommerce")
  ) {
    return TEMPLATE_BASE_PRICES[state.type];
  }
  return BASE_PRICES[state.type];
}

function getDeductionScale(state: EstimatorState): number {
  if (!state.type) return 1;
  const base = resolveBaseForState(state);
  const customBase = BASE_PRICES[state.type];
  if (customBase === 0) return 1;
  return base / customBase;
}

export function getDeliverableDeduction(
  id: string,
  state: EstimatorState,
): number {
  if (!state.type) return 0;
  const item = getDeliverableItemById(state.type, id);
  if (!item || item.required || item.deductionUsd <= 0) return 0;
  return Math.round(item.deductionUsd * getDeductionScale(state));
}

/** IDs excluded only because a parent deliverable was removed */
export function getDependentExcludedIds(
  userExcludedIds: string[],
): Set<string> {
  const dependent = new Set<string>();
  for (const parentId of userExcludedIds) {
    const deps = DELIVERABLE_DEPENDENCIES[parentId] ?? [];
    for (const dep of deps) {
      dependent.add(dep);
    }
  }
  return dependent;
}

export function resolveExcludedDeliverables(
  userExcludedIds: string[],
): string[] {
  const resolved = new Set(userExcludedIds);
  for (const parentId of userExcludedIds) {
    const deps = DELIVERABLE_DEPENDENCIES[parentId] ?? [];
    for (const dep of deps) {
      resolved.add(dep);
    }
  }
  return [...resolved];
}

/** Count toward the max-5 removal limit (dependency-only items excluded) */
export function countRemovalSlots(userExcludedIds: string[]): number {
  const dependent = getDependentExcludedIds(userExcludedIds);
  return userExcludedIds.filter((id) => !dependent.has(id)).length;
}

export function calculateDeliverableSavings(state: EstimatorState): number {
  if (!state.type) return 0;

  const resolved = resolveExcludedDeliverables(state.excludedDeliverableIds);
  return resolved.reduce(
    (sum, id) => sum + getDeliverableDeduction(id, state),
    0,
  );
}

export function getAdjustedBasePrice(state: EstimatorState): number {
  const base = resolveBaseForState(state);
  if (!state.type || base === 0) return 0;

  const savings = calculateDeliverableSavings(state);
  const floor = base * BASE_PRICE_FLOOR_RATIO;
  return Math.max(floor, base - savings);
}

export function isDeliverableExcluded(
  state: EstimatorState,
  id: string,
): boolean {
  return resolveExcludedDeliverables(state.excludedDeliverableIds).includes(id);
}

export function getExcludedDeliverableLabels(state: EstimatorState): string[] {
  if (!state.type) return [];
  return getExcludedLabelsForProjectType(
    state.type,
    resolveExcludedDeliverables(state.excludedDeliverableIds),
  );
}

export function getExcludedLabelsForProjectType(
  type: ProjectType,
  excludedIds: string[],
): string[] {
  return excludedIds
    .map((id) => getDeliverableItemById(type, id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function validateExcludedDeliverables(
  type: ProjectType,
  userExcludedIds: string[],
  designApproach: DesignApproach | null,
): { valid: boolean; error?: string } {
  if (countRemovalSlots(userExcludedIds) > MAX_DELIVERABLE_REMOVALS) {
    return { valid: false, error: "Too many deliverable removals." };
  }

  const dependent = getDependentExcludedIds(userExcludedIds);

  for (const id of userExcludedIds) {
    if (dependent.has(id)) {
      return {
        valid: false,
        error: "Dependent deliverable cannot be removed directly.",
      };
    }

    const item = getDeliverableItemById(type, id);
    if (!item) {
      return { valid: false, error: "Invalid deliverable id." };
    }
    if (item.required || item.deductionUsd <= 0) {
      return { valid: false, error: "Deliverable is not removable." };
    }
  }

  if ((type === "company_profile" || type === "ecommerce") && !designApproach) {
    return { valid: false, error: "Design approach required." };
  }

  return { valid: true };
}
