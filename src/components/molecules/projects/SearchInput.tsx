import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange]);

  // Sync if value changes externally (e.g. from clear all)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="group relative w-full">
      <div className="group-focus-within:text-accent pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 transition-colors">
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder="Search projects..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="focus:border-accent focus:ring-accent/10 h-12 w-full rounded-full border border-zinc-200 bg-white pr-4 pl-11 text-sm text-black transition-all duration-300 outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:ring-4"
      />
    </div>
  );
}
