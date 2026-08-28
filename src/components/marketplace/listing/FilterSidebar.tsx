"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterDefinition, FilterOption } from "./types";
import { Button } from "@/components/ui";

interface FilterSectionProps {
  definition: FilterDefinition;
  value: string;
  onChange: (key: string, value: string) => void;
  options?: FilterOption[];
  className?: string;
}

function FilterSection({ definition, value, onChange, options, className }: FilterSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const showAll = options && options.length > 8;

  if (definition.type === "range") {
    return (
      <div className={cn("space-y-2", className)}>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{definition.label}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={definition.min ? String(definition.min) : "Min"}
            value={value}
            onChange={(e) => onChange(definition.key, e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
            min={definition.min}
            max={definition.max}
            step={definition.step}
          />
          <span className="text-neutral-400 text-sm">–</span>
          <input
            type="number"
            placeholder={definition.max ? String(definition.max) : "Max"}
            value={""}
            onChange={() => {}}
            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
            min={definition.min}
            max={definition.max}
            step={definition.step}
          />
        </div>
      </div>
    );
  }

  if (definition.type === "radio" && options) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{definition.label}</h3>
        <button
          onClick={() => onChange(definition.key, "")}
          className={cn(
            "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
            !value ? "bg-primary-50 text-primary-700 font-medium" : "text-neutral-700 hover:bg-neutral-50"
          )}
        >
          All {definition.label}s
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(definition.key, value === opt.value ? "" : opt.value)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between",
              value === opt.value ? "bg-primary-50 text-primary-700 font-medium" : "text-neutral-700 hover:bg-neutral-50"
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span className="text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">{opt.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (definition.type === "checkbox" && options) {
    const visibleOptions = expanded || !showAll ? options : options.slice(0, 8);
    
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{definition.label}</h3>
          {showAll && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary-600 hover:underline flex items-center gap-0.5"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        {visibleOptions.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.split(",").includes(opt.value)}
              onChange={(e) => {
                const current = value.split(",").filter(Boolean);
                const next = e.target.checked 
                  ? [...current, opt.value] 
                  : current.filter(v => v !== opt.value);
                onChange(definition.key, next.join(","));
              }}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 accent-primary-600"
            />
            <span className="text-sm text-neutral-700">{opt.label}</span>
            {opt.count !== undefined && (
              <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">{opt.count}</span>
            )}
          </label>
        ))}
      </div>
    );
  }

  return null;
}

interface FilterSidebarProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  activeCount: number;
  categories: { id: string; name: string; icon: string }[];
  campuses: { id: string; name: string; abbreviation: string }[];
  categoryId: string;
  definitions: FilterDefinition[];
  className?: string;
}

export function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onClear, 
  activeCount, 
  categories, 
  campuses, 
  categoryId,
  definitions,
  className 
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={cn("hidden lg:block w-64 shrink-0", className)}>
      <div className="sticky top-20 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-neutral-900" />
            <span className="font-semibold text-neutral-900 text-sm">Filters</span>
            {activeCount > 0 && (
              <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button onClick={onClear} className="text-xs text-primary-600 hover:underline">Clear all</button>
          )}
        </div>

        {/* Category Filter */}
        <FilterSection
          definition={{ key: "categoryId", label: "Category", type: "radio", options: [] }}
          value={filters.categoryId || ""}
          onChange={onFilterChange}
          options={[
            { value: "", label: "All Categories" },
            ...categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` })),
          ]}
        />

        {/* Campus Filter */}
        <FilterSection
          definition={{ key: "campusId", label: "Campus", type: "radio", options: [] }}
          value={filters.campusId || ""}
          onChange={onFilterChange}
          options={[
            { value: "", label: "All Campuses" },
            ...campuses.map(c => ({ value: c.id, label: c.name })),
          ]}
        />

        {/* Dynamic Category Filters */}
        {definitions.map((def) => (
          <div key={def.key} className="border-t border-neutral-100 pt-4">
            <FilterSection
              definition={def}
              value={filters[def.key] || ""}
              onChange={onFilterChange}
              options={def.options}
            />
          </div>
        ))}
      </div>
    </div>
  );
}