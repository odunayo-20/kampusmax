"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ProductListingErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ProductListingErrorState({ 
  message = "Something went wrong", 
  onRetry,
  className 
}: ProductListingErrorStateProps) {
  return (
    <div className={cn("py-16 text-center", className)}>
      <div className="w-16 h-16 mx-auto rounded-full bg-error-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-error-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Unable to load products</h3>
      <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" className="w-fit mx-auto">
          <RefreshCw className="h-4 w-4 mr-2" /> Try again
        </Button>
      )}
    </div>
  );
}