import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-16 flex items-center justify-center gap-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all ${
              isActive
                ? "bg-black text-white shadow-md"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
