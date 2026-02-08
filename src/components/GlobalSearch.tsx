import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, CheckSquare, Table, ArrowRight } from "lucide-react";
import { useStore } from "../lib/store";

interface SearchResult {
    type: "notes" | "tasks" | "spreadsheet";
    title: string;
    content: string;
    dataKey: string;
    index?: number;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ isOpen, onClose, onResultClick }: GlobalSearchProps): JSX.Element | null {
    const [query, setQuery] = useState("");
    const { store } = useStore();

    const results = useMemo(() => {
        if (!query.trim()) return [];

        const searchResults: SearchResult[] = [];
        const lowerQuery = query.toLowerCase();

        // Search through all data keys in the store
        Object.entries(store).forEach(([dataKey, items]) => {
            if (!Array.isArray(items)) return;

            items.forEach((item: unknown, index: number) => {
                const record = item as Record<string, unknown>;
                // Determine type based on data structure
                let type: SearchResult["type"] = "spreadsheet";
                if ("text" in record || "content" in record || "note" in record) {
                    type = "notes";
                } else if ("completed" in record || "done" in record || "task" in record || "status" in record) {
                    type = "tasks";
                }

                // Search all string values in the item
                const values = Object.values(record);
                for (const value of values) {
                    if (typeof value === "string" && value.toLowerCase().includes(lowerQuery)) {
                        const title = String(record.title || record.name || record.task || record.description || `Item ${index + 1}`);
                        const content = String(value).slice(0, 100);

                        searchResults.push({
                            type,
                            title,
                            content: content.length === 100 ? content + "..." : content,
                            dataKey,
                            index,
                        });
                        break; // Only add item once even if multiple fields match
                    }
                }
            });
        });

        return searchResults.slice(0, 20); // Limit results
    }, [query, store]);

    const iconMap = {
        notes: FileText,
        tasks: CheckSquare,
        spreadsheet: Table,
    };

    const typeLabels = {
        notes: "Note",
        tasks: "Task",
        spreadsheet: "Data",
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search notes, tasks, and data..."
                            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                            autoFocus
                        />
                        <button
                            onClick={onClose}
                            className="rounded p-1 hover:bg-muted transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {query.trim() === "" ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p>Start typing to search across your data</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                <p>No results found for "{query}"</p>
                                <p className="text-sm mt-1">Try different keywords</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {results.length} result{results.length !== 1 ? "s" : ""}
                                </div>
                                {results.map((result, idx) => {
                                    const Icon = iconMap[result.type];
                                    return (
                                        <button
                                            key={`${result.dataKey}-${result.index}-${idx}`}
                                            onClick={() => {
                                                onResultClick?.(result);
                                                onClose();
                                            }}
                                            className="w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-muted transition-colors group"
                                        >
                                            <span className="flex-shrink-0 mt-0.5 text-muted-foreground">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-medium text-foreground truncate">
                                                        {result.title}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {typeLabels[result.type]}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {result.content}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
                            Select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd>
                            Close
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
