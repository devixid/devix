import type { EstimatorStepKey } from "@/lib/estimator-steps";
import { isValidCurrencyCode } from "@/lib/estimator-format";
import type {
  CurrencyCode,
  DesignApproach,
  EstimatorState,
  PlatformType,
  ProjectComplexity,
  ProjectScope,
  ProjectTimeline,
  ProjectType,
} from "@/types/estimator";

const STORAGE_KEY = "devix-estimator-v1";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type EstimatorSession = {
  version: 1;
  state: EstimatorState;
  currentStepKey: EstimatorStepKey;
  currency: CurrencyCode;
  contactLeadId: string | null;
  savedFingerprint: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  updatedAt: number;
};

const PROJECT_TYPES = new Set<ProjectType>([
  "company_profile",
  "ecommerce",
  "webapp",
  "mobile_app",
]);
const DESIGN_APPROACHES = new Set<DesignApproach>(["custom", "template"]);
const PLATFORMS = new Set<PlatformType>(["android", "ios", "both"]);
const SCOPES = new Set<ProjectScope>(["small", "medium", "large"]);
const COMPLEXITIES = new Set<ProjectComplexity>([
  "basic",
  "standard",
  "premium",
]);
const TIMELINES = new Set<ProjectTimeline>(["relaxed", "standard", "rush"]);
const STEP_KEYS = new Set<EstimatorStepKey>([
  "type",
  "design",
  "platform",
  "scope",
  "complexity",
  "timeline",
  "customize",
  "result",
  "contact",
]);

function isNullableEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
): value is T | null {
  return (
    value === null || (typeof value === "string" && allowed.has(value as T))
  );
}

function parseState(raw: unknown): EstimatorState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;

  if (!isNullableEnum(s.type, PROJECT_TYPES)) return null;
  if (!isNullableEnum(s.designApproach, DESIGN_APPROACHES)) return null;
  if (!isNullableEnum(s.platform, PLATFORMS)) return null;
  if (!isNullableEnum(s.scope, SCOPES)) return null;
  if (!isNullableEnum(s.complexity, COMPLEXITIES)) return null;
  if (!isNullableEnum(s.timeline, TIMELINES)) return null;
  if (!Array.isArray(s.excludedDeliverableIds)) return null;
  if (!s.excludedDeliverableIds.every((id) => typeof id === "string")) {
    return null;
  }

  return {
    type: s.type,
    designApproach: s.designApproach,
    platform: s.platform,
    scope: s.scope,
    complexity: s.complexity,
    timeline: s.timeline,
    excludedDeliverableIds: s.excludedDeliverableIds,
  };
}

export function loadEstimatorSession(): EstimatorSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as EstimatorSession;
    if (parsed.version !== 1) return null;
    if (Date.now() - parsed.updatedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const state = parseState(parsed.state);
    if (!state) return null;
    if (!STEP_KEYS.has(parsed.currentStepKey)) return null;
    if (!isValidCurrencyCode(parsed.currency)) return null;

    return {
      version: 1,
      state,
      currentStepKey: parsed.currentStepKey,
      currency: parsed.currency,
      contactLeadId:
        typeof parsed.contactLeadId === "string" ? parsed.contactLeadId : null,
      savedFingerprint:
        typeof parsed.savedFingerprint === "string"
          ? parsed.savedFingerprint
          : null,
      clientName: typeof parsed.clientName === "string" ? parsed.clientName : "",
      clientEmail: typeof parsed.clientEmail === "string" ? parsed.clientEmail : "",
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function saveEstimatorSession(data: Omit<EstimatorSession, "version">) {
  if (typeof window === "undefined") return;

  try {
    const payload: EstimatorSession = {
      version: 1,
      ...data,
      updatedAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}

export function clearEstimatorSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
