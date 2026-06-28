import { useState, useRef, useEffect } from "react";
import { searchCourses, type UfscCourse } from "@/data/ufsc-courses";

interface CourseAutocompleteProps {
  value: string;
  onChange: (course: UfscCourse) => void;
  onInput: (value: string) => void;
  className?: string;
  error?: string;
}

export function CourseAutocomplete({ value, onChange, onInput, className, error }: CourseAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<UfscCourse[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const results = searchCourses(value);
    setSuggestions(results);
    setActiveIndex(-1);
    setOpen(results.length > 0 && value.trim().length > 0);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function select(course: UfscCourse) {
    onChange(course);
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        className={className}
        placeholder="ex: Artes Cênicas, Ciência da Computação…"
        value={value}
        autoComplete="off"
        onChange={e => onInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {error && <p className="text-sm font-medium text-destructive mt-1">{error}</p>}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((c, i) => (
            <li
              key={c.name}
              onMouseDown={e => { e.preventDefault(); select(c); }}
              className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span className="font-medium">{c.name}</span>
              <span className={`text-xs ml-2 shrink-0 px-1.5 py-0.5 rounded font-mono ${
                i === activeIndex
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {c.department}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
