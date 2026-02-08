import { useState } from "react";

interface TextEditorProps {
  dataKey?: string;
  title?: string;
  placeholder?: string;
  defaultValue?: string;
}

export function TextEditor({
  title = "Notes",
  placeholder = "Type here...",
  defaultValue = "",
}: TextEditorProps): JSX.Element {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
