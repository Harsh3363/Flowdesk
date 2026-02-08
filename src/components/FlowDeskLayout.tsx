import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactGridLayout, { WidthProvider } from "react-grid-layout/legacy";
import type { Layout, LayoutItem } from "react-grid-layout";
import { getComponent, COMPONENT_REGISTRY } from "../lib/registry";
import type { SlotProps } from "../lib/registry";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  GripVertical,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Edit3,
  Check,
  LayoutGrid
} from "lucide-react";

const GridLayoutWithWidth = WidthProvider(ReactGridLayout);

export interface Slot {
  id: string; // Stable unique identifier
  type: string;
  props: SlotProps;
}

interface FlowDeskLayoutProps {
  slots?: Slot[];
  onSlotsChange?: (slots: Slot[]) => void;
}

type LayoutSize = "small" | "medium" | "large" | "full";

interface LayoutState {
  [key: string]: LayoutSize; // Use string keys for slot IDs
}

const LAYOUT_STORAGE_KEY = "flowdesk_layout_state";
const LAYOUT_ITEMS_KEY = "flowdesk_layout_items";

// Generate a unique ID for components
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get responsive column count based on screen width
function getResponsiveCols(width: number = window.innerWidth): number {
  if (width < 640) return 4;   // Mobile: 4 columns
  if (width < 1024) return 8;  // Tablet: 8 columns
  return 12;                    // Desktop: 12 columns
}

// Get responsive base size based on screen width
function getResponsiveBaseSize(width: number = window.innerWidth): { w: number; h: number } {
  if (width < 640) return { w: 4, h: 3 };   // Mobile: full width
  if (width < 1024) return { w: 4, h: 4 };  // Tablet: half width
  return { w: 6, h: 4 };                     // Desktop: half width
}

