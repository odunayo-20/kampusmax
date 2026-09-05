import type { Opportunity } from "@/types/opportunity";
import { OpportunityCard } from "./OpportunityCard";

export function OpportunityList({
  opportunities,
  savedIds,
}: {
  opportunities: Opportunity[];
  savedIds?: Set<string>;
}) {
  const saved = savedIds ?? new Set<string>();
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {opportunities.map((o) => (
        <li key={o.id}>
          <OpportunityCard opportunity={o} saved={saved.has(o.id)} />
        </li>
      ))}
    </ul>
  );
}
