import ProjectForm from "@/components/admin/ProjectForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      techStacks: true,
      developers: true,
    },
  });

  if (!project) {
    notFound();
  }

  return <ProjectForm initialData={project} />;
}
