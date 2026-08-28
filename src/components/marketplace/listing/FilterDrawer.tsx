"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterDefinition } from "./types";
import { Button } from "@/components/ui";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  activeCount: number;
  categories: { id: string; name: string; icon: string }[];
  campuses: { id: string; name: string; abbreviation: string }[];
  categoryId: string;
  definitions: FilterDefinition[];
}

export function FilterDrawer({ 
  open, 
  onClose, 
  filters, 
  onFilterChange, 
  onClear, 
  activeCount, 
  categories, 
  campuses, 
  categoryId,
  definitions,
}: FilterDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filter-drawer-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white flex flex-col shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 id="filter-drawer-title" className="flex items-center gap-2 font-semibold text-neutral-900">
            <SlidersHorizontal className="w-5 h-5 text-primary-600" />
            Filters
            {activeCount > 0 && (
              <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Close filters">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
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

        <div className="p-4 border-t border-neutral-200 flex gap-3">
          <Button variant="outline" onClick={onClear} className="flex-1" disabled={activeCount === 0}>
            <X className="h-4 w-4 mr-2" /> Clear all
          </Button>
          <Button onClick={onClose} className="flex-1">
            Show products
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ definition, value, onChange, options }: { 
  definition: FilterDefinition; 
  value: string; 
  onChange: (key: string, value: string) => void;
  options?: Array<{ value: string; label: string }>;
}) {
  const [expanded, setExpanded] = useState(true);
  const showAll = options && options.length > 8;

  if (definition.type === "range") {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{definition.label}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={definition.min ? String(definition.min) : "Min"}
            value={value}
            onChange={(e) => onChange(definition.key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-primary-600"
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
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-primary-600"
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
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{definition.label}</h3>
        <button
          onClick={() => onChange(definition.key, "")}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
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
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
              value === opt.value ? "bg-primary-50 text-primary-700 font-medium" : "text-neutral-700 hover:bg-neutral-50"
            )}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (definition.type === "checkbox" && options) {
    const visibleOptions = expanded || !showAll ? options : options.slice(0, 8);
    
    return (
      <div className="space-y-1.5">
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
          </label>
        ))}
      </div>
    );
  }

  return null;
}