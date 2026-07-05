import { useState, useRef, useEffect } from "react";
import {
  Palette, Microscope, Scale, HeartPulse, Trophy,
  GraduationCap, Brain, Atom, TrendingUp, Cpu,
  MapPin, TreePine, Factory, LucideIcon,
} from "lucide-react";
import { searchCourses, type UfscCourse, DEPARTMENT_CONFIG } from "@/data/ufsc-courses";

const DEPT_ICONS: Record<string, LucideIcon> = {
  CCE: Palette,
  CCB: Microscope,
  CCJ: Scale,
  CCS: HeartPulse,
  CDS: Trophy,
  CED: GraduationCap,
  CFH: Brain,
  CFM: Atom,
  CSE: TrendingUp,
  CTC: Cpu,
  ARA: MapPin,
  BNU: MapPin,
  CBS: TreePine,
  JOI: Factory,
};

interface CourseAutocompleteProps {
  value: string;
  onChange: (course: UfscCourse) => void;
  onInput: (value: string) => void;
  className?: string;
  error?: string;
}

export function DepartmentBadge({ code }: { code: string }) {
  const config = DEPARTMENT_CONFIG[code];
  if (!config) return null;
  const Icon = DEPT_ICONS[code];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeBg} ${config.badgeText} ${config.border}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {code}
    </span>
  );
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
        <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((c, i) => {
            const config = DEPARTMENT_CONFIG[c.department];
            const Icon = DEPT_ICONS[c.department];
            const isActive = i === activeIndex;
            return (
              <li
                key={c.name}
                onMouseDown={e => { e.preventDefault(); select(c); }}
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                  isActive
                    ? config
                      ? `${config.bg} ${config.text}`
                      : "bg-primary/10 text-primary"
                    : "hover:bg-muted/60"
                }`}
              >
                <span className="font-medium truncate pr-2">{c.name}</span>
                {config && (
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? `${config.badgeBg} ${config.badgeText} ${config.border}`
                        : `${config.badgeBg} ${config.badgeText} ${config.border}`
                    }`}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {c.department}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
