/**
 * Central Tambo config: FlowDeskLayout + composeUI tool.
 * AI calls composeUI(slots) to render a dynamic UI.
 */
import { FlowDeskLayout } from "../components/FlowDeskLayout";
import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/** Explicit slot props schema (no record/dynamic keys) so Tambo propsSchema validation passes. */
const slotPropsSchema = z
  .object({
    dataKey: z.string().optional(),
    title: z.string().optional(),
    label: z.string().optional(),
    submitLabel: z.string().optional(),
    placeholder: z.string().optional(),
    defaultValue: z.string().optional(),
    valueKey: z.string().optional(),
    xKey: z.string().optional(),
    yKey: z.string().optional(),
    statusKey: z.string().optional(),
    aggregate: z.enum(["count", "sum"]).optional(),
    url: z.string().optional(),
    tracks: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .optional(),
    columns: z
      .array(
        z.union([
          z.string(),
          z.object({ key: z.string(), label: z.string() }),
        ])
      )
      .optional(),
    fields: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          type: z.enum(["text", "number", "date"]).optional(),
        })
      )
      .optional(),
  })
  .default({});

const slotSchema = z.object({
  type: z.string(),
  props: slotPropsSchema,
});

const flowDeskLayoutSchema = z.object({
  slots: z.array(slotSchema).default([]),
});

export const components: TamboComponent[] = [
  {
    name: "FlowDeskLayout",
    description:
      "Renders a dynamic grid of UI components. Each slot has type (DataTable, FormBuilder, ChartView, MetricCard, KanbanBoard, TextEditor, MusicPlayer, YouTubePlayer, PDFViewer, ImageViewer, RichTextEditor, JobTracker, NotesApp, TaskList, Calculator, PomodoroTimer, CodeEditor, WeatherWidget, QuickLinks, Spreadsheet, Whiteboard, Terminal, Browser) and props. Use when the user asks to build any app, viewer, or productivity tool.",
    component: FlowDeskLayout,
    propsSchema: flowDeskLayoutSchema,
  },
];

function makeLayout(slots: Array<{ type: string; props?: Record<string, unknown> }>) {
  // Validation: warn if suspicious single-slot call
  if (slots.length === 1) {
    console.warn('[FlowDesk] ⚠️ Warning: Only 1 component slot provided. If user requested multiple components, this may be incorrect.');
  }

  // Auto-generate IDs for slots that don't have them
  const slotsWithIds = slots.map((slot, index) => ({
    id: `tool-slot-${Date.now()}-${index}`,
    type: slot.type,
    props: slot.props || {}
  }));
  return { component: "FlowDeskLayout" as const, props: { slots: slotsWithIds } };
}

