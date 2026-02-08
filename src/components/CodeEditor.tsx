import Editor from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";
import { Play, Download, Trash2, Terminal, Copy, Check } from "lucide-react";
import { useComponentData } from "../lib/persistence";

interface ConsoleOutput {
    type: "log" | "error" | "warn" | "info";
    content: string;
    timestamp: Date;
}

interface CodeEditorData {
    code: string;
    language: string;
    fileName: string;
}

const DEFAULT_CODE = `// Welcome to FlowDesk Code Editor!
// Write JavaScript and click Run to execute

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("FlowDesk"));
console.log("2 + 2 =", 2 + 2);
`;

export function CodeEditor({ title = "Code Editor" }) {
    const [editorData, setEditorData] = useComponentData<CodeEditorData>("codeEditor", {
        code: DEFAULT_CODE,
        language: "javascript",
        fileName: "script.js"
    });

    const [code, setCode] = useState(editorData.code);
    const [language, setLanguage] = useState(editorData.language);
    const [fileName, setFileName] = useState(editorData.fileName);
    const [output, setOutput] = useState<ConsoleOutput[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Save to persistence when code, language, or fileName changes
    useEffect(() => {
        setEditorData({ code, language, fileName });
    }, [code, language, fileName, setEditorData]);

    const handleDownload = () => {
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = () => {
        if (language !== "javascript" && language !== "typescript") {
            setOutput([{
                type: "warn",
                content: `Execution is only supported for JavaScript. Current language: ${language}`,
                timestamp: new Date()
            }]);
            return;
        }

        setIsRunning(true);
        setOutput([]);

        // Create sandboxed execution environment
        const iframe = iframeRef.current;
        if (!iframe) return;

        const logs: ConsoleOutput[] = [];

        // Inject code into iframe
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Override console methods
            const originalConsole = window.console;
            const logs = [];
            
            function sendLog(type, args) {
              const content = Array.from(args).map(arg => {
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch {
                    return String(arg);
                  }
                }
                return String(arg);
              }).join(' ');
              
              parent.postMessage({ type: 'console', logType: type, content }, '*');
            }
            
            console.log = (...args) => sendLog('log', args);
            console.error = (...args) => sendLog('error', args);
            console.warn = (...args) => sendLog('warn', args);
            console.info = (...args) => sendLog('info', args);
            
            window.onerror = (message, source, lineno, colno, error) => {
              sendLog('error', [message + ' (line ' + lineno + ')']);
              return true;
            };
          </script>
        </head>
        <body>
          <script>
            try {
              ${code}
              parent.postMessage({ type: 'done' }, '*');
            } catch (error) {
              console.error(error.message);
              parent.postMessage({ type: 'done' }, '*');
            }
          </script>
        </body>
      </html>
    `;

        // Listen for messages from iframe
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'console') {
                logs.push({
                    type: event.data.logType,
                    content: event.data.content,
                    timestamp: new Date()
                });
                setOutput([...logs]);
            } else if (event.data.type === 'done') {
                setIsRunning(false);
                if (logs.length === 0) {
                    setOutput([{
                        type: "info",
                        content: "Code executed successfully (no output)",
                        timestamp: new Date()
                    }]);
                }
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);

        // Set iframe content
        iframe.srcdoc = html;

        // Timeout safety
        setTimeout(() => {
            setIsRunning(false);
            window.removeEventListener('message', handleMessage);
        }, 5000);
    };

    const clearOutput = () => setOutput([]);

    const outputColors = {
        log: "text-foreground",
        error: "text-red-400",
        warn: "text-yellow-400",
        info: "text-blue-400"
    };

    return (
        <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-luxe overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <h3 className="font-semibold text-gradient">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="json">JSON</option>
                    </select>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                        title="Download"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium btn-primary disabled:opacity-50"
                        title="Run code (JavaScript only)"
                    >
                        <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-pulse" : ""}`} />
                        {isRunning ? "Running..." : "Run"}
                    </button>
                </div>
            </div>

            {/* File name bar */}
            <div className="border-b border-border bg-muted/20 px-4 py-2">
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-[200px]">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontLigatures: true,
                    }}
                />
            </div>

            {/* Console Output */}
            <div className="border-t border-border bg-[#1e1e1e]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Terminal className="h-4 w-4" />
                        Console
                        {output.length > 0 && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                                {output.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={clearOutput}
                        className="p-1 rounded hover:bg-muted/50 transition-colors"
                        title="Clear console"
                    >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>
                <div className="max-h-[150px] overflow-y-auto p-3 font-mono text-sm">
                    {output.length === 0 ? (
                        <div className="text-muted-foreground/50 text-xs">
                            Click "Run" to execute your code...
                        </div>
                    ) : (
                        output.map((log, i) => (
                            <div key={i} className={`py-0.5 ${outputColors[log.type]}`}>
                                <span className="text-muted-foreground/50 mr-2 text-xs">
                                    [{log.type}]
                                </span>
                                <span className="whitespace-pre-wrap">{log.content}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Hidden iframe for code execution */}
            <iframe
                ref={iframeRef}
                sandbox="allow-scripts"
                style={{ display: "none" }}
                title="Code execution sandbox"
            />
        </div>
    );
}
