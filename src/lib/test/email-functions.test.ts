import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ResendMock } from "@/lib/test/mocks/resend";

// ── External mocks ─────────────────────────────────────────────────────────────

let resendMock: ResendMock;

vi.mock("resend", () => {
  return {
    Resend: class {
      constructor() {
        return resendMock;
      }
    },
  };
});

vi.mock("@/lib/site-settings", () => ({
  getNotificationEmail: vi.fn(),
}));

// Import AFTER mocks are set up
import {
  escapeHtml,
  sendContactConfirmation,
  sendEstimatorLeadNotification,
  sendInquiryNotification,
  sendPurchaseConfirmation,
} from "@/lib/email";
import { getNotificationEmail } from "@/lib/site-settings";
import { createResendMock } from "@/lib/test/mocks/resend";

const mockedGetNotificationEmail = getNotificationEmail as any;

// ── Helpers ────────────────────────────────────────────────────────────────────

function setResendEnv() {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM_EMAIL = "noreply@devix.test";
}

function clearResendEnv() {
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
}

// ── escapeHtml (already tested but included for completeness) ──────────────────

describe("escapeHtml", () => {
  it("escapes all HTML-sensitive characters", () => {
    expect(escapeHtml(`<script>alert("xss")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("cats & dogs")).toBe("cats &amp; dogs");
  });
});

// ── sendInquiryNotification ────────────────────────────────────────────────────

describe("sendInquiryNotification", () => {
  beforeEach(() => {
    resendMock = createResendMock();
    setResendEnv();
    mockedGetNotificationEmail.mockResolvedValue("admin@devix.test");
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  afterEach(() => {
    clearResendEnv();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.clearAllMocks();
  });

  it("returns without sending when RESEND_API_KEY is missing", async () => {
    clearResendEnv();
    await sendInquiryNotification({
      name: "Alice",
      email: "alice@example.com",
      message: "Hello",
    });
    expect(resendMock.emails.send).not.toHaveBeenCalled();
  });

  it("returns without sending when no notification email is configured", async () => {
    mockedGetNotificationEmail.mockResolvedValue(null);
    await sendInquiryNotification({
      name: "Alice",
      email: "alice@example.com",
      message: "Hello",
    });
    expect(resendMock.emails.send).not.toHaveBeenCalled();
  });

  it("sends email with correct subject for contact source", async () => {
    await sendInquiryNotification({
      name: "Bob",
      email: "bob@example.com",
      message: "Test message",
      source: "contact",
    });

    expect(resendMock.emails.send).toHaveBeenCalledTimes(1);
    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.subject).toContain("Contact Form");
    expect(call.to).toEqual(["admin@devix.test"]);
    expect(call.html).toContain("Bob");
    expect(call.html).toContain("bob@example.com");
    expect(call.html).toContain("Test message");
  });

  it("uses 'Estimator Lead' label for estimator source", async () => {
    await sendInquiryNotification({
      name: "Carol",
      email: "carol@example.com",
      message: "Need a webapp",
      source: "estimator",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.subject).toContain("Estimator Lead");
  });

  it("handles Resend API error gracefully without throwing", async () => {
    resendMock.emails.send.mockResolvedValueOnce({
      data: null,
      error: { message: "rate limit" },
    });

    // Should not throw
    await expect(
      sendInquiryNotification({
        name: "Dave",
        email: "dave@example.com",
        message: "hi",
      }),
    ).resolves.toBeUndefined();
  });

  it("escapes HTML in name and message", async () => {
    await sendInquiryNotification({
      name: "<script>alert(1)</script>",
      email: "attacker@example.com",
      message: "<b>bold</b>",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).not.toContain("<script>");
    expect(call.html).toContain("&lt;script&gt;");
  });
});

// ── sendContactConfirmation ────────────────────────────────────────────────────

describe("sendContactConfirmation", () => {
  beforeEach(() => {
    resendMock = createResendMock();
    setResendEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  afterEach(() => {
    clearResendEnv();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.clearAllMocks();
  });

  it("returns without sending when not configured", async () => {
    clearResendEnv();
    await sendContactConfirmation({ name: "Eve", email: "eve@example.com" });
    expect(resendMock.emails.send).not.toHaveBeenCalled();
  });

  it("sends confirmation email to the buyer's address", async () => {
    await sendContactConfirmation({
      name: "Frank",
      email: "frank@example.com",
      source: "contact",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.to).toEqual(["frank@example.com"]);
    expect(call.html).toContain("Frank");
    expect(call.html).toContain("24 hours");
  });

  it("uses estimator copy for estimator source", async () => {
    await sendContactConfirmation({
      name: "Grace",
      email: "grace@example.com",
      source: "estimator",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("consultation");
  });

  it("uses contact copy for contact source (or default)", async () => {
    await sendContactConfirmation({
      name: "Hank",
      email: "hank@example.com",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("reaching out");
  });

  it("handles Resend error gracefully", async () => {
    resendMock.emails.send.mockResolvedValueOnce({
      data: null,
      error: { message: "provider error" },
    });

    await expect(
      sendContactConfirmation({ name: "Ivy", email: "ivy@example.com" }),
    ).resolves.toBeUndefined();
  });
});

// ── sendEstimatorLeadNotification ─────────────────────────────────────────────

describe("sendEstimatorLeadNotification", () => {
  beforeEach(() => {
    resendMock = createResendMock();
    setResendEnv();
    mockedGetNotificationEmail.mockResolvedValue("admin@devix.test");
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  afterEach(() => {
    clearResendEnv();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.clearAllMocks();
  });

  const baseData = {
    leadId: "lead_1",
    projectType: "webapp",
    designApproach: "custom",
    platform: null,
    scope: "medium",
    complexity: "standard",
    timeline: "standard",
    budgetDisplay: "$5,000",
    currency: "USD",
    excludedDeliverables: null,
  };

  it("returns without sending when not configured", async () => {
    clearResendEnv();
    await sendEstimatorLeadNotification(baseData);
    expect(resendMock.emails.send).not.toHaveBeenCalled();
  });

  it("returns without sending when no notification email", async () => {
    mockedGetNotificationEmail.mockResolvedValue(null);
    await sendEstimatorLeadNotification(baseData);
    expect(resendMock.emails.send).not.toHaveBeenCalled();
  });

  it("sends email with correct subject and lead details", async () => {
    await sendEstimatorLeadNotification(baseData);

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.subject).toContain("webapp");
    expect(call.subject).toContain("$5,000");
    expect(call.html).toContain("webapp");
    expect(call.html).toContain("custom");
  });

  it("formats excludedDeliverables as 'None' when null", async () => {
    await sendEstimatorLeadNotification({
      ...baseData,
      excludedDeliverables: null,
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("None");
  });

  it("formats excludedDeliverables from empty array as 'None'", async () => {
    await sendEstimatorLeadNotification({
      ...baseData,
      excludedDeliverables: [],
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("None");
  });

  it("formats excludedDeliverables from string array", async () => {
    await sendEstimatorLeadNotification({
      ...baseData,
      excludedDeliverables: ["SEO", "Analytics"],
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("SEO");
    expect(call.html).toContain("Analytics");
  });

  it("formats excludedDeliverables from object array with label", async () => {
    await sendEstimatorLeadNotification({
      ...baseData,
      excludedDeliverables: [{ label: "Blog Module" }, { label: "Auth" }],
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("Blog Module");
    expect(call.html).toContain("Auth");
  });

  it("handles Resend error gracefully", async () => {
    resendMock.emails.send.mockResolvedValueOnce({
      data: null,
      error: { message: "provider error" },
    });

    await expect(
      sendEstimatorLeadNotification(baseData),
    ).resolves.toBeUndefined();
  });
});

// ── sendPurchaseConfirmation ───────────────────────────────────────────────────

describe("sendPurchaseConfirmation", () => {
  beforeEach(() => {
    resendMock = createResendMock();
    setResendEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  afterEach(() => {
    clearResendEnv();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.clearAllMocks();
  });

  it("throws when Resend is not configured", async () => {
    clearResendEnv();
    await expect(
      sendPurchaseConfirmation({
        name: "Jack",
        email: "jack@example.com",
        productName: "Starter Kit",
        downloadToken: "tok_abc",
      }),
    ).rejects.toThrow(/RESEND_API_KEY/);
  });

  it("sends purchase email with correct download URL", async () => {
    await sendPurchaseConfirmation({
      name: "Kelly",
      email: "kelly@example.com",
      productName: "Pro Template",
      downloadToken: "tok_xyz",
      siteUrl: "https://devix.test",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.to).toEqual(["kelly@example.com"]);
    expect(call.subject).toContain("Pro Template");
    expect(call.html).toContain("https://devix.test/download/tok_xyz");
    expect(call.html).toContain("Kelly");
  });

  it("uses NEXT_PUBLIC_SITE_URL as fallback when siteUrl is not provided", async () => {
    await sendPurchaseConfirmation({
      name: "Leo",
      email: "leo@example.com",
      productName: "Design Pack",
      downloadToken: "tok_fallback",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("https://devix.test/download/tok_fallback");
  });

  it("strips trailing slash from siteUrl", async () => {
    await sendPurchaseConfirmation({
      name: "Mia",
      email: "mia@example.com",
      productName: "Kit",
      downloadToken: "tok_slash",
      siteUrl: "https://devix.test/",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).not.toContain("//download");
    expect(call.html).toContain("/download/tok_slash");
  });

  it("throws when Resend returns an error (for webhook retry)", async () => {
    resendMock.emails.send.mockResolvedValueOnce({
      data: null,
      error: { message: "delivery failed" },
    });

    await expect(
      sendPurchaseConfirmation({
        name: "Nina",
        email: "nina@example.com",
        productName: "Widget",
        downloadToken: "tok_err",
      }),
    ).rejects.toThrow("delivery failed");
  });

  it("encodes special characters in download token", async () => {
    await sendPurchaseConfirmation({
      name: "Oscar",
      email: "oscar@example.com",
      productName: "Pack",
      downloadToken: "tok with spaces",
    });

    const call = resendMock.emails.send.mock.calls[0][0];
    expect(call.html).toContain("tok%20with%20spaces");
  });
});
