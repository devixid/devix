import { getTestimonials } from "@/actions/admin";
import TestimonialListContainer from "@/components/admin/TestimonialListContainer";

export const metadata = {
  title: "Testimonials Manager — Devix Operations",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return <TestimonialListContainer testimonials={testimonials} />;
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
