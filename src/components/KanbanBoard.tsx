import { useEffect, useState } from "react";
import { getData, subscribe, updateRow } from "../lib/store";

const DEFAULT_KANBAN_COLUMNS = ["To Do", "In Progress", "Done"];

interface KanbanBoardProps {
  dataKey?: string;
  statusKey?: string;
  columns?: string[];
  title?: string;
}

export function KanbanBoard({
  dataKey = "board",
  statusKey = "status",
  columns,
  title = "Board",
}: KanbanBoardProps): JSX.Element {
  const safeKey = dataKey ?? "board";
  const safeColumns = Array.isArray(columns) ? columns : DEFAULT_KANBAN_COLUMNS;
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

  const moveTo = (index: number, status: string) => {
    updateRow(safeKey, index, { [statusKey]: status });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {safeColumns.map((col) => (
          <div
            key={col}
            className="min-w-[180px] rounded border border-border bg-muted/30 p-2"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">{col}</p>
            <div className="space-y-2">
              {data.map((row, i) => {
                if (String((row as Record<string, unknown>)[statusKey]) !== col) return null;
                return (
                  <div
                    key={i}
                    className="rounded border border-border bg-card p-2 text-sm"
                  >
                    {Object.entries(row as object)
                      .filter(([k]) => k !== statusKey)
                      .map(([k, v]) => (
                        <p key={k}>
                          <span className="text-muted-foreground">{k}:</span> {String(v)}
                        </p>
                      ))}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {safeColumns
                        .filter((c) => c !== col)
                        .map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => moveTo(i, c)}
                            className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary hover:bg-primary/30"
                          >
                            → {c}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
