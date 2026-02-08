import { useState } from "react";

interface RichTextEditorProps {
    title?: string;
    initialContent?: string;
}

export function RichTextEditor({
    title = "Text Editor",
    initialContent = "",
}: RichTextEditorProps): JSX.Element {
    const [content, setContent] = useState(initialContent);
    const [fileName, setFileName] = useState("untitled.txt");

    const handleDownload = () => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("text/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setContent(event.target?.result as string);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;

    return (
        <div className="flex h-[600px] flex-col rounded-lg border border-border bg-card text-card-foreground shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-green-500/10 to-teal-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <h3 className="font-semibold">{title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded bg-muted px-3 py-1 text-xs hover:bg-muted/80">
                        Open
                        <input
                            type="file"
                            accept="text/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* File Name */}
            <div className="border-b border-border bg-muted/30 px-4 py-2">
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full rounded border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="File name..."
                />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground focus:outline-none"
                    placeholder="Start typing..."
                />
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                </div>
                <div className="text-xs text-muted-foreground">
                    Plain Text Editor
                </div>
            </div>
        </div>
    );
}
