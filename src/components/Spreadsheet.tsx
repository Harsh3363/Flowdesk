import { useState } from "react";
import { useComponentData } from "../lib/persistence";

interface SpreadsheetProps {
    title?: string;
    initialRows?: number;
    initialCols?: number;
}

export function Spreadsheet({ title = "Spreadsheet", initialRows = 20, initialCols = 10 }: SpreadsheetProps): JSX.Element {
    const [data, setData] = useComponentData<Record<string, string>>("spreadsheet", {});
    const [activeCell, setActiveCell] = useState<string | null>(null);

    const getCellId = (r: number, c: number) => `${String.fromCharCode(65 + c)}${r + 1}`;

    const updateCell = (id: string, value: string) => {
        setData({ ...data, [id]: value });
    };

    const rows = Array.from({ length: initialRows });
    const cols = Array.from({ length: initialCols });

    return (
        <div className="flex h-[500px] flex-col rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-sm">{title}</h3>
                <div className="text-xs text-muted-foreground font-mono">
                    {activeCell || "Select a cell"}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="border-collapse w-full">
                    <thead>
                        <tr>
                            <th className="sticky top-0 left-0 z-20 w-10 bg-muted border border-border text-[10px] h-6"></th>
                            {cols.map((_, i) => (
                                <th key={i} className="sticky top-0 z-10 w-24 bg-muted border border-border text-[10px] font-medium h-6">
                                    {String.fromCharCode(65 + i)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((_, r) => (
                            <tr key={r}>
                                <td className="sticky left-0 z-10 bg-muted border border-border text-center text-[10px] font-medium w-10 h-8">
                                    {r + 1}
                                </td>
                                {cols.map((_, c) => {
                                    const id = getCellId(r, c);
                                    const isActive = activeCell === id;
                                    return (
                                        <td
                                            key={c}
                                            className={`border border-border p-0 h-8 min-w-[100px] ${isActive ? "ring-2 ring-primary ring-inset z-10" : ""}`}
                                            onClick={() => setActiveCell(id)}
                                        >
                                            <input
                                                type="text"
                                                value={data[id] || ""}
                                                onChange={(e) => updateCell(id, e.target.value)}
                                                className="w-full h-full border-none bg-transparent px-2 text-xs focus:outline-none"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
