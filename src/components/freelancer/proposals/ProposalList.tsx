import type { Proposal } from "@/types/opportunity";
import { ProposalCard } from "./ProposalCard";

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {proposals.map((p) => (
        <li key={p.id}>
          <ProposalCard proposal={p} />
        </li>
      ))}
    </ul>
  );
}
