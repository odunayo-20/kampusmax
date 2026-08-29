"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { AlertTriangle, Archive, RotateCcw } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
  onBulkArchive: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export function BulkActions({
  selectedCount,
  onBulkPublish,
  onBulkUnpublish,
  onBulkArchive,
  onClearSelection,
  disabled = false,
}: BulkActionsProps) {
  const [showConfirm, setShowConfirm] = useState<"publish" | "unpublish" | "archive" | null>(null);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-up">
      <div className="bg-white rounded-xl border border-kampmax-border shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-kampmax-text">
            {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-kampmax-text-secondary hover:text-kampmax-text"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm("publish")}
            disabled={disabled}
            className="flex-1"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm("unpublish")}
            disabled={disabled}
            className="flex-1"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Unpublish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm("archive")}
            disabled={disabled}
            className="flex-1 text-kampmax-error border-kampmax-error hover:bg-kampmax-error/5"
          >
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archive
          </Button>
        </div>

        {showConfirm && (
          <div className="mt-3 p-3 rounded-lg bg-kampmax-muted/50 border border-kampmax-border">
            <p className="text-sm text-kampmax-text mb-2">
              {showConfirm === "publish" && "Publish selected products? They will become visible on your storefront."}
              {showConfirm === "unpublish" && "Unpublish selected products? They will be hidden from your storefront."}
              {showConfirm === "archive" && "Archive selected products? They will be moved to archive and hidden from storefront."}
            </p>
            <div className="flex gap-2">
              <Button
                variant={showConfirm === "archive" ? "destructive" : "primary"}
                size="sm"
                onClick={() => {
                  if (showConfirm === "publish") onBulkPublish();
                  if (showConfirm === "unpublish") onBulkUnpublish();
                  if (showConfirm === "archive") onBulkArchive();
                  setShowConfirm(null);
                }}
                className="flex-1"
              >
                Confirm
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}