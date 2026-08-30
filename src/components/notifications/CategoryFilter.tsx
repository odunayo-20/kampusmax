"use client";

import { cn } from "@/lib/utils";
import { NotificationCategory } from "@/types";
import {
  Package,
  MessageCircle,
  ShoppingCart,
  GraduationCap,
  CreditCard,
  User,
  Tag,
  Layers,
  CalendarCheck,
} from "lucide-react";

interface CategoryFilterProps {
  categories: {
    id: NotificationCategory | "all";
    label: string;
    count: number;
    unread: number;
  }[];
  selected: NotificationCategory | "all";
  onSelect: (cat: NotificationCategory | "all") => void;
}

const catIcons: Record<string, typeof Package> = {
  all: Layers,
  orders: Package,
  messages: MessageCircle,
  marketplace: ShoppingCart,
  campus: GraduationCap,
  payments: CreditCard,
  account: User,
  promotions: Tag,
  bookings: CalendarCheck,
};

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
      {categories.map((cat) => {
        const Icon = catIcons[cat.id] || Layers;
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
              isActive
                ? "bg-kampmax-navy text-white"
                : "bg-white text-kampmax-text-secondary border border-kampmax-border"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.label}
            {cat.unread > 0 && (
              <span
                className={cn(
                  "min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-kampmax-blue text-white"
                )}
              >
                {cat.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
