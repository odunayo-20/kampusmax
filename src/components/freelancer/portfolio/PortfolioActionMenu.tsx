"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ServiceConfirmDialog } from "../services/ServiceConfirmDialog";
import type { FreelancerPortfolioItem } from "@/types/freelancer";

export type PortfolioAction = "toggle_visibility" | "delete";

export function PortfolioActionMenu({
  item,
  onAction,
  busy,
}: {
  item: FreelancerPortfolioItem;
  onAction: (kind: PortfolioAction) => void;
  busy?: PortfolioAction | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<PortfolioAction | null>(null);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Portfolio project actions"
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <MoreVertical className="h-4 w-4" aria-hidden />
          Actions
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          >
            <Link
              href={`/freelancer/portfolio/${item.id}/edit`}
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              <Pencil className="h-4 w-4 text-neutral-400" aria-hidden />
              Edit
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={busy === "toggle_visibility"}
              onClick={() => {
                setMenuOpen(false);
                onAction("toggle_visibility");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              {item.visible ? (
                <EyeOff className="h-4 w-4 text-neutral-400" aria-hidden />
              ) : (
                <Eye className="h-4 w-4 text-neutral-400" aria-hidden />
              )}
              {item.visible ? "Make private" : "Make public"}
            </button>
            <div className="my-1 border-t border-neutral-100" />
            <button
              type="button"
              role="menuitem"
              disabled={busy === "delete"}
              onClick={() => {
                setMenuOpen(false);
                setConfirm("delete");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error-600 hover:bg-error-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </button>
          </div>
        )}
      </div>

      <ServiceConfirmDialog
        open={confirm === "delete"}
        title="Delete portfolio project?"
        description="This will remove the project from your portfolio. This action cannot be undone."
        confirmLabel="Delete"
        isBusy={busy === "delete"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          onAction("delete");
          setConfirm(null);
        }}
      />
    </>
  );
}