function loadLayoutItems(): LayoutItem[] | null {
  try {
    const saved = localStorage.getItem(LAYOUT_ITEMS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLayoutItems(items: LayoutItem[]) {
  try {
    localStorage.setItem(LAYOUT_ITEMS_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

function generateLayoutForSlots(slots: Slot[], existing: LayoutItem[] | null): LayoutItem[] {
  const cols = getResponsiveCols();
  const baseSize = getResponsiveBaseSize();
  const baseW = baseSize.w;
  const baseH = baseSize.h;
  const items: LayoutItem[] = [];

  // Separate slots into those with existing layout and new ones
  const slotsWithLayout: Array<{ slot: Slot; layout: LayoutItem }> = [];
  const newSlots: Array<{ slot: Slot }> = [];

  for (const slot of slots) {
    // Match by slot ID, not by index
    const existingItem = existing?.find((it) => it.i === slot.id);
    if (existingItem) {
      slotsWithLayout.push({ slot, layout: existingItem });
    } else {
      newSlots.push({ slot });
    }
  }

  // Calculate the height needed for new slots at the top
  let newSlotsHeight = 0;
  if (newSlots.length > 0) {
    const newSlotsRows = Math.ceil((newSlots.length * baseW) / cols);
    newSlotsHeight = newSlotsRows * baseH;
  }

  // Add existing slots first, shifted down by newSlotsHeight
  for (const { slot, layout } of slotsWithLayout) {
    items.push({
      i: slot.id, // Use slot ID, not index
      x: layout.x,
      y: layout.y + newSlotsHeight,
      w: Math.min(layout.w, cols),
      h: Math.max(layout.h, 1),
      minW: 2,
      minH: 2,
    });
  }

  // Add new slots at the top
  let nextX = 0;
  let nextY = 0;
  for (const { slot } of newSlots) {
    if (nextX + 3 > cols) {
      nextX = 0;
      nextY += 3; // Match the new item height
    }

    items.push({
      i: slot.id, // Use slot ID, not index
      x: nextX,
      y: nextY,
      w: 3, // Start SMALL (BETA preference) to avoid layout overflow
      h: 3, // Start SMALL
      minW: 2,
      minH: 2,
    });

    nextX += 3; // Increment by smaller width
    if (nextX >= cols) {
      nextX = 0;
      nextY += 3; // Increment by smaller height
    }
  }

  return items;
}

function loadLayoutState(): LayoutState {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLayoutState(state: LayoutState) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

// Available components for adding
const AVAILABLE_COMPONENTS = Object.keys(COMPONENT_REGISTRY);

interface ComponentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

function ComponentPicker({ isOpen, onClose, onSelect }: ComponentPickerProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [suggestedComponents, setSuggestedComponents] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleAiSuggest = async () => {
    if (!aiPrompt.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis - in a real implementation, this would call Tambo AI
    setTimeout(() => {
      const prompt = aiPrompt.toLowerCase();
      const suggestions: string[] = [];

      // Smart component matching based on keywords
      if (prompt.includes("note") || prompt.includes("write") || prompt.includes("text")) {
        suggestions.push("NotesApp");
      }
      if (prompt.includes("task") || prompt.includes("todo") || prompt.includes("checklist")) {
        suggestions.push("TaskList");
      }
      if (prompt.includes("calc") || prompt.includes("math") || prompt.includes("number")) {
        suggestions.push("Calculator");
      }
      if (prompt.includes("code") || prompt.includes("program") || prompt.includes("editor")) {
        suggestions.push("CodeEditor");
      }
      if (prompt.includes("weather") || prompt.includes("temperature") || prompt.includes("forecast")) {
        suggestions.push("WeatherWidget");
      }
      if (prompt.includes("spread") || prompt.includes("table") || prompt.includes("data") || prompt.includes("excel")) {
        suggestions.push("Spreadsheet");
      }
      if (prompt.includes("draw") || prompt.includes("sketch") || prompt.includes("whiteboard")) {
        suggestions.push("Whiteboard");
      }
      if (prompt.includes("pdf") || prompt.includes("document")) {
        suggestions.push("PDFViewer");
      }
      if (prompt.includes("image") || prompt.includes("photo") || prompt.includes("picture")) {
        suggestions.push("ImageViewer");
      }
      if (prompt.includes("video") || prompt.includes("youtube") || prompt.includes("watch")) {
        suggestions.push("YouTubePlayer");
      }
      if (prompt.includes("terminal") || prompt.includes("command") || prompt.includes("shell")) {
        suggestions.push("Terminal");
      }
      if (prompt.includes("browser") || prompt.includes("web") || prompt.includes("internet")) {
        suggestions.push("Browser");
      }
      if (prompt.includes("job") || prompt.includes("career") || prompt.includes("application")) {
        suggestions.push("JobTracker");
      }
      if (prompt.includes("link") || prompt.includes("bookmark") || prompt.includes("shortcut")) {
        suggestions.push("QuickLinks");
      }

      // If no specific matches, suggest popular components
      if (suggestions.length === 0) {
        suggestions.push("NotesApp", "TaskList", "Calculator");
      }

      setSuggestedComponents(suggestions.slice(0, 6)); // Limit to 6 suggestions
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl mx-4 rounded-xl border border-border bg-card shadow-luxe overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
            <h3 className="text-lg font-semibold text-gradient">Add Component</h3>
            <p className="text-sm text-muted-foreground">Select a component or let AI suggest one for you</p>
          </div>

          {/* AI Suggestion Input */}
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSuggest()}
                placeholder="✨ Describe what you need... (e.g., 'I need to take notes' or 'track my tasks')"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleAiSuggest}
                disabled={!aiPrompt.trim() || isAnalyzing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing...
                  </div>
                ) : (
                  "✨ Suggest"
                )}
              </button>
            </div>

            {/* AI Suggestions */}
            {suggestedComponents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
              >
                <p className="text-xs font-medium text-primary mb-2">✨ AI Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedComponents.map((comp) => (
                    <button
                      key={comp}
                      onClick={() => {
                        onSelect(comp);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-medium text-primary transition-all hover:scale-105"
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-3">Or browse all components:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_COMPONENTS.map((type) => (
                <motion.button
                  key={type}
                  onClick={() => {
                    onSelect(type);
                    onClose();
                  }}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left group hover-glow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {type}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Click to add
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border bg-muted/30">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function FlowDeskLayout({ slots: initialSlots, onSlotsChange }: FlowDeskLayoutProps): JSX.Element {
  // Use ref to track if we've initialized to prevent infinite loops
  const initializedRef = useRef(false);
  const prevInitialSlotsRef = useRef<Slot[]>([]);

  const [slots, setSlots] = useState<Slot[]>(() => Array.isArray(initialSlots) ? initialSlots : []);
  const [layoutState, setLayoutState] = useState<LayoutState>(loadLayoutState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [cols, setCols] = useState(() => getResponsiveCols());

  // Update cols on window resize
  useEffect(() => {
    const handleResize = () => {
      setCols(getResponsiveCols());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(() => {
    const initial = Array.isArray(initialSlots) ? initialSlots : [];
    const saved = loadLayoutItems();
    const useSaved = saved != null && saved.length === initial.length;
    return generateLayoutForSlots(initial, useSaved ? saved : null);
  });

  // Only sync with initialSlots when it actually changes (not on every render)
  useEffect(() => {
    if (!Array.isArray(initialSlots) || initialSlots.length === 0) return;

    // Create signature based on IDs (or types if no IDs yet)
    const createSig = (slots: Slot[]) =>
      slots.map(s => s.id || s.type).join(',');

    const prevSig = createSig(prevInitialSlotsRef.current);
    const newSig = createSig(initialSlots);

    // Only update if the actual slots changed (not just IDs being added)
    if (prevSig !== newSig) {
      const saved = loadLayoutItems();

      // Check if there are GENUINELY new slots (not in saved layout)
      // This prevents edit mode triggering on page refresh/initial load
      const hasNewSlots = initialSlots.some(slot =>
        !saved || !saved.find(item => item.i === slot.id)
      );

      // If new components were added AND they are new to the layout
      if (initialSlots.length > prevInitialSlotsRef.current.length && hasNewSlots) {
        setIsEditMode(true);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }

      prevInitialSlotsRef.current = initialSlots;
      setSlots(initialSlots);
    }
  }, [initialSlots]);

  // Create a stable signature for slots using IDs
  const slotsSignature = useMemo(() => {
    return slots.map(s => s.id).join(',');
  }, [slots]);

  // Update layout when slots change - use stable signature
  const prevSlotsSignatureRef = useRef(slotsSignature);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevSlotsSignatureRef.current = slotsSignature;
      return;
    }

    // Only update if signature actually changed
    if (prevSlotsSignatureRef.current === slotsSignature) {
      return;
    }
    prevSlotsSignatureRef.current = slotsSignature;

    const saved = loadLayoutItems();
    // Match saved items by ID
    const useSaved = saved != null && saved.length > 0;
    const next = generateLayoutForSlots(slots, useSaved ? saved : null);

    // Use functional update to avoid stale closure and dependency cycles
    setLayoutItems((prev) => {
      // Create a map of current items for valid comparison
      // We only care about x, y, w, h changes for existing items
      // or if items were added/removed
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(next);

      if (prevStr === nextStr) {
        return prev;
      }

      saveLayoutItems(next);
      return next;
    });
  }, [slotsSignature, slots]);

  useEffect(() => {
    saveLayoutState(layoutState);
  }, [layoutState]);

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    const arr = Array.isArray(newLayout) ? [...newLayout] : [];
    setLayoutItems((prev) => {
      const prevStr = JSON.stringify(prev.map((p) => ({ i: p.i, x: p.x, y: p.y, w: p.w, h: p.h })));
      const nextStr = JSON.stringify(arr.map((p) => ({ i: p.i, x: p.x, y: p.y, w: p.w, h: p.h })));
      if (prevStr === nextStr) return prev;
      saveLayoutItems(arr);
      return arr;
    });
  }, []);

  const SIZE_TO_WH: Record<LayoutSize, { w: number; h: number }> = {
    small: { w: 4, h: 3 },
    medium: { w: 6, h: 4 },
    large: { w: 8, h: 5 },
    full: { w: 12, h: 6 },
  };

  const cycleSize = (slotId: string) => {
    const sizes: LayoutSize[] = ["small", "medium", "large", "full"];
    const current = layoutState[slotId] || "medium";
    const currentIdx = sizes.indexOf(current);
    const nextIdx = (currentIdx + 1) % sizes.length;
    const nextSize = sizes[nextIdx];
    setLayoutState((prev) => ({ ...prev, [slotId]: nextSize }));
    const { w, h } = SIZE_TO_WH[nextSize];
    setLayoutItems((prev) => {
      const next = prev.map((item) =>
        item.i === slotId ? { ...item, w, h } : item
      );
      saveLayoutItems(next);
      return next;
    });
  };

  const removeSlot = (slotId: string) => {
    const newSlots = slots.filter((slot) => slot.id !== slotId);
    setSlots(newSlots);
    onSlotsChange?.(newSlots);
  };

  const addComponent = (type: string) => {
    const newSlot: Slot = { id: generateId(), type, props: {} };
    // Add new component at the TOP (beginning) to prevent layout instability
    const newSlots = [newSlot, ...slots];
    setSlots(newSlots);
    onSlotsChange?.(newSlots);

    // Enable edit mode so user can place the component
    setIsEditMode(true);

    // Scroll to top to show the new component
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (slots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center shadow-luxe"
      >
        <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <LayoutGrid className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No components yet</h3>
        <p className="text-muted-foreground mb-6">Ask the AI to build a UI or add components manually</p>
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Component
        </button>
        <ComponentPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={addComponent}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {slots.length} component{slots.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isEditMode
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
              }`}
          >
            {isEditMode ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Done</span>
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                <span className="text-sm font-medium">Edit</span>
              </>
            )}
          </button>

          {/* Add Component */}
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add</span>
            <span className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold bg-white/20 text-white">BETA</span>
          </button>
        </div>
      </div>

      {/* Component Grid - uses react-grid-layout for drag-and-drop in edit mode */}
      <div className="react-grid-wrapper w-full min-w-0" style={{ minHeight: 400 }}>
        <GridLayoutWithWidth
          className="layout"
          layout={layoutItems}
          onLayoutChange={handleLayoutChange}
          cols={cols}
          rowHeight={80}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          compactType="vertical"
          draggableHandle=".drag-handle"
          measureBeforeMount
        >
          {slots.map((slot) => {
            const Component = getComponent(slot.type);
            const size = layoutState[slot.id] || "medium";

            return (
              <div
                key={slot.id}
                className={`relative group card-premium overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col ${isEditMode ? "ring-2 ring-primary/30" : ""}`}
              >
                {/* Component Header */}
                <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2">
                  <div className={`flex items-center gap-2 ${isEditMode ? "drag-handle cursor-grab active:cursor-grabbing" : ""}`}>
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{slot.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Size Toggle */}
                    <button
                      type="button"
                      onClick={() => cycleSize(slot.id)}
                      className="p-1.5 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      title={`Size: ${size}`}
                    >
                      {size === "full" ? (
                        <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>

                    {/* Delete (Edit Mode Only) */}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="p-1.5 rounded bg-destructive/10 hover:bg-destructive/20 transition-colors"
                        title="Remove component"
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Component Content */}
                <div className="flex-1 min-h-0 overflow-auto p-3">
                  <ErrorBoundary componentName={slot.type}>
                    {Component ? (
                      <Component {...(slot.props ?? {})} />
                    ) : (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        <p className="font-medium">Unknown component</p>
                        <p className="text-xs mt-1 opacity-70">{slot.type}</p>
                      </div>
                    )}
                  </ErrorBoundary>
                </div>
              </div>
            );
          })}
        </GridLayoutWithWidth>
      </div>

      {/* Component Picker Modal */}
      <ComponentPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addComponent}
      />
    </motion.div>
  );
}
