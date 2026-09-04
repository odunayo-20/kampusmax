"use client";

import { useState } from "react";
import { Eye, Pause, Play, Archive, Trash2, Send, MoreVertical, Pencil } from "lucide-react";
import Link from "next/link";
import type { FreelancerService } from "@/types/freelancer-services";
import { FREELANCER_SERVICE_STATUS } from "@/types/freelancer-services";
import { ServiceConfirmDialog } from "./ServiceConfirmDialog";
import { cn } from "@/lib/utils";

export type ServiceActionKind =
  | "publish"
  | "approve"
  | "pause"
  | "resume"
  | "archive"
  | "delete";

interface ServiceActionsProps {
  service: FreelancerService;
  isDemo?: boolean;
  onAction: (kind: ServiceActionKind) => void;
  busy?: ServiceActionKind | null;
}

/** Which actions the backend allows for a given status. */
function availableActions(service: FreelancerService, isDemo: boolean): ServiceActionKind[] {
  const actions: ServiceActionKind[] = [];
  switch (service.status) {
    case FREELANCER_SERVICE_STATUS.DRAFT:
    case FREELANCER_SERVICE_STATUS.REJECTED:
      actions.push("publish");
      actions.push("delete");
      break;
    case FREELANCER_SERVICE_STATUS.SUBMITTED:
    case FREELANCER_SERVICE_STATUS.UNDER_REVIEW:
      actions.push("delete");
      if (isDemo) actions.push("approve");
      break;
    case FREELANCER_SERVICE_STATUS.PUBLISHED:
      actions.push("pause");
      actions.push("archive");
      break;
    case FREELANCER_SERVICE_STATUS.PAUSED:
      actions.push("resume");
      actions.push("archive");
      break;
    case FREELANCER_SERVICE_STATUS.ARCHIVED:
      actions.push("delete");
      break;
    default:
      actions.push("delete");
  }
  return actions;
}

const actionMeta: Record<
  ServiceActionKind,
  { label: string; icon: typeof Eye; confirm?: { title: string; description: string } }
> = {
  publish: {
    label: "Submit for review",
    icon: Send,
    confirm: {
      title: "Submit service for review?",
      description:
        "The service will be sent to our team for review. You cannot edit it while under review.",
    },
  },
  approve: {
    label: "Approve (demo)",
    icon: Eye,
    confirm: {
      title: "Approve this service?",
      description: "Simulates the backend finishing review and publishing the service.",
    },
  },
  pause: {
    label: "Pause",
    icon: Pause,
    confirm: {
      title: "Pause this service?",
      description: "It will be hidden from clients and can be resumed later.",
    },
  },
  resume: {
    label: "Resume",
    icon: Play,
  },
  archive: {
    label: "Archive",
    icon: Archive,
    confirm: {
      title: "Archive this service?",
      description: "It will no longer be offered. This can be reversed later.",
    },
  },
  delete: {
    label: "Delete",
    icon: Trash2,
    confirm: {
      title: "Delete service?",
      description: "This action cannot be undone. The service and its data will be removed.",
    },
  },
};

export function ServiceActions({ service, isDemo, onAction, busy }: ServiceActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<ServiceActionKind | null>(null);
  const actions = availableActions(service, !!isDemo);

  function confirm(kind: ServiceActionKind) {
    const meta = actionMeta[kind];
    if (meta.confirm) {
      setMenuOpen(false);
      setPending(kind);
    } else {
      onAction(kind);
      setMenuOpen(false);
    }
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Service actions"
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
              href={`/freelancer/services/${service.id}/edit`}
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              <Pencil className="h-4 w-4 text-neutral-400" aria-hidden />
              Edit
            </Link>
            <div className="my-1 border-t border-neutral-100" />
            {actions.map((kind) => {
              const meta = actionMeta[kind];
              const Icon = meta.icon;
              const isDestructive = kind === "delete" || kind === "archive";
              return (
                <button
                  key={kind}
                  type="button"
                  role="menuitem"
                  disabled={busy === kind}
                  onClick={() => confirm(kind)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50 disabled:opacity-50",
                    isDestructive ? "text-error-600" : "text-neutral-700"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {busy === kind ? "Working…" : meta.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ServiceConfirmDialog
        open={pending !== null}
        title={pending ? actionMeta[pending].confirm!.title : ""}
        description={pending ? actionMeta[pending].confirm!.description : ""}
        confirmLabel={pending ? actionMeta[pending].label : ""}
        tone={pending === "delete" || pending === "archive" ? "destructive" : "secondary"}
        isBusy={pending ? busy === pending : false}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onAction(pending);
          setPending(null);
        }}
      />
    </>
  );
}
