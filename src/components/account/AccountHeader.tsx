"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";

interface AccountHeaderProps {
  /** Mask email unless the caller opts in (privacy-first). */
  showEmail?: boolean;
}

/** Customer account header: avatar, name, email, campus and Edit Profile. */
export function AccountHeader({ showEmail = true }: AccountHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedCampus } = useApp();

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-kampmax-navy to-kampmax-blue" />
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-8">
        <div className="flex flex-wrap items-end gap-3">
          <Avatar name={user.name} size="lg" className="ring-4 ring-white" />
          <div className="flex-1 pt-4 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-kampmax-text truncate">
                {user.name}
              </h1>
              {user.isVerified && (
                <span className="text-[10px] bg-kampmax-success/10 text-kampmax-success px-2 py-0.5 rounded-full font-medium shrink-0">
                  Verified
                </span>
              )}
            </div>
            {showEmail && (
              <p className="text-xs text-kampmax-text-secondary truncate">
                {user.email}
              </p>
            )}
            <p className="text-xs text-kampmax-text-secondary flex items-center gap-1 mt-0.5">
              <span aria-hidden="true">📍</span>
              {selectedCampus.name}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/profile/edit")}
            className="inline-flex items-center gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
