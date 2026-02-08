import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getData, subscribe } from "../lib/store";

interface ChartViewProps {
  dataKey?: string;
  xKey?: string;
  yKey?: string;
  title?: string;
}

export function ChartView({
  dataKey = "chart",
  xKey,
  yKey,
  title = "Chart",
}: ChartViewProps): JSX.Element {
  const safeKey = dataKey ?? "chart";
  const [data, setData] = useState<Record<string, unknown>[]>(() =>
    getData(safeKey) as Record<string, unknown>[]
  );

  useEffect(() => {
    setData(getData(safeKey) as Record<string, unknown>[]);
    const unsub = subscribe((key) => {
      if (key === safeKey) setData(getData(safeKey) as Record<string, unknown>[]);
    });
    return unsub;
  }, [safeKey]);

  const first = data[0] as Record<string, unknown> | undefined;
  const x = xKey ?? (first ? Object.keys(first)[0] : "");
  const y = yKey ?? (first ? Object.keys(first)[1] : "");

  const chartData = data.map((row) => ({
    name: String((row as Record<string, unknown>)[x] ?? ""),
    value: Number((row as Record<string, unknown>)[y]) || 0,
  }));

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
        <h3 className="mb-3 font-semibold">{title}</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No data yet. Add rows to see the chart.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs" stroke="var(--muted-foreground)" />
            <YAxis className="text-xs" stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
