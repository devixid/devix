"use client";

import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { SlideUp } from "@/components/animations/SlideUp";
import { HeadingStatic } from "@/components/atoms/Heading/HeadingStatic";
import type { ProjectListItem } from "@/types/projects";

// Import filter UI components that we'll build next
import SearchInput from "@/components/molecules/projects/SearchInput";
import CategoryTabs from "@/components/molecules/projects/CategoryTabs";
import FilterChips from "@/components/molecules/projects/FilterChips";
import ActiveFilters from "@/components/molecules/projects/ActiveFilters";
import SortDropdown from "@/components/molecules/projects/SortDropdown";
import ProjectCard from "@/components/molecules/projects/ProjectCard";
import Pagination from "@/components/molecules/projects/Pagination";

interface ProjectsClientProps {
  initialProjects: ProjectListItem[];
  filterOptions: {
    categories: string[];
    techStacks: string[];
    developers: string[];
  };
}

const ITEMS_PER_PAGE = 6;

export default function ProjectsClient({
  initialProjects,
  filterOptions,
}: ProjectsClientProps) {
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

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...initialProjects];

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
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // 3. Tech Stack Filter
    if (activeTechStacks.length > 0) {
      result = result.filter((p) =>
        activeTechStacks.every((tech) =>
          p.techStacks.some((t) => t.name === tech),
        ),
      );
    }

    // 4. Developer Filter
    if (activeDevelopers.length > 0) {
      result = result.filter((p) =>
        activeDevelopers.every((dev) =>
          p.developers.some((d) => d.name === dev),
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
    initialProjects,
    searchQuery,
    activeCategory,
    activeTechStacks,
    activeDevelopers,
    sortBy,
  ]);

  // Pagination Logic
  const totalPages = Math.ceil(
    filteredAndSortedProjects.length / ITEMS_PER_PAGE,
  );
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters =
    activeCategory !== "All" ||
    activeTechStacks.length > 0 ||
    activeDevelopers.length > 0 ||
    searchQuery.trim() !== "";

  const clearAllFilters = () => {
    handleFilterChange(() => {
      setSearchQuery("");
      setActiveCategory("All");
      setActiveTechStacks([]);
      setActiveDevelopers([]);
    });
  };

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
            Our Work
          </SlideUp>
          <SlideUp
            yOffset={20}
            duration={0.8}
            delay={0.1}
          >
            <HeadingStatic
              level="h1"
              className="text-5xl font-extralight text-black md:text-6xl"
            >
              Projects.
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
          <CategoryTabs
            categories={["All", ...filterOptions.categories]}
            activeCategory={activeCategory}
            onChange={(c) => handleFilterChange(() => setActiveCategory(c))}
          />
        </div>
        <div className="flex items-center lg:justify-end">
          <SortDropdown
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>

      {/* Advanced Filters: Tech Stacks & Developers */}
      <div className="mb-8 flex flex-col gap-y-6 rounded-xl border border-zinc-100 bg-zinc-50 p-6 md:flex-row md:gap-x-12">
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
      </div>

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
          resultsCount={filteredAndSortedProjects.length}
        />
      )}

      {/* Grid */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="popLayout">
          {paginatedProjects.length > 0 ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
            >
              {paginatedProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={idx}
                  priority={currentPage === 1 && idx === 0}
                />
              ))}
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
                No projects found
              </h3>
              <p className="max-w-md text-zinc-500">
                We couldn't find any projects matching your current filters. Try
                adjusting your search or clearing some filters.
              </p>
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
