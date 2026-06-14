import { vi, type Mock } from "vitest";

type PurchaseMocks = {
  findUnique: Mock;
  findFirst: Mock;
  create: Mock;
  update: Mock;
  updateMany: Mock;
};

type ProductMocks = {
  findUnique: Mock;
};

type UserMocks = {
  findUnique: Mock;
};

type SiteSettingsMocks = {
  findUnique: Mock;
  upsert: Mock;
};

type FaqItemMocks = {
  findMany: Mock;
};

type ServiceItemMocks = {
  findMany: Mock;
};

type TeamMemberMocks = {
  findMany: Mock;
};

type SiteSectionMocks = {
  findUnique: Mock;
};

type ProjectMocks = {
  findMany: Mock;
  findUnique: Mock;
};

type ProjectTechStackMocks = {
  findMany: Mock;
};

type ProjectDeveloperMocks = {
  findMany: Mock;
};

type ProcessedPaymentEventMocks = {
  create: Mock;
  delete: Mock;
};

type EstimatorLeadMocks = {
  findUnique: Mock;
  create: Mock;
  update: Mock;
  updateMany: Mock;
};

type ContactSubmissionMocks = {
  create: Mock;
  update: Mock;
};

export type MockPrismaMocks = {
  purchase: PurchaseMocks;
  product: ProductMocks;
  user: UserMocks;
  siteSettings: SiteSettingsMocks;
  faqItem: FaqItemMocks;
  serviceItem: ServiceItemMocks;
  teamMember: TeamMemberMocks;
  siteSection: SiteSectionMocks;
  project: ProjectMocks;
  projectTechStack: ProjectTechStackMocks;
  projectDeveloper: ProjectDeveloperMocks;
  processedPaymentEvent: ProcessedPaymentEventMocks;
  estimatorLead: EstimatorLeadMocks;
  contactSubmission: ContactSubmissionMocks;
};

export type MockPrismaClient = MockPrismaMocks;

function createDelegate<T extends Record<string, Mock>>(methods: (keyof T)[]): T {
  return Object.fromEntries(
    methods.map((method) => [method, vi.fn()]),
  ) as T;
}

export function buildPrismaMocks(): {
  prisma: MockPrismaClient;
  mocks: MockPrismaMocks;
} {
  return createMockPrisma();
}

export function createMockPrisma(): {
  prisma: MockPrismaClient;
  mocks: MockPrismaMocks;
} {
  const mocks: MockPrismaMocks = {
    purchase: createDelegate<PurchaseMocks>([
      "findUnique",
      "findFirst",
      "create",
      "update",
      "updateMany",
    ]),
    product: createDelegate<ProductMocks>(["findUnique"]),
    user: createDelegate<UserMocks>(["findUnique"]),
    siteSettings: createDelegate<SiteSettingsMocks>(["findUnique", "upsert"]),
    faqItem: createDelegate<FaqItemMocks>(["findMany"]),
    serviceItem: createDelegate<ServiceItemMocks>(["findMany"]),
    teamMember: createDelegate<TeamMemberMocks>(["findMany"]),
    siteSection: createDelegate<SiteSectionMocks>(["findUnique"]),
    project: createDelegate<ProjectMocks>(["findMany", "findUnique"]),
    projectTechStack: createDelegate<ProjectTechStackMocks>(["findMany"]),
    projectDeveloper: createDelegate<ProjectDeveloperMocks>(["findMany"]),
    processedPaymentEvent: createDelegate<ProcessedPaymentEventMocks>(["create", "delete"]),
    estimatorLead: createDelegate<EstimatorLeadMocks>([
      "findUnique",
      "create",
      "update",
      "updateMany",
    ]),
    contactSubmission: createDelegate<ContactSubmissionMocks>([
      "create",
      "update",
    ]),
  };

  return { prisma: mocks, mocks };
}

export function resetMockPrisma(mocks: MockPrismaMocks): void {
  for (const delegate of Object.values(mocks)) {
    for (const method of Object.values(delegate)) {
      method.mockReset();
    }
  }
}
