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
            { type: "CodeEditor", props: { title: "Code Editor", language: "typescript" } },
            { type: "Terminal", props: { title: "Terminal" } },
            { type: "Browser", props: { title: "Browser", url: "https://docs.tambo.co" } },
            { type: "TaskList", props: { title: "Dev Tasks", dataKey: "dev-tasks" } },
            { type: "PomodoroTimer", props: { title: "Focus Timer" } },
        ],
    },
    {
        id: "content-creator",
        name: "Content Creator",
        description: "RichTextEditor, ImageViewer, MusicPlayer, NotesApp",
        icon: "Sparkles",
        slots: [
            { type: "RichTextEditor", props: { title: "Writing Pad" } },
            { type: "ImageViewer", props: { title: "Image Gallery" } },
            { type: "MusicPlayer", props: { title: "Background Music" } },
            { type: "NotesApp", props: { title: "Ideas & Notes", dataKey: "creator-notes" } },
        ],
    },
    {
        id: "student",
        name: "Student Hub",
        description: "NotesApp, TaskList, Pomodoro, Calculator, Spreadsheet",
        icon: "BookOpen",
        slots: [
            { type: "NotesApp", props: { title: "Study Notes", dataKey: "study-notes" } },
            { type: "TaskList", props: { title: "Assignments", dataKey: "assignments" } },
            { type: "PomodoroTimer", props: { title: "Study Timer" } },
            { type: "Calculator", props: { title: "Calculator" } },
            { type: "Spreadsheet", props: { title: "Grade Tracker", dataKey: "grades" } },
        ],
    },
    {
        id: "relaxation",
        name: "Relaxation Mode",
        description: "MusicPlayer, Pomodoro (break mode), WeatherWidget",
        icon: "Music",
        slots: [
            {
                type: "MusicPlayer",
                props: {
                    title: "Lofi Beats",
                    tracks: [
                        { label: "Lofi Hip Hop", url: "https://www.youtube.com/embed/jfKfPfyJRdk" },
                        { label: "Jazz Cafe", url: "https://www.youtube.com/embed/Dx5qFachd3A" },
                    ]
                }
            },
            { type: "PomodoroTimer", props: { title: "Break Timer", defaultMinutes: 15 } },
            { type: "WeatherWidget", props: { title: "Weather" } },
        ],
    },
    {
        id: "analyst",
        name: "Data Analyst",
        description: "Spreadsheet, DataTable, ChartView, Calculator",
        icon: "BarChart3",
        slots: [
            { type: "Spreadsheet", props: { title: "Data Sheet", dataKey: "analysis-data" } },
            { type: "DataTable", props: { title: "Data View", dataKey: "analysis-data" } },
            { type: "ChartView", props: { title: "Visualization", dataKey: "analysis-data", xKey: "category", yKey: "value" } },
            { type: "Calculator", props: { title: "Quick Calc" } },
        ],
    },
];

export function getTemplateById(id: string): WorkspaceTemplate | undefined {
    return WORKSPACE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateSlots(id: string): Slot[] {
    return getTemplateById(id)?.slots ?? [];
}
