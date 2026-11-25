"use client";

import { useEffect, useState } from "react";

/**
 * Renders the final value during SSR/hydration so the count is correct
 * even without JavaScript, then rewinds to 0 on mount and animates up
 * with an ease-out cubic curve. The one-frame rewind is invisible in
 * practice because it happens in the same commit as hydration.
 */
export default function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setDisplay(0);
    const duration = 900;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <b>{display.toLocaleString("en-US")}</b>;
}
