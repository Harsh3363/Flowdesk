import { useState, useRef, useEffect } from "react";

interface TerminalProps {
    title?: string;
}

export function Terminal({ title = "Terminal" }: TerminalProps): JSX.Element {
    const [history, setHistory] = useState<string[]>(["Welcome to FlowDesk Terminal", "Type 'help' for available commands"]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim().toLowerCase();
        const newHistory = [...history, `> ${input}`];

        switch (cmd) {
            case "help":
                newHistory.push("Available commands: help, clear, date, whoami, hello, status");
                break;
            case "clear":
                setHistory([]);
                setInput("");
                return;
            case "date":
                newHistory.push(new Date().toLocaleString());
                break;
            case "whoami":
                newHistory.push("flowdesk-user");
                break;
            case "hello":
                newHistory.push("Hello from the AI OS!");
                break;
            case "status":
                newHistory.push("System status: 🟢 All systems operational");
                break;
            default:
                newHistory.push(`Command not found: ${cmd}`);
        }

        setHistory(newHistory);
        setInput("");
    };

    return (
        <div className="flex h-[400px] flex-col rounded-lg border border-border bg-[#0c0c0c] text-[#f0f0f0] font-mono shadow-xl overflow-hidden">
            <div className="bg-[#1e1e1e] border-b border-[#333] px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-xs text-muted-foreground mr-10">{title}</span>
                <div></div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto text-sm leading-relaxed"
            >
                {history.map((line, i) => (
                    <div key={i} className={line.startsWith(">") ? "text-primary-foreground font-bold" : "text-green-400"}>
                        {line}
                    </div>
                ))}
                <form onSubmit={handleCommand} className="flex mt-1">
                    <span className="text-primary mr-2">➜</span>
                    <input
                        autoFocus
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        spellCheck={false}
                    />
                </form>
            </div>
        </div>
    );
}
