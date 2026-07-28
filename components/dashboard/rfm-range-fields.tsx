"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * The six R/F/M bounds. `null` and `undefined` both mean "unbounded" here; the segment
 * editor sends null to clear a stored bound while the customer filter simply omits it.
 */
export type RfmBounds = {
  minR?: number | null;
  maxR?: number | null;
  minF?: number | null;
  maxF?: number | null;
  minM?: number | null;
  maxM?: number | null;
};

export type RfmDimension = "R" | "F" | "M";

export const RFM_DIMENSIONS: {
  key: RfmDimension;
  label: string;
  hint: string;
}[] = [
  {
    key: "R",
    label: "تازگی خرید (R)",
    hint: "۵ = جدیدترین خریداران، ۱ = قدیمی‌ترین",
  },
  { key: "F", label: "تعداد خرید (F)", hint: "۵ = پرتکرارترین خریداران" },
  { key: "M", label: "مبلغ خرید (M)", hint: "۵ = پرخرج‌ترین مشتریان" },
];

const SCORES = [1, 2, 3, 4, 5];
const ANY = "any";
const fa = (n: number) => n.toLocaleString("fa-IR");

export function boundKey(dim: RfmDimension, side: "min" | "max") {
  return `${side}${dim}` as keyof RfmBounds;
}

/** True when at least one bound on the dimension is set. */
export function isDimensionBounded(value: RfmBounds, dim: RfmDimension) {
  return (
    value[boundKey(dim, "min")] != null || value[boundKey(dim, "max")] != null
  );
}

/**
 * Three rows of min/max score selectors, shared by the customer filter and the segment rule
 * editor so the two cannot drift apart in behaviour.
 *
 * `clearAs` decides what "unbounded" writes back: the filter drops the key entirely so it is
 * never sent as a query parameter, while the editor writes null so the server knows to erase
 * a bound it currently stores.
 */
export function RfmRangeFields({
  value,
  onChange,
  clearAs = "undefined",
}: {
  value: RfmBounds;
  onChange: (next: RfmBounds) => void;
  clearAs?: "undefined" | "null";
}) {
  const setBound = (dim: RfmDimension, side: "min" | "max", raw: string) => {
    const next: RfmBounds = { ...value };
    const minKey = boundKey(dim, "min");
    const maxKey = boundKey(dim, "max");
    const thisKey = side === "min" ? minKey : maxKey;

    if (raw === ANY) {
      if (clearAs === "null") next[thisKey] = null;
      else delete next[thisKey];
      onChange(next);
      return;
    }

    const score = Number(raw);
    next[thisKey] = score;

    // Keep the pair coherent: a min above the max can never match anyone, so the dialog
    // would look configured while quietly capturing nobody.
    if (side === "min" && next[maxKey] != null && next[maxKey]! < score) {
      next[maxKey] = score;
    }
    if (side === "max" && next[minKey] != null && next[minKey]! > score) {
      next[minKey] = score;
    }
    onChange(next);
  };

  const selected = (dim: RfmDimension, side: "min" | "max") => {
    const v = value[boundKey(dim, side)];
    return v == null ? ANY : String(v);
  };

  return (
    <>
      {RFM_DIMENSIONS.map((d) => (
        <div key={d.key} className="space-y-1.5">
          <Label className="text-xs">{d.label}</Label>
          <div className="flex items-center gap-2">
            {(["min", "max"] as const).map((side) => (
              <Select
                key={side}
                value={selected(d.key, side)}
                onValueChange={(v) => setBound(d.key, side, v)}
              >
                <SelectTrigger className="h-9 flex-1 bg-input">
                  <SelectValue placeholder={side === "min" ? "از" : "تا"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>
                    {side === "min" ? "از: همه" : "تا: همه"}
                  </SelectItem>
                  {SCORES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {side === "min" ? "از" : "تا"} {fa(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">{d.hint}</p>
        </div>
      ))}
    </>
  );
}
