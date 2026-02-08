import { useState } from "react";
import { appendRow } from "../lib/store";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
}

interface FormBuilderProps {
  dataKey?: string;
  fields?: Field[];
  title?: string;
  submitLabel?: string;
}

export function FormBuilder({
  dataKey = "form",
  fields = [],
  title = "Add entry",
  submitLabel = "Add",
}: FormBuilderProps): JSX.Element {
  const safeFields = Array.isArray(fields) ? fields : [];
  const today = new Date().toISOString().slice(0, 10);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      safeFields.map((f) => [f.key, f.type === "date" ? today : ""])
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const row: Record<string, unknown> = {};
    safeFields.forEach((f) => {
      const v = values[f.key];
      if (f.type === "number") {
        row[f.key] = v === "" ? 0 : Number(v);
      } else if (f.type === "date") {
        row[f.key] = v || new Date().toISOString().slice(0, 10);
      } else {
        row[f.key] = v;
      }
    });
    appendRow(dataKey, row);
    const nextToday = new Date().toISOString().slice(0, 10);
    setValues(
      Object.fromEntries(
        safeFields.map((f) => [f.key, f.type === "date" ? nextToday : ""])
      )
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {safeFields.map((f, i) => (
          <label key={f.key ? `${f.key}-${i}` : `field-${i}`} className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{f.label}</span>
            <input
              type={f.type === "date" ? "date" : f.type ?? "text"}
              value={values[f.key] ?? (f.type === "date" ? today : "")}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              className="rounded border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        ))}
        <button
          type="submit"
          className="mt-1 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
