"use client";

import * as React from "react";
import Image from "next/image";
import { Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMobileCarousel } from "@/hooks/use-mobile-carousel";
import { isOptimizableImageUrl } from "@/lib/validation/image-url";
import type { ListingImageData } from "@/types/marketplace";

export function ListingGallery({
  images,
  title,
  brand,
}: {
  images: ListingImageData[];
  title: string;
  brand?: string;
}) {
  const { active, scrollerRef, onScroll, goTo } = useMobileCarousel(images.length);

  if (images.length === 0) {
    return (
      <div className="text-muted-foreground bg-muted flex aspect-4/3 w-full flex-col items-center justify-center gap-2 rounded-xl border">
        <Smartphone className="size-16" />
        {brand ? <span className="text-foreground/50 font-medium">{brand}</span> : null}
      </div>
    );
  }

  const current = images[active] ?? images[0]!;

  return (
    <div className="space-y-3">
      {/* Mobile: native swipe with snap points, dots and a slide counter. */}
      <div className="md:hidden">
        <div className="bg-muted relative aspect-4/3 w-full overflow-hidden rounded-xl border">
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            data-mobile-gallery={images.length}
            className="scroll-smooth flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative h-full w-full shrink-0 snap-center">
                <Image
                  src={image.url}
                  alt={title}
                  fill
                  priority={index === 0}
                  unoptimized={!isOptimizableImageUrl(image.url)}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {images.length > 1 ? (
            <>
              <div className="absolute bottom-2 start-2 z-10 flex items-center gap-1.5">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-dot`}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === active ? "true" : undefined}
                    className={cn(
                      "h-1.5 rounded-full bg-white/70 shadow transition-all",
                      index === active ? "w-4 bg-white" : "w-1.5",
                    )}
                  />
                ))}
              </div>
              <span
                data-mobile-gallery-counter
                className="absolute bottom-2 end-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white"
              >
                {active + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Desktop: single image plus the thumbnail strip (unchanged). */}
      <div className="hidden space-y-3 md:block">
        <div className="bg-muted relative aspect-4/3 w-full overflow-hidden rounded-xl border">
          <Image
            src={current.url}
            alt={title}
            fill
            priority
            unoptimized={!isOptimizableImageUrl(current.url)}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`View image ${index + 1}`}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  index === active ? "border-primary" : "border-transparent",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  unoptimized={!isOptimizableImageUrl(image.url)}
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
