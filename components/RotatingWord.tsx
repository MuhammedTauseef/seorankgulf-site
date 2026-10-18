"use client";

import { useEffect, useState } from "react";

const WORDS = ["We build", "We automate", "We scale"];
/** Irregular, human-like rotation timing (never round figures). */
const TIMINGS = [3400, 4200, 3700];

export default function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [swap, setSwap] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (i: number) => {
      timer = setTimeout(() => {
        const next = (i + 1) % WORDS.length;
        setIndex(next);
        setSwap(false);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setSwap(true))
        );
        tick(next);
      }, TIMINGS[i]);
    };
    tick(0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className={`rot${swap ? " swap" : ""}`} aria-live="polite">
      {WORDS[index]}
    </span>
  );
}
