import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MessageSquare,
    LayoutDashboard,
    Sun,
    Moon,
    X,
} from "lucide-react";

export interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    keywords?: string[];
    category: "navigation" | "theme" | "templates" | "actions";
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: "chat" | "dashboard") => void;
    onToggleTheme: () => void;
    currentTheme: "light" | "dark";
}

export function CommandPalette({
    isOpen,
    onClose,
    onNavigate,
    onToggleTheme,
    currentTheme,
}: CommandPaletteProps): JSX.Element | null {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands: CommandItem[] = useMemo(
        () => [
            {
                id: "nav-chat",
                label: "Go to Chat",
                description: "Switch to the Chat tab",
                icon: <MessageSquare className="h-4 w-4" />,
                action: () => {
                    onNavigate("chat");
                    onClose();
                },
                keywords: ["chat", "message", "ai", "talk"],
                category: "navigation",
            },
            {
                id: "nav-dashboard",
                label: "Go to Dashboard",
                description: "Switch to the Dashboard tab",
                icon: <LayoutDashboard className="h-4 w-4" />,
                action: () => {
                    onNavigate("dashboard");
                    onClose();
                },
                keywords: ["dashboard", "view", "ui", "components"],
                category: "navigation",
            },
            {
                id: "toggle-theme",
                label: currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
                description: "Toggle between light and dark themes",
                icon: currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
                action: () => {
                    onToggleTheme();
                    onClose();
                },
                keywords: ["theme", "dark", "light", "mode", "appearance"],
                category: "theme",
            },
        ],
        [onNavigate, onClose, onToggleTheme, currentTheme]
    );

    const filteredCommands = useMemo(() => {
        if (!query.trim()) return commands;
        const lower = query.toLowerCase();
        return commands.filter(
            (cmd) =>
                cmd.label.toLowerCase().includes(lower) ||
                cmd.description?.toLowerCase().includes(lower) ||
                cmd.keywords?.some((kw) => kw.includes(lower))
        );
    }, [commands, query]);

    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        for (const cmd of filteredCommands) {
            if (!groups[cmd.category]) groups[cmd.category] = [];
            groups[cmd.category].push(cmd);
        }
        return groups;
    }, [filteredCommands]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredCommands.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredCommands.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [isOpen, filteredCommands, selectedIndex, onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const categoryLabels: Record<string, string> = {
        navigation: "Navigation",
        theme: "Appearance",
        templates: "Launch Workspace",
        actions: "Actions",
    };

    let flatIndex = 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type a command or search..."
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

                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {filteredCommands.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                No commands found for "{query}"
                            </div>
                        ) : (
                            Object.entries(groupedCommands).map(([category, items]) => (
                                <div key={category} className="mb-3">
                                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {categoryLabels[category] || category}
                                    </div>
                                    {items.map((cmd) => {
                                        const currentFlatIndex = flatIndex++;
                                        const isSelected = currentFlatIndex === selectedIndex;
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={cmd.action}
                                                onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                                                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${isSelected
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-foreground hover:bg-muted"
                                                    }`}
                                            >
                                                <span
                                                    className={`flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {cmd.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{cmd.label}</div>
                                                    {cmd.description && (
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {cmd.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
                            Navigate
                        </span>
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

export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
    };
}
