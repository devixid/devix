"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderFeaturedProjects } from "@/actions/admin/projects";
import { useRouter } from "next/navigation";

interface FeaturedProject {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
}

function SortableItem({ project }: { project: FeaturedProject }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 border border-zinc-800 bg-[#121212] p-4"
    >
      <button
        type="button"
        className="cursor-grab text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <div className="relative h-12 w-20 shrink-0 overflow-hidden bg-zinc-900">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-200">
          {project.title}
        </p>
        <p className="truncate text-xs text-zinc-500">/{project.slug}</p>
      </div>
    </div>
  );
}

export default function FeaturedOrderEditor({
  initialProjects,
}: {
  initialProjects: FeaturedProject[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialProjects);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    setSaving(true);
    try {
      await reorderFeaturedProjects(newItems.map((i) => i.id));
      router.refresh();
    } catch (err) {
      console.error(err);
      setItems(initialProjects);
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No featured projects. Mark projects as featured to reorder them here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        Drag to reorder how featured projects appear on the homepage.
        {saving && " Saving..."}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((project) => (
              <SortableItem key={project.id} project={project} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
