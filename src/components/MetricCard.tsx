import { useEffect, useState } from "react";
import { getData, subscribe } from "../lib/store";

interface MetricCardProps {
  dataKey?: string;
  label?: string;
  valueKey?: string;
  aggregate?: "count" | "sum";
}

export function MetricCard({
  dataKey = "data",
  label = "Value",
  valueKey,
  aggregate = "count",
}: MetricCardProps): JSX.Element {
  const safeKey = dataKey ?? "data";
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const data = getData(safeKey) as Record<string, unknown>[];
      if (aggregate === "count") {
        setValue(data.length);
      } else {
        const key = valueKey ?? (data[0] ? Object.keys(data[0] as object)[0] : "");
        setValue(
          data.reduce((sum, row) => sum + Number((row as Record<string, unknown>)[key]) || 0, 0)
        );
      }
    };
    update();
    const unsub = subscribe((k) => {
      if (k === safeKey) update();
    });
    return unsub;
  }, [safeKey, valueKey, aggregate]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
