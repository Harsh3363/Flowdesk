import { useState, useEffect } from "react";
import { Timer, Coffee } from "lucide-react";

export function PomodoroTimer({ title = "Pomodoro Timer" }) {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"work" | "break">("work");
    const [sessions, setSessions] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        setIsActive(false);
                        if (mode === "work") {
                            setSessions(s => s + 1);
                            setMode("break");
                            setMinutes(5);
                        } else {
                            setMode("work");
                            setMinutes(25);
                        }
                    } else {
                        setMinutes(m => m - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(s => s - 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, minutes, seconds, mode]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setMinutes(mode === "work" ? 25 : 5);
        setSeconds(0);
    };

    const progress = mode === "work"
        ? ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100
        : ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="font-semibold mb-4">{title}</h3>

            <div className="text-center mb-6">
                <div className={`flex items-center justify-center gap-2 text-sm font-medium mb-2 ${mode === "work" ? "text-red-500" : "text-green-500"}`}>
                    {mode === "work" ? (
                        <><Timer className="h-4 w-4" /> Work Time</>
                    ) : (
                        <><Coffee className="h-4 w-4" /> Break Time</>
                    )}
                </div>
                <div className="text-6xl font-mono font-bold">
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${mode === "work" ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={toggle}
                    className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    {isActive ? "Pause" : "Start"}
                </button>
                <button
                    onClick={reset}
                    className="rounded bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
                >
                    Reset
                </button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Sessions completed: {sessions}
            </div>
        </div>
    );
}
