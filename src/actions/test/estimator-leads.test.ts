import { describe, expect, it, vi, beforeEach } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";

// Mock Prisma
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

// Mock Email sending functions
vi.mock("@/lib/email", () => ({
  sendClientEstimateEmail: vi.fn().mockResolvedValue(undefined),
  sendEstimatorLeadNotification: vi.fn().mockResolvedValue(undefined),
}));

// Mock Next.js cache revalidation to prevent Invariant exception in tests
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Initialize mocks registry and import the action
import "@/lib/prisma";
import { emailEstimateToClientAction } from "@/actions/estimator-leads";
import { sendClientEstimateEmail } from "@/lib/email";
import type { EstimatorState } from "@/types/estimator";

const mockSendClientEstimateEmail = sendClientEstimateEmail as any;

describe("emailEstimateToClientAction", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
    vi.clearAllMocks();
  });

  const validState: EstimatorState = {
    type: "webapp",
    designApproach: null,
    platform: null,
    scope: "medium",
    complexity: "standard",
    timeline: "standard",
    excludedDeliverableIds: [],
  };

  it("rejects invalid name", async () => {
    const result = await emailEstimateToClientAction({
      name: "",
      email: "jane@example.com",
      state: validState,
      budgetDisplay: "$10,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Name must be at least 2 characters.");
    expect(getTestMocks().prisma!.estimatorLead.create).not.toHaveBeenCalled();
  });

  it("rejects invalid email address", async () => {
    const result = await emailEstimateToClientAction({
      name: "Jane",
      email: "invalid-email",
      state: validState,
      budgetDisplay: "$10,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Please enter a valid email address.");
  });

  it("rejects incomplete estimator state", async () => {
    const result = await emailEstimateToClientAction({
      name: "Jane",
      email: "jane@example.com",
      state: { ...validState, scope: null }, // missing scope
      budgetDisplay: "$10,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("estimate looks incomplete");
  });

  it("creates a new lead and contact submission when no leadId is provided", async () => {
    getTestMocks().prisma!.estimatorLead.create.mockResolvedValueOnce({
      id: "lead_new_123",
      shareToken: "token_new_123",
    });
    getTestMocks().prisma!.contactSubmission.create.mockResolvedValueOnce({
      id: "submission_new_123",
    });

    const result = await emailEstimateToClientAction({
      name: "Jane Doe",
      email: "jane@example.com",
      state: validState,
      budgetDisplay: "$15,000",
      currency: "USD",
      excludedLabels: ["SEO"],
      pdfBase64: "base64_data",
    });

    expect(result.ok).toBe(true);
    expect(result.leadId).toBe("lead_new_123");

    expect(getTestMocks().prisma!.estimatorLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectType: "webapp",
          budgetDisplay: "$15,000",
        }),
      })
    );

    expect(getTestMocks().prisma!.contactSubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Jane Doe",
          email: "jane@example.com",
          estimatorLeadId: "lead_new_123",
        }),
      })
    );

    expect(mockSendClientEstimateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        email: "jane@example.com",
        pdfBase64: "base64_data",
        summary: expect.objectContaining({
          budgetDisplay: "$15,000",
        }),
      })
    );
  });

  it("updates existing lead and creates contact submission if none exists", async () => {
    getTestMocks().prisma!.estimatorLead.findUnique.mockResolvedValueOnce({
      id: "lead_exist_123",
      contactSubmission: null, // no contact submission linked yet
    });
    getTestMocks().prisma!.estimatorLead.update.mockResolvedValueOnce({
      id: "lead_exist_123",
      shareToken: "token_exist_123",
    });

    const result = await emailEstimateToClientAction({
      leadId: "lead_exist_123",
      name: "Jane Doe",
      email: "jane@example.com",
      state: validState,
      budgetDisplay: "$15,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(true);
    expect(result.leadId).toBe("lead_exist_123");

    expect(getTestMocks().prisma!.estimatorLead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "lead_exist_123" },
      })
    );

    expect(getTestMocks().prisma!.contactSubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Jane Doe",
          email: "jane@example.com",
          estimatorLeadId: "lead_exist_123",
        }),
      })
    );
  });

  it("updates existing lead and updates contact submission if it already exists", async () => {
    getTestMocks().prisma!.estimatorLead.findUnique.mockResolvedValueOnce({
      id: "lead_exist_123",
      contactSubmission: {
        id: "submission_exist_123",
      },
    });
    getTestMocks().prisma!.estimatorLead.update.mockResolvedValueOnce({
      id: "lead_exist_123",
      shareToken: "token_exist_123",
    });

    const result = await emailEstimateToClientAction({
      leadId: "lead_exist_123",
      name: "Jane Updated",
      email: "updated@example.com",
      state: validState,
      budgetDisplay: "$12,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(true);
    expect(getTestMocks().prisma!.contactSubmission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "submission_exist_123" },
        data: {
          name: "Jane Updated",
          email: "updated@example.com",
        },
      })
    );
  });

  it("handles non-existent leadId by creating a new lead and submission", async () => {
    getTestMocks().prisma!.estimatorLead.findUnique.mockResolvedValueOnce(null); // not found
    getTestMocks().prisma!.estimatorLead.create.mockResolvedValueOnce({
      id: "lead_fallback_123",
    });

    const result = await emailEstimateToClientAction({
      leadId: "lead_not_found",
      name: "Jane",
      email: "jane@example.com",
      state: validState,
      budgetDisplay: "$10,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(true);
    expect(result.leadId).toBe("lead_fallback_123");
    expect(getTestMocks().prisma!.estimatorLead.create).toHaveBeenCalled();
    expect(getTestMocks().prisma!.contactSubmission.create).toHaveBeenCalled();
  });

  it("returns error on database connection failure gracefully", async () => {
    getTestMocks().prisma!.estimatorLead.create.mockRejectedValueOnce(
      new Error("Database disconnected")
    );

    const result = await emailEstimateToClientAction({
      name: "Jane Doe",
      email: "jane@example.com",
      state: validState,
      budgetDisplay: "$15,000",
      currency: "USD",
      excludedLabels: [],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("We could not send your estimate");
  });
});
