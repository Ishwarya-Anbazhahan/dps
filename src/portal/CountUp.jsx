import { useEffect, useRef, useState } from "react";
import { inr } from "./api.js";

/** Number that counts up (or to its new value) when it appears or changes. */
export default function CountUp({ value, money }) {
  const target = Number(value) || 0;
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(target); from.current = target; return; }
    const start = performance.now(), a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / 1000, 1);
      const cur = a + (target - a) * (1 - Math.pow(1 - p, 3));
      setV(cur);
      from.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  if (!money) return Math.round(v);
  return v === target ? inr(target) : inr(Math.round(v));
}
