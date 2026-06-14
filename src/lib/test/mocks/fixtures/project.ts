export type ProjectTechStackFixture = {
  id: string;
  name: string;
  projectId: string;
};

export type ProjectDeveloperFixture = {
  id: string;
  name: string;
  role: string | null;
  projectId: string;
};

export type ProjectFixture = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  category: string;
  imageUrl: string;
  liveUrl: string | null;
  githubUrl: string | null;
  isFeatured: boolean;
  isVisible: boolean;
  featuredOrder: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  techStacks: ProjectTechStackFixture[];
  developers: ProjectDeveloperFixture[];
};

export function buildProjectTechStack(
  overrides: Partial<ProjectTechStackFixture> = {},
): ProjectTechStackFixture {
  return {
    id: "techstack_fixture_1",
    name: "Next.js",
    projectId: "proj_fixture_1",
    ...overrides,
  };
}

export function buildProjectDeveloper(
  overrides: Partial<ProjectDeveloperFixture> = {},
): ProjectDeveloperFixture {
  return {
    id: "dev_fixture_1",
    name: "Jane Doe",
    role: "Full-stack",
    projectId: "proj_fixture_1",
    ...overrides,
  };
}

export function buildProject(
  overrides: Partial<ProjectFixture> = {},
): ProjectFixture {
  return {
    id: "proj_fixture_1",
    title: "Test Project",
    slug: "test-project",
    description: "A test project for unit tests.",
    content: null,
    category: "web",
    imageUrl: "/images/test-project.jpg",
    liveUrl: "https://example.com",
    githubUrl: null,
    isFeatured: false,
    isVisible: true,
    featuredOrder: 0,
    completedAt: null,
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    techStacks: [buildProjectTechStack()],
    developers: [buildProjectDeveloper()],
    ...overrides,
  };
}