export const tools: TamboTool[] = [
  {
    name: "composeUI",
    description:
      "Use this tool to render UI components when a user asks to build, create, or show any kind of user interface. " +
      "Call this tool with a list of component slots - IMPORTANT: When users ask for a 'workspace' or multiple features, you MUST provide MULTIPLE slots in the array. " +
      "For example, if user asks for 'coding workspace', provide slots for CodeEditor, Whiteboard, Terminal, and NotesApp. " +
      "If user asks for 'code editor and whiteboard', provide slots for BOTH components. " +
      "Each slot has a 'type' (like NotesApp, TaskList, Calculator, etc.) and optional 'props'. " +
      "CRITICAL: Your verbal description MUST match the actual slots you provide - if you say you're showing 3 components, the slots array must contain 3 items. " +
      "ALWAYS use this tool - NEVER just describe what you would build.",
    inputSchema: z.object({
      slots: z.array(
        z.union([
          z.string(), // Allow simple strings like "NotesApp"
          z.object({
            type: z.enum([
              "DataTable",
              "FormBuilder",
              "ChartView",
              "MetricCard",
              "KanbanBoard",
              "TextEditor",
              "MusicPlayer",
              "YouTubePlayer",
              "PDFViewer",
              "ImageViewer",
              "RichTextEditor",
              "JobTracker",
              "NotesApp",
              "TaskList",
              "Calculator",
              "PomodoroTimer",
              "CodeEditor",
              "WeatherWidget",
              "QuickLinks",
              "Spreadsheet",
              "Whiteboard",
              "Terminal",
              "Browser",
            ]),
            props: slotPropsSchema.optional(),
          })
        ])
      ),
    }),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async ({ slots }) => {
      console.log('[TOOL composeUI] Called with slots:', slots);

      // Handle both string format ["NotesApp"] and object format [{type: "NotesApp", props: {}}]
      const normalized = slots.map((s: string | { type: string; props?: Record<string, unknown> }) => {
        if (typeof s === "string") {
          // AI sent a string like "NotesApp" - convert to object
          console.log('[TOOL composeUI] Converting string to object:', s);
          return {
            type: s,
            props: {} as Record<string, unknown>,
          };
        }
        // AI sent proper object - use as is
        console.log('[TOOL composeUI] Using object as-is:', s);
        return {
          type: s.type,
          props: (s.props ?? {}) as Record<string, unknown>,
        };
      });

      console.log('[TOOL composeUI] Normalized slots:', normalized);
      const result = makeLayout(normalized);
      console.log('[TOOL composeUI] Returning:', result);
      return result;
    },
  },
  {
    name: "buildCodingWorkspace",
    description:
      "Build a complete coding workspace with CodeEditor, Whiteboard for diagrams/notes, Terminal for commands, and NotesApp for documentation. Call when user asks for a coding workspace, development environment, or programming setup.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async () =>
      makeLayout([
        {
          type: "CodeEditor",
          props: { title: "Code Editor" },
        },
        {
          type: "Whiteboard",
          props: { title: "Whiteboard" },
        },
        {
          type: "Terminal",
          props: { title: "Terminal" },
        },
        {
          type: "NotesApp",
          props: { title: "Notes" },
        },
      ]),
  },
  {
    name: "buildProductivityWorkspace",
    description:
      "Build a productivity workspace with TaskList, NotesApp, PomodoroTimer, and Calculator. Call when user asks for a productivity dashboard, task management, or work organization setup.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async () =>
      makeLayout([
        {
          type: "TaskList",
          props: { title: "Tasks" },
        },
        {
          type: "NotesApp",
          props: { title: "Notes" },
        },
        {
          type: "PomodoroTimer",
          props: { title: "Focus Timer" },
        },
        {
          type: "Calculator",
          props: { title: "Calculator" },
        },
      ]),
  },
  {
    name: "buildContentWorkspace",
    description:
      "Build a content creation workspace with RichTextEditor, ImageViewer, PDFViewer, and NotesApp. Call when user asks for content creation, document editing, or media workspace.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async () =>
      makeLayout([
        {
          type: "RichTextEditor",
          props: { title: "Rich Text Editor" },
        },
        {
          type: "ImageViewer",
          props: { title: "Image Viewer" },
        },
        {
          type: "PDFViewer",
          props: { title: "PDF Viewer" },
        },
        {
          type: "NotesApp",
          props: { title: "Notes" },
        },
      ]),
  },
  {
    name: "buildExpenseTracker",
    description:
      "Build a ready-to-use expense tracker with a table, form to add expenses, chart, and total metric. Call when user asks for an expense tracker.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async () =>
      makeLayout([
        {
          type: "DataTable",
          props: {
            dataKey: "expenses",
            title: "Expenses",
            columns: [
              { key: "description", label: "Description" },
              { key: "amount", label: "Amount" },
              { key: "date", label: "Date" },
            ],
          },
        },
        {
          type: "FormBuilder",
          props: {
            dataKey: "expenses",
            title: "Add expense",
            fields: [
              { key: "description", label: "Description" },
              { key: "amount", label: "Amount", type: "number" },
              { key: "date", label: "Date", type: "date" },
            ],
            submitLabel: "Add",
          },
        },
        {
          type: "ChartView",
          props: {
            dataKey: "expenses",
            xKey: "description",
            yKey: "amount",
            title: "By amount",
          },
        },
        {
          type: "MetricCard",
          props: {
            dataKey: "expenses",
            label: "Total expenses",
            valueKey: "amount",
            aggregate: "sum",
          },
        },
      ]),
  },
  {
    name: "buildJobTracker",
    description:
      "Build a job application tracker with Kanban (To Do, In Progress, Done), table, and form. Call when user asks for a job tracker or application tracker.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async () =>
      makeLayout([
        {
          type: "KanbanBoard",
          props: {
            dataKey: "jobs",
            statusKey: "status",
            columns: ["To Do", "In Progress", "Done"],
            title: "Applications",
          },
        },
        {
          type: "DataTable",
          props: { dataKey: "jobs", title: "All jobs" },
        },
        {
          type: "FormBuilder",
          props: {
            dataKey: "jobs",
            title: "Add application",
            fields: [
              { key: "company", label: "Company" },
              { key: "role", label: "Role" },
              { key: "status", label: "Status" },
            ],
            submitLabel: "Add",
          },
        },
      ]),
  },
  {
    name: "buildBugTracker",
    description:
      "Build a bug tracker with Kanban (Open, In Progress, Done), table, and form. Call when user asks for a bug tracker.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      component: z.literal("FlowDeskLayout"),
      props: z.object({ slots: z.array(slotSchema) }),
    }),
    tool: async () =>
      makeLayout([
        {
          type: "KanbanBoard",
          props: {
            dataKey: "bugs",
            statusKey: "status",
            columns: ["Open", "In Progress", "Done"],
            title: "Bugs",
          },
        },
        {
          type: "DataTable",
          props: { dataKey: "bugs", title: "All bugs" },
        },
        {
          type: "FormBuilder",
          props: {
            dataKey: "bugs",
            title: "Report bug",
            fields: [
              { key: "title", label: "Title" },
              { key: "description", label: "Description" },
              { key: "status", label: "Status" },
            ],
            submitLabel: "Add",
          },
        },
      ]),
  },
];
