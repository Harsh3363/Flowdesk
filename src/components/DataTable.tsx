import { useEffect, useState } from "react";
import { getData, subscribe } from "../lib/store";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  dataKey?: string;
  columns?: Column[];
  title?: string;
}

const DEFAULT_DATA_KEY = "data";

export function DataTable({
  dataKey = DEFAULT_DATA_KEY,
  columns,
  title = "Data",
}: DataTableProps): JSX.Element {
  const safeKey = dataKey ?? DEFAULT_DATA_KEY;
  const safeColumns = Array.isArray(columns) ? columns : [];
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

  const cols =
    safeColumns.length > 0
      ? safeColumns
      : data[0]
        ? Object.keys(data[0] as object).map((k) => ({ key: k, label: k }))
        : [];

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {cols.map((c, ci) => (
                <th key={c.key ? `${c.key}-${ci}` : `col-${ci}`} className="px-3 py-2 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                {cols.map((c, ci) => (
                  <td key={c.key ? `${c.key}-${ci}` : `col-${ci}`} className="px-3 py-2">
                    {String((row as Record<string, unknown>)[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No rows yet</p>
      )}
    </div>
  );
}
