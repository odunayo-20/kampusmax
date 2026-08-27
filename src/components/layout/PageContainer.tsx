import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 py-4 lg:px-6 lg:py-6",
        narrow ? "max-w-xl" : "max-w-[1280px]",
        className
      )}
    >
      {children}
    </div>
  );
}
