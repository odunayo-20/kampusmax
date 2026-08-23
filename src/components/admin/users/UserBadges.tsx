import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";
import { ManagedUser, ManagedUserStatus } from "@/types/admin";
import {
  avatarTint,
  initialsOf,
  roleLabel,
  ROLE_PILL_STYLES,
  statusLabel,
  userStatusBadgeVariant,
} from "./users-meta";

export function UserAvatar({
  user,
  size = "md",
}: {
  user: Pick<ManagedUser, "id" | "name">;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
        avatarTint(user.id),
        size === "sm" && "h-7 w-7 text-[10px]",
        size === "md" && "h-9 w-9 text-xs",
        size === "lg" && "h-12 w-12 text-sm"
      )}
    >
      {initialsOf(user.name)}
    </span>
  );
}

export function UserRoleBadge({ role }: { role: ManagedUser["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        ROLE_PILL_STYLES[role]
      )}
    >
      {roleLabel(role)}
    </span>
  );
}

export function UserStatusBadge({
  status,
  className,
}: {
  status: ManagedUserStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      variant={userStatusBadgeVariant(status)}
      label={statusLabel(status)}
      className={className}
    />
  );
}
