"use client";

import {
  ShoppingBag,
  PackageCheck,
  Ban,
  Clock,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type EmptyType = "all" | "active" | "completed" | "cancelled" | "search";

interface EmptyOrdersStateProps {
  type: EmptyType;
  searchQuery?: string;
}

const CONFIG: Record<
  EmptyType,
  {
    icon: typeof ShoppingBag;
    title: string;
    description: string;
    action?: { label: string; href: string };
    iconBg: string;
  }
> = {
  all: {
    icon: ShoppingBag,
    title: "No orders yet",
    description:
      "When you place your first order, it will appear here. Browse the marketplace to get started!",
    action: { label: "Browse Marketplace", href: "/marketplace" },
    iconBg: "bg-kampmax-muted",
  },
  active: {
    icon: Clock,
    title: "No active orders",
    description:
      "You don't have any orders being processed right now. All caught up!",
    action: { label: "Start Shopping", href: "/marketplace" },
    iconBg: "bg-kampmax-blue/10",
  },
  completed: {
    icon: PackageCheck,
    title: "No completed orders",
    description:
      "Orders you've received will show up here. Keep an eye on your deliveries!",
    iconBg: "bg-kampmax-success/10",
  },
  cancelled: {
    icon: Ban,
    title: "No cancelled orders",
    description:
      "Great news — you haven't cancelled any orders. Hopefully it stays that way!",
    iconBg: "bg-kampmax-error/10",
  },
  search: {
    icon: Search,
    title: "No orders found",
    description: "No orders match your search. Try a different order number.",
    iconBg: "bg-kampmax-muted",
  },
};

export function EmptyOrdersState({ type, searchQuery }: EmptyOrdersStateProps) {
  const router = useRouter();
  const config = CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          config.iconBg
        )}
      >
        <Icon className="w-8 h-8 text-kampmax-text-secondary/60" />
      </div>
      <h3 className="text-base font-semibold text-kampmax-text mb-1">
        {config.title}
      </h3>
      <p className="text-sm text-kampmax-text-secondary max-w-xs mb-5">
        {config.description}
      </p>
      {config.action && (
        <button
          onClick={() => router.push(config.action!.href)}
          className="px-5 py-2.5 bg-kampmax-navy text-white text-sm font-medium rounded-lg hover:bg-kampmax-navy-light transition-colors"
        >
          {config.action.label}
        </button>
      )}
    </div>
  );
}
