"use client";

import { FileText, Download, ExternalLink } from "lucide-react";
import { formatFileSize, isSafeExternalUrl } from "@/lib/contract-utils";
import { formatDate } from "@/lib/utils";
import type { ContractFile } from "@/types/contract";

// Project files section. File URLs come from the backend and are downloaded
// through authenticated, backend-authorized links — never raw internal storage
// URLs. External links (if present) are validated to safe schemes only.

export function ContractFiles({ files }: { files: ContractFile[] }) {
  if (!files || files.length === 0) {
    return (
      <p className="text-sm text-kampmax-text-secondary">
        No files have been shared on this project yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center gap-3 rounded-lg border border-kampmax-border bg-white p-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kampmax-muted">
            <FileText className="h-5 w-5 text-kampmax-text-secondary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-kampmax-text">
              {file.filename}
            </p>
            <p className="text-xs text-kampmax-text-secondary">
              {formatFileSize(file.size)} · {file.fileType.toUpperCase()} · uploaded by{" "}
              {file.uploadedBy}
            </p>
            <p className="text-xs text-kampmax-text-muted">
              {formatDate(file.uploadedAt)}
            </p>
          </div>
          <DownloadLink file={file} />
        </li>
      ))}
    </ul>
  );
}

function DownloadLink({ file }: { file: ContractFile }) {
  // Only render a download action when the URL is a safe, authenticated link.
  if (!isSafeExternalUrl(file.url)) {
    return (
      <span className="text-xs text-kampmax-text-muted" title="Secure download available in the client review">
        Secure file
      </span>
    );
  }
  return (
    <a
      href={file.url}
      download={file.filename}
      className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-primary-600 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
    >
      <Download className="h-4 w-4" aria-hidden />
      Download
    </a>
  );
}

// A safe external link wrapper for deliverable links — rejects dangerous schemes.
export function SafeExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const safe = isSafeExternalUrl(href);
  if (!safe) {
    return (
      <span className={className} title="This link could not be opened safely">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${className ?? ""}`}
    >
      {children} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}
