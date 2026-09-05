import { Check, CheckCheck } from "lucide-react";

/**
 * Delivery indicator for the sender's own messages. The backend only exposes
 * `Message.read`, so the UI maps it directly: `read` → one clarity check.
 * Nothing is shown until the store confirms the message exists, so a failed
 * send never displays a tick. A real delivery/read enum is a backend gap;
 * whenever it ships, replace this component's props, not any mock state.
 */
export function MessageStatus({ read, isMine }: { read: boolean; isMine: boolean }) {
  if (!isMine) return null;
  return read ? (
    <CheckCheck className="h-3 w-3 text-current opacity-70" aria-label="Read" aria-hidden={false} />
  ) : (
    <Check className="h-3 w-3 text-current opacity-50" aria-label="Sent" aria-hidden={false} />
  );
}