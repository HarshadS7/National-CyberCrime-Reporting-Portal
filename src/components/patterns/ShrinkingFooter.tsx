"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper. Scales and lifts the page content as the reader nears
 * the bottom, exposing the fixed SiteFooter behind it.
 *
 * Because this element carries a transform it becomes the containing block for
 * any `position: fixed` descendant — do not make the header or any dialog
 * inside it fixed, or it will anchor to this wrapper instead of the viewport.
 */
export default function ShrinkingFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  // Plan §5 honours prefers-reduced-motion; a full-page transform is exactly
  // the kind of motion that rule exists for.
  const [reducedMotion, setReducedMotion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      // Calculate how far down the page the user has scrolled
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;

      // Get scroll position
      const scrollPosition = window.scrollY;

      // Fixed trigger distance from the bottom, for consistent behaviour
      // across pages of different lengths.
      const triggerDistance = 500;
      const triggerPoint = Math.max(0, scrollableHeight - triggerDistance);

      if (scrollPosition > triggerPoint) {
        const progressDistance = scrollPosition - triggerPoint;
        const progress = Math.min(progressDistance / triggerDistance, 1);
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const measure = () => {
      setContentHeight(element.getBoundingClientRect().height);
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => measure());
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const MAX_SCALE_SHRINK = 0.08;
  const MAX_NET_LIFT_PX = 80;

  const scale = 1 - scrollProgress * MAX_SCALE_SHRINK;

  // With transformOrigin: center, scaling changes the element's top/bottom
  // position in px. Longer pages => larger visual shift for the same scale.
  // Compensate using measured height so the net "lift" stays consistent.
  const scaleLiftPx = ((1 - scale) * contentHeight) / 2;
  const desiredNetLiftPx = scrollProgress * MAX_NET_LIFT_PX;
  let translateY = scaleLiftPx - desiredNetLiftPx;
  translateY = Math.max(-160, Math.min(translateY, 320));

  const borderRadius = Math.min(scrollProgress * 32, 32);

  return (
    <div
      ref={contentRef}
      className="relative z-10 overflow-hidden bg-surface transition-transform duration-75 will-change-transform"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        borderRadius: `${borderRadius}px`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
}
