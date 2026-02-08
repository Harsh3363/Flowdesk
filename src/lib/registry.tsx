import type { ComponentType } from "react";
import { DataTable } from "../components/DataTable";
import { FormBuilder } from "../components/FormBuilder";
import { ChartView } from "../components/ChartView";
import { MetricCard } from "../components/MetricCard";
import { KanbanBoard } from "../components/KanbanBoard";
import { TextEditor } from "../components/TextEditor";
import { MusicPlayer } from "../components/MusicPlayer";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { PDFViewer } from "../components/PDFViewer";
import { ImageViewer } from "../components/ImageViewer";
import { RichTextEditor } from "../components/RichTextEditor";
import { JobTracker } from "../components/JobTracker";
import { NotesApp } from "../components/NotesApp";
import { TaskList } from "../components/TaskList";
import { Calculator } from "../components/Calculator";
import { PomodoroTimer } from "../components/PomodoroTimer";
import { CodeEditor } from "../components/CodeEditor";
import { WeatherWidget } from "../components/WeatherWidget";
import { QuickLinks } from "../components/QuickLinks";
import { Spreadsheet } from "../components/Spreadsheet";
import { Whiteboard } from "../components/Whiteboard";
import { Terminal } from "../components/Terminal";
import { Browser } from "../components/Browser";

export type SlotProps = Record<string, unknown>;

export const COMPONENT_REGISTRY: Record<string, ComponentType<SlotProps>> = {
  DataTable: DataTable as unknown as ComponentType<SlotProps>,
  FormBuilder: FormBuilder as unknown as ComponentType<SlotProps>,
  ChartView: ChartView as unknown as ComponentType<SlotProps>,
  MetricCard: MetricCard as unknown as ComponentType<SlotProps>,
  KanbanBoard: KanbanBoard as unknown as ComponentType<SlotProps>,
  TextEditor: TextEditor as unknown as ComponentType<SlotProps>,
  MusicPlayer: MusicPlayer as unknown as ComponentType<SlotProps>,
  YouTubePlayer: YouTubePlayer as unknown as ComponentType<SlotProps>,
  PDFViewer: PDFViewer as unknown as ComponentType<SlotProps>,
  ImageViewer: ImageViewer as unknown as ComponentType<SlotProps>,
  RichTextEditor: RichTextEditor as unknown as ComponentType<SlotProps>,
  JobTracker: JobTracker as unknown as ComponentType<SlotProps>,
  NotesApp: NotesApp as unknown as ComponentType<SlotProps>,
  TaskList: TaskList as unknown as ComponentType<SlotProps>,
  Calculator: Calculator as unknown as ComponentType<SlotProps>,
  PomodoroTimer: PomodoroTimer as unknown as ComponentType<SlotProps>,
  CodeEditor: CodeEditor as unknown as ComponentType<SlotProps>,
  WeatherWidget: WeatherWidget as unknown as ComponentType<SlotProps>,
  QuickLinks: QuickLinks as unknown as ComponentType<SlotProps>,
  Spreadsheet: Spreadsheet as unknown as ComponentType<SlotProps>,
  Whiteboard: Whiteboard as unknown as ComponentType<SlotProps>,
  Terminal: Terminal as unknown as ComponentType<SlotProps>,
  Browser: Browser as unknown as ComponentType<SlotProps>,
};

export function getComponent(type: string): ComponentType<SlotProps> | undefined {
  return COMPONENT_REGISTRY[type];
}
