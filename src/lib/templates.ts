// Pre-built workspace templates for one-click launch
import type { Slot } from "../components/FlowDeskLayout";

export interface WorkspaceTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    slots: Slot[];
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
    {
        id: "developer",
        name: "Developer Pro",
        description: "CodeEditor, Terminal, Browser, TaskList, Pomodoro",
        icon: "Code",
        slots: [
            { id: "dev-code-editor", type: "CodeEditor", props: { title: "Code Editor", language: "typescript" } },
            { id: "dev-terminal", type: "Terminal", props: { title: "Terminal" } },
            { id: "dev-browser", type: "Browser", props: { title: "Browser", url: "https://docs.tambo.co" } },
            { id: "dev-tasks", type: "TaskList", props: { title: "Dev Tasks", dataKey: "dev-tasks" } },
            { id: "dev-pomodoro", type: "PomodoroTimer", props: { title: "Focus Timer" } },
        ],
    },
    {
        id: "content-creator",
        name: "Content Creator",
        description: "RichTextEditor, ImageViewer, MusicPlayer, NotesApp",
        icon: "Sparkles",
        slots: [
            { id: "creator-editor", type: "RichTextEditor", props: { title: "Writing Pad" } },
            { id: "creator-images", type: "ImageViewer", props: { title: "Image Gallery" } },
            { id: "creator-music", type: "MusicPlayer", props: { title: "Background Music" } },
            { id: "creator-notes", type: "NotesApp", props: { title: "Ideas & Notes", dataKey: "creator-notes" } },
        ],
    },
    {
        id: "student",
        name: "Student Hub",
        description: "NotesApp, TaskList, Pomodoro, Calculator, Spreadsheet",
        icon: "BookOpen",
        slots: [
            { id: "student-notes", type: "NotesApp", props: { title: "Study Notes", dataKey: "study-notes" } },
            { id: "student-tasks", type: "TaskList", props: { title: "Assignments", dataKey: "assignments" } },
            { id: "student-pomodoro", type: "PomodoroTimer", props: { title: "Study Timer" } },
            { id: "student-calc", type: "Calculator", props: { title: "Calculator" } },
            { id: "student-grades", type: "Spreadsheet", props: { title: "Grade Tracker", dataKey: "grades" } },
        ],
    },
    {
        id: "relaxation",
        name: "Relaxation Mode",
        description: "MusicPlayer, Pomodoro (break mode), WeatherWidget",
        icon: "Music",
        slots: [
            {
                id: "relax-music",
                type: "MusicPlayer",
                props: {
                    title: "Lofi Beats",
                    tracks: [
                        { label: "Lofi Hip Hop", url: "https://www.youtube.com/embed/jfKfPfyJRdk" },
                        { label: "Jazz Cafe", url: "https://www.youtube.com/embed/Dx5qFachd3A" },
                    ]
                }
            },
            { id: "relax-timer", type: "PomodoroTimer", props: { title: "Break Timer", defaultMinutes: 15 } },
            { id: "relax-weather", type: "WeatherWidget", props: { title: "Weather" } },
        ],
    },
    {
        id: "analyst",
        name: "Data Analyst",
        description: "Spreadsheet, DataTable, ChartView, Calculator",
        icon: "BarChart3",
        slots: [
            { id: "analyst-sheet", type: "Spreadsheet", props: { title: "Data Sheet", dataKey: "analysis-data" } },
            { id: "analyst-table", type: "DataTable", props: { title: "Data View", dataKey: "analysis-data" } },
            { id: "analyst-chart", type: "ChartView", props: { title: "Visualization", dataKey: "analysis-data", xKey: "category", yKey: "value" } },
            { id: "analyst-calc", type: "Calculator", props: { title: "Quick Calc" } },
        ],
    },
];

export function getTemplateById(id: string): WorkspaceTemplate | undefined {
    return WORKSPACE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateSlots(id: string): Slot[] {
    return getTemplateById(id)?.slots ?? [];
}
