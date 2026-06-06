"use client";

import { useState, useEffect } from "react";
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
import { reorderTestimonials } from "@/actions/admin";
import { useRouter } from "next/navigation";
import TestimonialCard from "./TestimonialCard";

interface TestimonialType {
  id: string;
  clientName: string;
  clientRole: string;
  company: string;
  content: string;
  avatarUrl: string | null;
  isVisible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

function SortableTestimonialItem({
  testimonial,
  onEdit,
}: {
  testimonial: TestimonialType;
  onEdit: (t: TestimonialType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2"
    >
      <button
        type="button"
        className="mt-6 shrink-0 cursor-grab text-zinc-600 hover:text-zinc-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <div className="flex-1">
        <TestimonialCard
          testimonial={testimonial}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

export default function SortableTestimonialList({
  testimonials,
  onEdit,
}: {
  testimonials: TestimonialType[];
  onEdit: (t: TestimonialType) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState(testimonials);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(testimonials);
  }, [testimonials]);

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
      await reorderTestimonials(newItems.map((i) => i.id));
      router.refresh();
    } catch (err) {
      console.error(err);
      setItems(testimonials);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {saving && <p className="text-xs text-zinc-500">Saving new order...</p>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((testimonial) => (
              <SortableTestimonialItem
                key={testimonial.id}
                testimonial={testimonial}
                onEdit={onEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
