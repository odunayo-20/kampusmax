"use client";

import { ReactNode, useMemo, useState } from "react";
import { cn, formatNairaCompact } from "@/lib/utils";

// ============================================================
// ChartCard - lightweight dependency-free SVG charts.
// Types: "bar" | "line" | "area" (vertical series) and
// "hbar" (horizontal ranked bars). Built for readability:
// gridlines, axis labels, value tooltips on hover/focus.
// ============================================================

export type ChartType = "bar" | "line" | "area" | "hbar";

export interface ChartDatum {
  label: string;
  value: number;
  /** Numeric series point, or a display-only annotation (e.g. "12%"). */
  secondary?: number | string;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: ChartType;
  data: ChartDatum[];
  formatValue?: (v: number) => string;
  height?: number; // px, plot height for bar/line/area
  accent?: "blue" | "gold" | "navy" | "green";
  toolbar?: ReactNode;
  loading?: boolean;
  className?: string;
  showXLabelsEvery?: number;
}

const ACCENTS = {
  blue: { fill: "#1769FF", soft: "rgba(23,105,255,0.12)", line: "#1769FF", secondary: "#0B1F3A" },
  gold: { fill: "#F5B942", soft: "rgba(245,185,66,0.16)", line: "#D49A20", secondary: "#0B1F3A" },
  navy: { fill: "#0B1F3A", soft: "rgba(11,31,58,0.10)", line: "#132D52", secondary: "#1769FF" },
  green: { fill: "#16A34A", soft: "rgba(22,163,74,0.12)", line: "#16A34A", secondary: "#0B1F3A" },
} as const;

const PLOT_W = 640;

function niceCeil(max: number): number {
  if (max <= 0) return 1;
  const exp = Math.floor(Math.log10(max));
  const base = Math.pow(10, exp);
  return Math.ceil(max / base + 0.49) * base;
}

