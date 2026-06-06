"use client";

import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { SlideUp } from "@/components/animations/SlideUp";
import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";

// Import filter UI components
import SearchInput from "@/components/molecules/projects/SearchInput";
import CategoryTabs from "@/components/molecules/projects/CategoryTabs";
import FilterChips from "@/components/molecules/projects/FilterChips";
import ActiveFilters from "@/components/molecules/projects/ActiveFilters";
import SortDropdown from "@/components/molecules/projects/SortDropdown";
import Pagination from "@/components/molecules/projects/Pagination";

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  techStacks?: { id: string; name: string }[];
  developers?: { id: string; name: string }[];
  createdAt: string | Date;
  [key: string]: any;
}

// Import Cards
import ProjectCard from "@/components/molecules/projects/ProjectCard";
import { StoreProductCard } from "@/components/molecules/StoreProductCard";
import { Product } from "@prisma/client";

interface CatalogClientProps {
  title: string;
  eyebrow: string;
  items: CatalogItem[];
  filterOptions?: {
    categories?: string[];
    techStacks?: string[];
    developers?: string[];
  };
  cardType: "project" | "product";
  emptyStateMessage?: string;
}

const ITEMS_PER_PAGE = 6;

export default function CatalogClient({
  title,
  eyebrow,
  items,
  filterOptions,
  cardType,
  emptyStateMessage = "We couldn't find any items matching your current filters. Try adjusting your search or clearing some filters.",
}: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeTechStacks, setActiveTechStacks] = useState<string[]>([]);
  const [activeDevelopers, setActiveDevelopers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az" | "za">(
    "newest",
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  const handleFilterChange = (updater: () => void) => {
    setCurrentPage(1);
    updater();
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    // 2. Category Filter
    if (filterOptions?.categories && activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // 3. Tech Stack Filter
    if (filterOptions?.techStacks && activeTechStacks.length > 0) {
      result = result.filter((p) =>
        activeTechStacks.every((tech) =>
          p.techStacks?.some((t) => t.name === tech),
        ),
      );
    }

    // 4. Developer Filter
    if (filterOptions?.developers && activeDevelopers.length > 0) {
      result = result.filter((p) =>
        activeDevelopers.every((dev) =>
          p.developers?.some((d) => d.name === dev),
        ),
      );
    }

    // 5. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [
    items,
    searchQuery,
    activeCategory,
    activeTechStacks,
    activeDevelopers,
    sortBy,
    filterOptions,
  ]);

  // Pagination Logic
  const totalPages = Math.ceil(
    filteredAndSortedItems.length / ITEMS_PER_PAGE,
  );
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters =
    (filterOptions?.categories && activeCategory !== "All") ||
    (filterOptions?.techStacks && activeTechStacks.length > 0) ||
    (filterOptions?.developers && activeDevelopers.length > 0) ||
    searchQuery.trim() !== "";

  const clearAllFilters = () => {
    handleFilterChange(() => {
      setSearchQuery("");
      setActiveCategory("All");
      setActiveTechStacks([]);
      setActiveDevelopers([]);
    });
  };

  const hasAdvancedFilters =
    (filterOptions?.techStacks && filterOptions.techStacks.length > 0) ||
    (filterOptions?.developers && filterOptions.developers.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      {/* Header & Search */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SlideUp
            yOffset={12}
            duration={0.7}
            className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-400 uppercase"
          >
            {eyebrow}
          </SlideUp>
          <SlideUp yOffset={20} duration={0.8} delay={0.1}>
            <HeadingStatic
              level="h1"
              className="text-5xl font-extralight text-black md:text-6xl"
            >
              {title}
            </HeadingStatic>
          </SlideUp>
        </div>
        <SlideUp
          yOffset={20}
          duration={0.8}
          delay={0.2}
          className="w-full md:w-[350px]"
        >
          <SearchInput
            value={searchQuery}
            onChange={(v) => handleFilterChange(() => setSearchQuery(v))}
          />
        </SlideUp>
      </div>

      {/* Filter Bar */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-3">
          {filterOptions?.categories && filterOptions.categories.length > 0 && (
            <CategoryTabs
              categories={["All", ...filterOptions.categories]}
              activeCategory={activeCategory}
              onChange={(c) => handleFilterChange(() => setActiveCategory(c))}
            />
          )}
        </div>
        <div className="flex items-center lg:justify-end">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Advanced Filters: Tech Stacks & Developers */}
      {hasAdvancedFilters && (
        <div className="mb-8 flex flex-col gap-y-6 rounded-xl border border-zinc-100 bg-zinc-50 p-6 md:flex-row md:gap-x-12">
          {filterOptions?.techStacks && filterOptions.techStacks.length > 0 && (
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Filter by Technology
              </p>
              <FilterChips
                options={filterOptions.techStacks}
                selected={activeTechStacks}
                onChange={(selected) =>
                  handleFilterChange(() => setActiveTechStacks(selected))
                }
              />
            </div>
          )}
          {filterOptions?.developers && filterOptions.developers.length > 0 && (
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Filter by Developer
              </p>
              <FilterChips
                options={filterOptions.developers}
                selected={activeDevelopers}
                onChange={(selected) =>
                  handleFilterChange(() => setActiveDevelopers(selected))
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <ActiveFilters
          searchQuery={searchQuery}
          category={activeCategory}
          techStacks={activeTechStacks}
          developers={activeDevelopers}
          onRemoveSearch={() => handleFilterChange(() => setSearchQuery(""))}
          onRemoveCategory={() =>
            handleFilterChange(() => setActiveCategory("All"))
          }
          onRemoveTech={(t) =>
            handleFilterChange(() =>
              setActiveTechStacks((prev) => prev.filter((x) => x !== t)),
            )
          }
          onRemoveDev={(d) =>
            handleFilterChange(() =>
              setActiveDevelopers((prev) => prev.filter((x) => x !== d)),
            )
          }
          onClearAll={clearAllFilters}
          resultsCount={filteredAndSortedItems.length}
        />
      )}

      {/* Grid */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="popLayout">
          {paginatedItems.length > 0 ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
            >
              {paginatedItems.map((item, idx) => {
                const isPriority = currentPage === 1 && idx === 0;
                if (cardType === "project") {
                  return (
                    <ProjectCard
                      key={item.id}
                      project={item as any}
                      index={idx}
                      priority={isPriority}
                    />
                  );
                }
                return (
                  <StoreProductCard
                    key={item.id}
                    product={item as any}
                    index={idx}
                    priority={isPriority}
                  />
                );
              })}
            </m.div>
          ) : (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-display mb-2 text-2xl text-black">
                No items found
              </h3>
              <p className="max-w-md text-zinc-500">{emptyStateMessage}</p>
              <button
                onClick={clearAllFilters}
                className="text-accent hover:text-accent-light mt-8 text-sm font-medium tracking-wider uppercase"
              >
                Clear all filters
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
