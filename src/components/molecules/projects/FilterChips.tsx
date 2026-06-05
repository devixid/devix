import { Check } from "lucide-react";

interface FilterChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function FilterChips({
  options,
  selected,
  onChange,
}: FilterChipsProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  if (options.length === 0)
    return <p className="text-sm text-zinc-400">No options available</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => toggle(option)}
            className={`flex items-center gap-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              isSelected
                ? "border-accent bg-accent/10 text-accent-light"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {isSelected && (
              <Check
                size={12}
                className="text-accent"
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
}