function compactNumber(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

export function ChartCard({
  title,
  subtitle,
  type,
  data,
  formatValue = (v) => v.toLocaleString("en-NG"),
  height = 200,
  accent = "blue",
  toolbar,
  loading,
  className,
  showXLabelsEvery,
}: ChartCardProps) {
  const colors = ACCENTS[accent];
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const maxVal = useMemo(
    () => niceCeil(Math.max(...data.map((d) => d.value), 1)),
    [data]
  );

  const labelEvery =
    showXLabelsEvery ?? (data.length > 20 ? Math.ceil(data.length / 8) : data.length > 10 ? 2 : 1);

  return (
    <div
      className={cn(
        "rounded-lg border border-kampmax-border bg-white",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-kampmax-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-kampmax-text">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">{subtitle}</p>
          )}
        </div>
        {toolbar}
      </div>

      <div className={cn("p-4", loading && "animate-pulse")}>
        {loading ? (
          <div
            aria-hidden
            className="flex items-end gap-1.5 bg-kampmax-muted/60"
            style={{ height }}
          >
            {[38, 62, 45, 80, 55, 70, 92, 60, 75, 50].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-kampmax-muted" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-kampmax-text-secondary">
            No data for this period
          </p>
        ) : type === "hbar" ? (
          /* -------- horizontal ranked bars -------- */
          <ul className="space-y-3" role="list">
            {data.map((d, i) => {
              const pct = Math.round((d.value / maxVal) * 100);
              return (
                <li key={`${d.label}-${i}`} className="group">
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate font-medium text-kampmax-text">
                      {d.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-kampmax-text-secondary">
                      {formatValue(d.value)}
                      {d.secondary !== undefined && ` · ${d.secondary}`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-sm bg-kampmax-muted">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: colors.fill,
                        opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.45,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          /* -------- vertical SVG plots -------- */
          <div>
            <div className="relative" style={{ height }}>
              {/* Y gridlines */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-kampmax-text-secondary">
                      {formatValue(Math.round((maxVal * (3 - i)) / 3))}
                    </span>
                    <div className="h-px flex-1 bg-kampmax-border/80" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              {type === "bar" && (
                <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-[2px]">
                  {data.map((d, i) => (
                    <div
                      key={`${d.label}-${i}`}
                      className="group relative flex h-full flex-1 items-end"
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    >
                      <div
                        className="w-full rounded-t-[2px] transition-opacity"
                        style={{
                          height: `${(d.value / maxVal) * 100}%`,
                          minHeight: 2,
                          backgroundColor: colors.fill,
                          opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.4,
                        }}
                      />
                      {/* Tooltip */}
                      <div
                        role="status"
                        className={cn(
                          "pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-kampmax-navy px-2 py-1 text-[11px] font-medium text-white shadow-md transition-opacity",
                          hoverIdx === i ? "opacity-100" : "opacity-0"
                        )}
                      >
                        {formatValue(d.value)}
                        {typeof d.secondary === "number" && ` · ${compactNumber(d.secondary)} orders`}
                        {typeof d.secondary === "string" && ` · ${d.secondary}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Line / Area */}
              {(type === "line" || type === "area") && (
                <LineAreaPlot
                  data={data}
                  maxVal={maxVal}
                  height={height}
                  colors={colors}
                  filled={type === "area"}
                  hoverIdx={hoverIdx}
                  setHoverIdx={setHoverIdx}
                  formatValue={formatValue}
                />
              )}
            </div>

            {/* X labels */}
            <div className="ml-12 mt-1.5 flex justify-between text-[10px] text-kampmax-text-secondary">
              {data.map((d, i) =>
                i % labelEvery === 0 || i === data.length - 1 ? (
                  <span key={`${d.label}-x-${i}`} className="tabular-nums">
                    {d.label}
                  </span>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// SVG line/area renderer with hover markers
// ------------------------------------------------------------

import { Dispatch, SetStateAction } from "react";

function LineAreaPlot({
  data,
  maxVal,
  height,
  colors,
  filled,
  hoverIdx,
  setHoverIdx,
  formatValue,
}: {
  data: ChartDatum[];
  maxVal: number;
  height: number;
  colors: { fill: string; soft: string; line: string; secondary: string };
  filled: boolean;
  hoverIdx: number | null;
  setHoverIdx: Dispatch<SetStateAction<number | null>>;
  formatValue: (v: number) => string;
}) {
  const W = PLOT_W;
  const H = height;
  const padY = 8;
  const stepX = data.length > 1 ? W / (data.length - 1) : W;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: H - padY - (d.value / maxVal) * (H - padY * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;

  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="absolute inset-y-0 left-12 h-full"
      style={{ width: "calc(100% - 3rem)" }}
      role="img"
      aria-label="Time series chart"
      onMouseLeave={() => setHoverIdx(null)}
    >
      {filled && <path d={areaD} fill={colors.soft} />}
      <path d={pathD} fill="none" stroke={colors.line} strokeWidth={2} vectorEffect="non-scaling-stroke" />

      {/* Hover guides */}
      {active && (
        <>
          <line
            x1={active.x}
            y1={0}
            x2={active.x}
            y2={H}
            stroke="#94A3B8"
            strokeDasharray="3 3"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={active.x} cy={active.y} r={4} fill={colors.line} stroke="#fff" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </>
      )}

      {/* Hit areas */}
      {points.map((p, i) => (
        <rect
          key={`hit-${i}`}
          x={p.x - stepX / 2}
          y={0}
          width={stepX}
          height={H}
          fill="transparent"
          onMouseEnter={() => setHoverIdx(i)}
          onFocus={() => setHoverIdx(i)}
          tabIndex={-1}
        />
      ))}

      {hoverIdx !== null && data[hoverIdx] && (
        <text
          x={Math.min(Math.max(points[hoverIdx].x, 40), W - 40)}
          y={14}
          textAnchor="middle"
          fontSize={11}
          fill="#0B1F3A"
          fontWeight={600}
        >
          {formatValue(data[hoverIdx].value)}
          {typeof data[hoverIdx].secondary === "number" &&
            ` · ${data[hoverIdx].secondary} ${data[hoverIdx].secondary === 1 ? "order" : "orders"}`}
          {typeof data[hoverIdx].secondary === "string" && ` · ${data[hoverIdx].secondary}`}
        </text>
      )}
    </svg>
  );
}

/** Convenience formatter for naira axes */
export const nairaAxis = (v: number) => `₦${compactNumber(v)}`;
export const nairaFull = (v: number) => formatNairaCompact(v);
