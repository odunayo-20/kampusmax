"use client";

import { useState } from "react";
import { cn, formatNaira } from "@/lib/utils";
import { Poll } from "@/types";
import { BarChart3, Check } from "lucide-react";

interface PollCardProps {
  poll: Poll;
  onVote?: (optionId: string) => void;
  compact?: boolean;
}

export function PollCard({ poll, onVote, compact }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const votedOption = poll.options.find((o) =>
    o.votes.includes("current_user")
  );
  const hasVoted = !!votedOption;
  const isExpired = new Date(poll.endsAt) < new Date();

  function handleVote(optionId: string) {
    if (hasVoted || isExpired) return;
    setSelectedOption(optionId);
    onVote?.(optionId);
  }

  const maxVotes = Math.max(...poll.options.map((o) => o.votes.length), 1);

  return (
    <div className={cn("rounded-xl border border-kampmax-border bg-white overflow-hidden")}>
      <div className={cn(compact ? "p-3" : "p-4")}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-kampmax-blue" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-kampmax-blue">
            Poll · {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
          </span>
          {poll.isAnonymous && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-kampmax-muted text-kampmax-text-secondary font-medium">
              Anonymous
            </span>
          )}
        </div>

        <p className={cn("font-semibold text-kampmax-text mb-3", compact ? "text-sm" : "text-base")}>
          {poll.question}
        </p>

        <div className="space-y-2">
          {poll.options.map((option) => {
            const pct = poll.totalVotes > 0
              ? Math.round((option.votes.length / poll.totalVotes) * 100)
              : 0;
            const isSelected = selectedOption === option.id || votedOption?.id === option.id;
            const barWidth = poll.totalVotes > 0
              ? (option.votes.length / maxVotes) * 100
              : 0;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isExpired}
                className={cn(
                  "w-full relative rounded-lg border overflow-hidden transition-all text-left",
                  compact ? "px-3 py-2" : "px-4 py-2.5",
                  !hasVoted && !isExpired
                    ? "border-kampmax-border hover:border-kampmax-blue cursor-pointer"
                    : isSelected
                      ? "border-kampmax-blue bg-kampmax-blue/5"
                      : "border-kampmax-border",
                  isExpired && "cursor-default"
                )}
              >
                {/* Progress bar */}
                {hasVoted && (
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-500",
                      isSelected ? "bg-kampmax-blue/10" : "bg-kampmax-muted"
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {hasVoted && isSelected && (
                      <Check className="h-3.5 w-3.5 text-kampmax-blue flex-shrink-0" />
                    )}
                    <span className={cn(
                      "truncate",
                      compact ? "text-xs" : "text-sm",
                      isSelected ? "font-semibold text-kampmax-text" : "text-kampmax-text"
                    )}>
                      {option.text}
                    </span>
                  </div>
                  {hasVoted && (
                    <span className={cn(
                      "font-bold flex-shrink-0 ml-2",
                      compact ? "text-[10px]" : "text-xs",
                      isSelected ? "text-kampmax-blue" : "text-kampmax-text-secondary"
                    )}>
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={cn("border-t border-kampmax-border flex items-center justify-between", compact ? "px-3 py-2" : "px-4 py-2.5")}>
        <span className="text-[10px] text-kampmax-text-secondary">
          {isExpired ? "Voting ended" : `Ends ${new Date(poll.endsAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`}
        </span>
        {hasVoted && (
          <span className="text-[10px] text-kampmax-blue font-medium">
            {poll.totalVotes} total vote{poll.totalVotes !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
