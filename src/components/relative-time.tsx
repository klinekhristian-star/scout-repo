import { useMemo } from "react";

/** Fixed formatting (no Date.now in render path that diverges SSR). */
export function RelativeTime({ date }: { date: string }) {
  const label = useMemo(() => {
    const t = new Date(date).getTime();
    if (Number.isNaN(t)) return "—";
    // use posted date only vs a fixed-ish client read after mount is ok; prefer absolute short
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [date]);
  return <time dateTime={date}>{label}</time>;
}
