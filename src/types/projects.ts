/** Lean serializable shape for projects list — avoids full Prisma relation payloads. */
export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  liveUrl: string | null;
  githubUrl: string | null;
  completedAt: string | null;
  createdAt: string;
  techStacks: { id: string; name: string }[];
  developers: { id: string; name: string }[];
};
