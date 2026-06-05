interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="scrollbar-hide flex w-full gap-x-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isActive
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
