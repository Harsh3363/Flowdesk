import { useState } from "react";
import { useComponentData } from "../lib/persistence";

interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
    createdAt: string;
}

interface TaskListProps {
    title?: string;
}

export function TaskList({ title = "Task List" }: TaskListProps): JSX.Element {
    const [tasks, setTasks] = useComponentData<Task[]>("tasks", []);
    const [newTask, setNewTask] = useState("");
    const [priority, setPriority] = useState<Task["priority"]>("medium");
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const task: Task = {
            id: Date.now().toString(),
            text: newTask.trim(),
            completed: false,
            priority,
            createdAt: new Date().toISOString(),
        };

        setTasks([task, ...tasks]);
        setNewTask("");
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const filteredTasks = tasks.filter((task) => {
        if (filter === "active") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    const stats = {
        total: tasks.length,
        active: tasks.filter((t) => !t.completed).length,
        completed: tasks.filter((t) => t.completed).length,
    };

    const priorityColors = {
        low: "text-blue-600 bg-blue-100 border-blue-300",
        medium: "text-yellow-600 bg-yellow-100 border-yellow-300",
        high: "text-red-600 bg-red-100 border-red-300",
    };

    return (
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                    {stats.active} / {stats.total} tasks
                </div>
            </div>

            <form onSubmit={handleAddTask} className="mb-4 space-y-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
                    />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Task["priority"])}
                        className="rounded border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        Add
                    </button>
                </div>
            </form>

            <div className="mb-3 flex gap-2">
                {(["all", "active", "completed"] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded px-3 py-1 text-xs font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-start gap-3 rounded-lg border p-3 ${task.completed ? "border-border/50 bg-muted/30 opacity-60" : "border-border bg-background"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="mt-1 h-4 w-4 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                    {task.text}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(task.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
                        </p>
                    </div>
                )}
            </div>

            {tasks.length > 0 && (
                <div className="mt-4 flex justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>{stats.completed} completed</span>
                    <span>{stats.active} remaining</span>
                </div>
            )}
        </div>
    );
}
