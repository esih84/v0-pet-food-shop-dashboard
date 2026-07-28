"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import {
  RfmRangeFields,
  RFM_DIMENSIONS,
  isDimensionBounded,
  type RfmBounds,
} from "./rfm-range-fields";

/**
 * The six min/max bounds as they are sent to /crm/customers. Narrower than the editor's
 * RfmBounds: a query parameter is either present or absent, so there is no null here.
 */
export type RfmScoreRange = {
  minR?: number;
  maxR?: number;
  minF?: number;
  maxF?: number;
  minM?: number;
  maxM?: number;
};

const fa = (n: number) => n.toLocaleString("fa-IR");

/**
 * Drops cleared bounds instead of forwarding them as null. With `clearAs="undefined"` the
 * fields already delete the key, so this only narrows the type — but doing it by
 * construction rather than a cast keeps it true if that default ever changes.
 */
function toScoreRange(bounds: RfmBounds): RfmScoreRange {
  const out: RfmScoreRange = {};
  for (const key of [
    "minR",
    "maxR",
    "minF",
    "maxF",
    "minM",
    "maxM",
  ] as const) {
    const v = bounds[key];
    if (v != null) out[key] = v;
  }
  return out;
}

/**
 * Filter customers by their RFM quantile scores, one dimension at a time.
 *
 * Each dimension is a min/max pair rather than a single value: picking the same score on
 * both sides gives an exact match ("R = 5"), while leaving one side open expresses the
 * ranges that campaigns actually target, e.g. R ≤ 2 together with M ≥ 4 — the customers who
 * used to spend the most and have gone quiet.
 *
 * The scores are relative to the whole customer base (see `ntile` in recomputeAll), not
 * absolute amounts, and a customer who never bought has no score and matches nothing here.
 */
export function RfmScoreFilter({
  value,
  onChange,
}: {
  value: RfmScoreRange;
  onChange: (next: RfmScoreRange) => void;
}) {
  const activeCount = RFM_DIMENSIONS.filter((d) =>
    isDimensionBounded(value, d.key),
  ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          امتیاز RFM
          {activeCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {fa(activeCount)}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent dir="rtl" align="start" className="w-[320px] space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">فیلتر بر اساس امتیاز RFM</p>
          <p className="text-xs leading-5 text-muted-foreground">
            امتیازها نسبی‌اند: ۵ یعنی «۲۰٪ برتر در بین مشتریان شما»، نه یک مبلغ
            یا تاریخ مشخص.
          </p>
        </div>

        <RfmRangeFields
          value={value}
          onChange={(next) => onChange(toScoreRange(next))}
        />

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          disabled={activeCount === 0}
          onClick={() => onChange({})}
        >
          پاک‌کردن فیلتر امتیازها
        </Button>
      </PopoverContent>
    </Popover>
  );
}
