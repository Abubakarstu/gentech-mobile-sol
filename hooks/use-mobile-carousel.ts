"use client";

import * as React from "react";

import {
  carouselIndexFromScroll,
  carouselScrollLeft,
  clampCarouselIndex,
} from "@/lib/mobile-carousel";

/**
 * Tracks the active slide of a full-width, scroll-snap image strip.
 * Touch scrolling is handled natively by the browser; this only mirrors the
 * offset into an index so the dots and counter stay in sync.
 */
export function useMobileCarousel(count: number) {
  const [active, setActive] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const boundedActive = clampCarouselIndex(active, count);

  const onScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const index = carouselIndexFromScroll(element.scrollLeft, element.clientWidth, count);
      setActive((previous) => (previous === index ? previous : index));
    },
    [count],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = clampCarouselIndex(index, count);
      setActive(target);
      const element = scrollerRef.current;
      if (element) {
        element.scrollLeft = carouselScrollLeft(target, element.clientWidth, count);
      }
    },
    [count],
  );

  return { active: boundedActive, scrollerRef, onScroll, goTo };
}
