"use client";

import { useState } from "react";
import { Shield, BadgeCheck, AlertCircle, FileText, Clock, CheckCircle, XCircle, HelpCircle, Upload } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ServiceProviderOnboardingDraft, ServiceProviderVerificationStatus, ServiceProviderDocumentStatus } from "@/types/service-provider";

const VERIFICATION_TYPES = [
  {
    id: "identity",
    label: "Identity Verification",
    description: "Verify your identity with a government-issued ID (NIN, Driver's License, Passport).",
    icon: BadgeCheck,
    required: true,
  },
  {
    id: "business",
    label: "Business Verification",
    description: "Verify your business registration (CAC certificate) if operating as a business.",
    icon: FileText,
    required: false,
  },
  {
    id: "professional",
    label: "Professional Verification",
    description: "Verify professional licenses, certifications, or qualifications.",
    icon: Shield,
    required: false,
  },
] as const;

interface StepVerificationProps {
  draft: ServiceProviderOnboardingDraft | null;
  onUpdate: (data: Partial<ServiceProviderOnboardingDraft>) => void;
  onSubmitVerification: (type: string) => void;
}

export function StepVerification({ draft, onUpdate, onSubmitVerification }: StepVerificationProps) {
  const verification = draft?.verification;
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(docType);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUploading(null);

    // In real implementation, this would call the upload API
    // For demo, we'll just update the status
    onUpdate({
      documents: draft?.documents?.map((d) =>
        d.documentType === docType ? { ...d, status: "uploaded", fileName: file.name } : d
      ) ?? [],
    });
  };

  const getDocStatus = (docType: string): ServiceProviderDocumentStatus => {
    const doc = draft?.documents?.find((d) => d.documentType === docType);
    return doc?.status ?? "not_uploaded";
  };

  const getDocStatusLabel = (status: ServiceProviderDocumentStatus): string => {
    const labels: Record<string, string> = {
      not_uploaded: "Not uploaded",
      uploading: "Uploading...",
      uploaded: "Uploaded - Pending review",
      under_review: "Under review",
      approved: "Approved",
      rejected: "Rejected",
      requires_replacement: "Needs replacement",
    };
    return labels[status] ?? status;
  };

  const getDocStatusColor = (status: ServiceProviderDocumentStatus): string => {
    switch (status) {
      case "approved":
        return "bg-success-100 text-success-700 border-success-200";
      case "rejected":
      case "requires_replacement":
        return "bg-error-100 text-error-700 border-error-200";
      case "under_review":
      case "uploaded":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "uploading":
        return "bg-info-100 text-info-700 border-info-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const getDocStatusIcon = (status: ServiceProviderDocumentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case "rejected":
      case "requires_replacement":
        return <XCircle className="h-4 w-4 text-error-600" />;
      case "under_review":
      case "uploaded":
        return <Clock className="h-4 w-4 text-warning-600" />;
      case "uploading":
        return <div className="h-4 w-4 animate-spin border-2 border-info-600 border-t-transparent rounded-full" />;
      default:
        return <FileText className="h-4 w-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-kampmax-text">Verification</h2>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Some verification may be required depending on your provider type and services.
          Verified providers get a trust badge and higher visibility.
        </p>
      </div>

      {/* Current Verification Status */}
      <div className="rounded-xl border border-kampmax-border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-kampmax-text">Verification Status</h3>
            <p className="mt-1 text-sm text-kampmax-text-secondary">
              {verification?.status === "approved" && "Your identity has been verified. You have a trust badge."}
              {verification?.status === "pending" && "Your verification is under review. This usually takes 1-3 business days."}
              {verification?.status === "action_required" && "Additional information is needed. Check the documents below."}
              {verification?.status === "not_required" && "Verification not yet started. Choose a verification type to begin."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                verification?.status === "approved" && "bg-success-100 text-success-700",
                verification?.status === "pending" && "bg-warning-100 text-warning-700",
                verification?.status === "action_required" && "bg-error-100 text-error-700",
                verification?.status === "not_required" && "bg-neutral-100 text-neutral-700"
              )}>
                {verification?.status === "approved" && <BadgeCheck className="h-3.5 w-3.5" />}
                {verification?.status === "pending" && <Clock className="h-3.5 w-3.5" />}
                {verification?.status === "action_required" && <AlertCircle className="h-3.5 w-3.5" />}
                {verification?.status === "not_required" && <Shield className="h-3.5 w-3.5" />}
                {verification?.status === "approved" && "Verified"}
                {verification?.status === "pending" && "Under Review"}
                {verification?.status === "action_required" && "Action Required"}
                {verification?.status === "not_required" && "Not Started"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Types */}
      <div>
        <h3 className="text-lg font-semibold text-kampmax-text mb-4">Choose Verification Type</h3>
        <div className="space-y-3">
          {VERIFICATION_TYPES.map((type) => {
            const isRequired = type.required;
            const isSelected = verification?.type === type.id;

            return (
              <div
                key={type.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-primary-600 bg-primary-50"
                    : "border-neutral-200 hover:border-primary-300 bg-white"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-500"
                    )}
                  >
                    <type.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-kampmax-text">{type.label}</h4>
                      {isRequired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-error-100 text-error-700">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-kampmax-text-secondary">{type.description}</p>
                  </div>
                  {isSelected && <CheckCircle className="h-5 w-5 text-primary-600 shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Requirements */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-kampmax-text mb-4">Required Documents</h3>
          <p className="text-sm text-kampmax-text-secondary mb-4">
            Upload the required documents for your selected verification type. Documents are stored securely.
          </p>
          <div className="space-y-3">
            {draft?.documents?.map((doc) => {
              const status = doc.status;
              const isUploading = uploading === doc.documentType;

              return (
                <div
                  key={doc.documentType}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    getDocStatusColor(status)
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getDocStatusIcon(status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-kampmax-text">{doc.label}</h4>
                        {doc.required && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-error-100 text-error-700">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-kampmax-text-secondary">
                        {doc.maxSizeMb}MB max • {doc.acceptedFormats.join(", ").toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                      getDocStatusColor(status)
                    )}>
                      {getDocStatusLabel(status)}
                    </span>
                    {status === "not_uploaded" || status === "rejected" || status === "requires_replacement" ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept={doc.acceptedFormats.map((f) => `.${f}`).join(",")}
                          onChange={(e) => handleFileUpload(e, doc.documentType)}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button
                          variant={isUploading ? "outline" : "primary"}
                          size="sm"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    ) : status === "uploaded" ? (
                      <Button variant="ghost" size="sm" onClick={() => handleFileUpload({ target: { files: [] } } as any, doc.documentType)}>
                        Replace
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        {status === "under_review" ? "Under Review" : "Approved"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-700 space-y-1">
              <p className="font-medium">Your documents are secure</p>
              <p>Documents are encrypted and stored privately. Only Kampmax verification staff can access them.</p>
              <p>We never share your documents with other users or third parties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}