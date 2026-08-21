"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ReviewImage } from "@/types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewImageGalleryProps {
  images: ReviewImage[];
  className?: string;
}

export function ReviewImageGallery({ images, className }: ReviewImageGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className={cn("flex gap-2 mt-3", className)}>
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIdx(i)}
            className="relative w-16 h-16 rounded-lg overflow-hidden border border-kampmax-border hover:opacity-80 transition-opacity"
          >
            <Image
              src={img.url}
              alt={img.alt || "Review image"}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && lightboxIdx > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx - 1);
              }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative w-full max-w-lg aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIdx].url}
              alt={images[lightboxIdx].alt || "Review image"}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {images.length > 1 && lightboxIdx < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx + 1);
              }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {images.length > 1 && (
            <p className="absolute bottom-6 text-white/60 text-sm">
              {lightboxIdx + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
