import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div
      className="flex gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${iconClass} ${
            value <= rating
              ? "fill-[#C8A96E] text-[#C8A96E]"
              : "text-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}
