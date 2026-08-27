"use client";

import { SpecItem } from "./types";

interface ProductSpecsProps {
  specs: SpecItem[];
  productId: string;
  createdAt: string;
  tags?: string[];
}

export function ProductSpecs({ specs, productId, createdAt, tags }: ProductSpecsProps) {
  return (
    <section className="rounded-[10px] border border-neutral-200 bg-white p-5">
      <h2 className="text-base font-bold text-neutral-900">Product details</h2>
      <dl className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
        {specs.map((s) => (
          <div key={s.label} className="flex justify-between gap-4 py-2.5 text-sm">
            <dt className="text-neutral-500">{s.label}</dt>
            <dd className="font-medium text-neutral-900 text-right">{s.value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-2.5 text-sm">
          <dt className="text-neutral-500">SKU</dt>
          <dd className="font-mono text-xs font-medium text-neutral-900">{productId.toUpperCase()}-KMX</dd>
        </div>
        <div className="flex justify-between gap-4 py-2.5 text-sm">
          <dt className="text-neutral-500">Listed</dt>
          <dd className="font-medium text-neutral-900">
            {new Date(createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
          </dd>
        </div>
      </dl>
      {tags?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
              #{t}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}