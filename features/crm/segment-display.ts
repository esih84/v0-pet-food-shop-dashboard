import type { RfmSegment, SegmentColor } from "./crm-api";
import { UNCLASSIFIED_KEY } from "./crm-api";

/**
 * Colour token → Tailwind classes.
 *
 * This table MUST stay a literal object with the full class names written out. Segments are
 * database rows, so their colour arrives as a token at runtime; if the classes were built by
 * interpolation (`bg-${color}-500`) the Tailwind compiler would never see them in the source
 * and would strip them from the production bundle — the colours would work in dev and
 * silently disappear in the build.
 */
export const SEGMENT_COLOR_CLASSES: Record<
  SegmentColor,
  { badge: string; bar: string; dot: string }
> = {
  primary: {
    badge: "bg-primary/15 text-primary border-primary/30",
    bar: "bg-primary",
    dot: "bg-primary",
  },
  blue: {
    badge: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  green: {
    badge: "bg-green-500/15 text-green-600 border-green-500/30",
    bar: "bg-green-500",
    dot: "bg-green-500",
  },
  cyan: {
    badge: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
    bar: "bg-cyan-500",
    dot: "bg-cyan-500",
  },
  amber: {
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  red: {
    badge: "bg-red-500/15 text-red-600 border-red-500/30",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  gray: {
    badge: "bg-muted text-muted-foreground border-border",
    bar: "bg-muted-foreground/40",
    dot: "bg-muted-foreground/40",
  },
};

export const SEGMENT_COLOR_LABELS: Record<SegmentColor, string> = {
  primary: "سرمه‌ای (اصلی)",
  blue: "آبی",
  green: "سبز",
  cyan: "فیروزه‌ای",
  amber: "کهربایی",
  red: "قرمز",
  gray: "خاکستری",
};

export function segmentClasses(color?: SegmentColor) {
  return SEGMENT_COLOR_CLASSES[color ?? "gray"];
}

/**
 * The pseudo-segment for customers who matched no rule. It is not a database row — it is the
 * absence of a match — but the dashboard shows it so a gap in the operator's rules is
 * visible instead of silently disappearing.
 */
export const UNCLASSIFIED_SEGMENT = {
  key: UNCLASSIFIED_KEY,
  label: "طبقه‌بندی‌نشده",
  description: "با هیچ‌کدام از قواعد فعلی جور در نیامده‌اند",
  color: "gray" as SegmentColor,
};

/** Looks up a segment by the key stored on a customer row. */
export function findSegment(segments: RfmSegment[] | undefined, key?: string | null) {
  if (!key) return undefined;
  if (key === UNCLASSIFIED_KEY) return UNCLASSIFIED_SEGMENT;
  return segments?.find((s) => s.key === key);
}

/** Human-readable summary of a segment's rule, e.g. "R ۳-۵ • F ≥۴ • مبلغ ≥ ۵٬۰۰۰٬۰۰۰ تومان". */
export function describeRule(s: RfmSegment): string {
  const fa = (n: number) => n.toLocaleString("fa-IR");
  const parts: string[] = [];

  const dimension = (label: string, min: number | null, max: number | null) => {
    if (min == null && max == null) return;
    if (min != null && max != null)
      parts.push(min === max ? `${label} = ${fa(min)}` : `${label} ${fa(min)}–${fa(max)}`);
    else if (min != null) parts.push(`${label} ≥ ${fa(min)}`);
    else if (max != null) parts.push(`${label} ≤ ${fa(max!)}`);
  };

  dimension("R", s.minR, s.maxR);
  dimension("F", s.minF, s.maxF);
  dimension("M", s.minM, s.maxM);

  if (s.minSpent != null) parts.push(`مبلغ ≥ ${fa(Number(s.minSpent))} تومان`);
  if (s.minOrders != null) parts.push(`سفارش ≥ ${fa(s.minOrders)}`);
  if (s.maxDaysSincePurchase != null)
    parts.push(`حداکثر ${fa(s.maxDaysSincePurchase)} روز از آخرین خرید`);

  return parts.length ? parts.join(" • ") : "بدون شرط — همه را می‌گیرد";
}
