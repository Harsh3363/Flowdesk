import { useEffect, useMemo, useRef, useState } from "react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { components, tools } from "./lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { useTheme, useWorkspaceTheme } from "./lib/persistence";
import { THEMES, WorkspaceType } from "./lib/themes";
import { motion, AnimatePresence } from "framer-motion";
import { Command, MessageSquare, LayoutDashboard, Sun, Moon } from "lucide-react";
import { CommandPalette, useCommandPalette } from "./components/CommandPalette";
import { OnboardingTour } from "./components/OnboardingTour";

import { FlowDeskLayout, type Slot } from "./components/FlowDeskLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

const DEBUG_SLOTS = false; // set true to log slot extraction

/** True if this message could possibly contain FlowDeskLayout slots. */
function messageCanHaveSlots(m: {
  role?: string;
  tools?: unknown[];
  tool_calls?: unknown[];
  renderedComponent?: { props?: unknown };
  component?: { props?: unknown; componentName?: string };
  content?: unknown[];
}): boolean {
  if (m.role === "tool") return true;
  if (Array.isArray(m.tools) && m.tools.length > 0) return true;
  if (Array.isArray(m.tool_calls) && m.tool_calls.length > 0) return true;
  if (m.renderedComponent?.props != null) return true;
  if (m.component?.props != null) return true;
  if (m.component?.componentName === "FlowDeskLayout") return true;
  // Content may contain component block or tool result with slots
  if (Array.isArray(m.content)) {
    for (const part of m.content) {
      if (part && typeof part === "object") {
        const p = part as Record<string, unknown>;
        if (p.props && typeof p.props === "object" && Array.isArray((p.props as Record<string, unknown>).slots)) return true;
        if (p.type === "component" && (p.name === "FlowDeskLayout" || (p.props && (p.props as Record<string, unknown>).slots))) return true;
      }
    }
  }
  return false;
}

function extractSlotsFromMessage(
  msg: any | null | undefined
): Slot[] | null {
  if (!msg) return null;

  // Early exit: message has component shell but no usable data (Tambo often sends component: { componentName: "", props: null })
  const hasEmptyComponent = msg.component != null && (msg.component.props == null || msg.component.componentName === "");
  const hasNoTools = !(Array.isArray(msg.tools) && msg.tools.length > 0) && !(Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0);
  if (hasEmptyComponent && hasNoTools && !msg.renderedComponent?.props) {
    return null;
  }

  const allSlots: Slot[] = [];

  // PRIORITY 1: Check tools array first (Tambo SDK v0.71+ format)
  if (msg?.tools && Array.isArray(msg.tools) && msg.tools.length > 0) {
    for (const tool of msg.tools) {
      let foundSlots: Slot[] | null = null;
      if (tool.name === "show_component_FlowDeskLayout") {
        const input = tool.input || tool.arguments || tool.args || tool.parameters || tool.params;
        if (input?.slots && Array.isArray(input.slots)) {
          foundSlots = input.slots;
        }
      }
      const output = tool.output || tool.result || tool.response;
      if (!foundSlots && output?.component === "FlowDeskLayout" && output.props?.slots) {
        foundSlots = output.props.slots;
      }
      if (!foundSlots && output?.component?.props?.slots) {
        foundSlots = output.component.props.slots;
      }
      if (!foundSlots && output?.props?.slots) {
        foundSlots = output.props.slots;
      }

      if (foundSlots) {
        allSlots.push(...foundSlots);
        if (DEBUG_SLOTS) console.log("[DEBUG] Found slots in tool:", foundSlots);
      }
    }
  }

  // PRIORITY 2: Check tool_calls
  if (allSlots.length === 0 && msg?.tool_calls && Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      let foundSlots: Slot[] | null = null;
      // Check for function arguments if it's a direct call
      if (tc.function?.name === "show_component_FlowDeskLayout") {
        try {
          const args = typeof tc.function.arguments === "string"
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments;
          if (args?.slots && Array.isArray(args.slots)) {
            foundSlots = args.slots;
          }
        } catch { /* ignore parse error */ }
      }

      // Check results/outputs
      const result = tc.result || tc.response || tc.output || tc.function?.result;
      if (!foundSlots && result?.component === "FlowDeskLayout" && result.props?.slots) {
        foundSlots = result.props.slots;
      }

      if (foundSlots) {
        allSlots.push(...foundSlots);
      }
    }
  }

  if (allSlots.length === 0 && msg?.renderedComponent?.props?.slots) {
    allSlots.push(...msg.renderedComponent.props.slots);
  }
  if (allSlots.length === 0 && msg?.component?.props?.slots) {
    allSlots.push(...msg.component.props.slots);
  }

  if (allSlots.length === 0 && msg.role === "tool") {
    let contentItems: unknown[] = [];
    if (Array.isArray(msg.content)) {
      contentItems = msg.content.map((item: any) => (item && typeof item === "object" && "text" in item ? item.text : item));
    } else if (typeof msg.content === "string") {
      contentItems = [msg.content];
    } else if (msg.content) {
      contentItems = [msg.content];
    }
    for (const item of contentItems) {
      let toolResult = typeof item === "string" ? (() => { try { return JSON.parse(item); } catch { return null; } })() : item;
      if (toolResult?.component === "FlowDeskLayout" && toolResult?.props?.slots) {
        allSlots.push(...toolResult.props.slots);
      }
    }
  }

  let slots = allSlots.length > 0 ? allSlots : null;

  // PRIORITY 6: Check message.content for component block (API may put component in content)
  if (!slots && Array.isArray(msg.content)) {
    for (const part of msg.content) {
      if (part && typeof part === "object") {
        const p = part as Record<string, unknown>;
        const props = p.props as Record<string, unknown> | undefined;
        if (props?.slots && Array.isArray(props.slots)) {
          slots = props.slots;
          if (DEBUG_SLOTS) console.log("[DEBUG] Found slots in content part:", slots);
          break;
        }
        if (p.type === "component" && (p.name === "FlowDeskLayout" || p.componentName === "FlowDeskLayout") && props?.slots) {
          slots = props.slots as Slot[];
          break;
        }
      }
    }
  }

  if (!Array.isArray(slots)) return null;

  // Helper to generate ID if missing
  // use message ID as prefix to keep IDs stable across renders
  const msgId = msg?.id || "unknown";
  const ensureId = (slot: any, index: number): Slot => ({
    id: slot.id || `${msgId}-slot-${index}`,
    type: slot.type,
    props: slot.props || {}
  });

  const validSlots = slots
    .filter((s): s is Slot => s != null && typeof s === "object" && typeof (s as Slot).type === "string")
    .map((s, index) => ensureId(s, index));
  return validSlots.length > 0 ? validSlots : null;
}

function ChatInput(): JSX.Element {
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  const handleSend = () => {
    if (!value.trim() || isPending) return;
    submit();
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background to-transparent" data-tour="chat-input">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto max-w-3xl"
      >
        <div className="relative rounded-2xl border border-border bg-card shadow-luxe overflow-hidden" style={{ backgroundColor: 'rgb(var(--card))' }}>
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary animate-gradient" />

          <div className="flex gap-3 p-4">
            <div className="flex-1 relative">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='✨ Describe your vision... Try "Build a productivity dashboard" or "Create a finance tracker"'
                rows={1}
                data-gramm="false"
                data-enable-grammarly="false"
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ minHeight: '48px', maxHeight: '120px', color: 'rgb(var(--foreground))', backgroundColor: 'rgb(var(--background))' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>

            <motion.button
              type="button"
              onClick={handleSend}
              disabled={isPending || !value.trim()}
              className="self-end rounded-xl btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Building...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Send
                </>
              )}
            </motion.button>
          </div>

          {/* Helper text */}
          <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Ctrl+K</kbd>
              <span>for quick commands</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



type TabId = "chat" | "dashboard";

function ChatAndLayout(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const { thread } = useTamboThread();
  const { theme, toggleTheme } = useTheme();
  // Pass current theme to workspace theme hook so it applies correct colors
  const { workspaceType, activeTheme, overrideTheme, isOverridden } = useWorkspaceTheme(theme);
  const { isPending } = useTamboThreadInput();
  const commandPalette = useCommandPalette();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [dashboardSlots, setDashboardSlots] = useState<Slot[]>([]);
  const mergedMessageIds = useRef<Set<string>>(new Set());

  const messages = thread.messages ?? [];

  // Find the most recent message that actually has FlowDeskLayout slots (so dashboard shows the latest UI)
  const lastMessageWithSlots = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i] as any;
      if (!messageCanHaveSlots(m)) continue;
      const renderedComp = m?.renderedComponent;
      if (renderedComp?.props?.slots && Array.isArray(renderedComp.props.slots)) {
        return { message: m, slots: renderedComp.props.slots as Slot[] };
      }
      const slots = extractSlotsFromMessage(m);
      if (slots != null && slots.length > 0) {
        return { message: m, slots };
      }
    }
    return null;
  }, [messages]);

  const hasDashboard = dashboardSlots.length > 0;

  useEffect(() => {
    if (!lastMessageWithSlots?.message?.id) return;
    const { message, slots } = lastMessageWithSlots;
    if (mergedMessageIds.current.has(message.id)) return;

    mergedMessageIds.current.add(message.id);
    setDashboardSlots(slots);
    setActiveTab("dashboard");
  }, [lastMessageWithSlots]);



  const handleSlotsChange = (slots: Slot[]) => {
    setDashboardSlots(slots);
    // Theme detection removed to prevent re-render issues
    // Use the theme selector button in the header to change themes manually
  };

  const handleNavigate = (tab: TabId) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        onNavigate={handleNavigate}
        onToggleTheme={toggleTheme}
        currentTheme={theme}
      />

      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-card-foreground">
              FlowDesk – Generative UI Engine
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Describe what you want. The AI builds the UI. Press{" "}
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl+K</kbd>{" "}
              for commands.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Command Palette Button */}
            <button
              onClick={commandPalette.open}
              data-tour="command-palette"
              className="rounded-lg border border-border bg-background p-2 hover:bg-muted transition-colors"
              title="Command Palette (Ctrl+K)"
            >
              <Command className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-border bg-background p-2 hover:bg-muted transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Theme Selector Button */}
            <button
              onClick={() => setShowThemeSelector(true)}
              className="rounded-lg border border-border bg-background px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2"
              title="Change workspace theme"
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent" />
              <span className="text-xs font-medium text-foreground capitalize">{THEMES[activeTheme].name}</span>
              {isOverridden && (
                <span className="text-xs text-muted-foreground">(Manual)</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex gap-1 rounded-lg bg-muted/50 p-1" data-tour="tab-switcher">
          <motion.button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={
              activeTab === "chat"
                ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow flex items-center gap-1.5"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            }
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={
              activeTab === "dashboard"
                ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow flex items-center gap-1.5"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            }
            whileTap={{ scale: 0.98 }}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
            {isPending && (
              <span className="ml-1 inline-block h-2 w-2 animate-bounce rounded-full bg-primary"></span>
            )}
            {hasDashboard && !isPending && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs text-primary">1</span>
            )}
          </motion.button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col relative"
          >
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-3xl h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                      <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gradient">Welcome to FlowDesk</h2>
                    <p className="text-lg text-muted-foreground max-w-md">
                      Your AI-powered generative UI engine. Describe what you need, and watch it come to life.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                    {[
                      { icon: "💼", text: "Build a project management dashboard", color: "from-blue-500/10 to-cyan-500/10" },
                      { icon: "📊", text: "Create a data analytics workspace", color: "from-purple-500/10 to-pink-500/10" },
                      { icon: "✍️", text: "Design a content creation studio", color: "from-orange-500/10 to-red-500/10" },
                      { icon: "🎯", text: "Make a goal tracking system", color: "from-green-500/10 to-emerald-500/10" },
                    ].map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border border-border bg-gradient-to-br ${suggestion.color} hover:border-primary/50 transition-all text-left group hover-glow`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                            {suggestion.text}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {hasDashboard && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-3xl mb-6 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/10 to-accent/10 p-4 shadow-glow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <LayoutDashboard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            Your UI is ready! 🎉
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Switch to the dashboard tab to interact with your creation
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("dashboard")}
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          View →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="mx-auto max-w-3xl space-y-6">
                    {messages.map((m, idx) => {
                      const role = (m as { role?: string }).role ?? "assistant";
                      const isUser = role === "user";

                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser
                            ? "bg-gradient-to-br from-primary to-accent"
                            : "bg-gradient-to-br from-muted to-muted/50 border border-border"
                            }`}>
                            {isUser ? (
                              <span className="text-white text-sm font-semibold">U</span>
                            ) : (
                              <span className="text-xs">✨</span>
                            )}
                          </div>

                          {/* Message bubble */}
                          <div className={`flex-1 max-w-[85%] ${isUser
                            ? "rounded-2xl rounded-tr-md border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 px-4 py-3 text-sm shadow-sm"
                            : "rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm shadow-sm"
                            }`}>
                            {/* Render text content */}
                            {Array.isArray(m.content) &&
                              m.content.map((part, i) => {
                                if (part.type !== "text") return null;
                                if (typeof part.text !== "string") return null;
                                // Filter out JSON-like content but keep regular text (even if empty)
                                if (part.text.trim() && part.text.trim().startsWith("{")) return null;
                                return <p key={i} className="leading-relaxed text-foreground">{part.text || "(empty response)"}</p>;
                              })}
                          </div>
                        </motion.div>
                      );
                    })}

                    {isPending && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-border flex items-center justify-center">
                          <span className="text-xs">✨</span>
                        </div>
                        <div className="flex-1 max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-muted-foreground">AI is crafting your interface...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>
            <ChatInput />
          </motion.div>
        )}

        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto p-4"
          >
            <div className="mx-auto w-full max-w-6xl">
              {isPending ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-muted-foreground animate-pulse">Building your high-performance workspace...</p>
                </div>
              ) : dashboardSlots.length > 0 ? (
                <FlowDeskLayout
                  slots={dashboardSlots}
                  onSlotsChange={handleSlotsChange}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-muted/50 p-4">
                    <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No dashboard yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-4">
                    Ask the AI to build a UI, or launch a pre-built workspace template.
                  </p>
                  <button
                    onClick={commandPalette.open}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Command className="h-4 w-4" />
                    Open Command Palette
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {showThemeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowThemeSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl mx-4 rounded-xl border border-border bg-card shadow-luxe overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="text-xl font-semibold text-gradient">Workspace Themes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isOverridden
                    ? "Manual theme selected. Click 'Auto' to enable automatic detection."
                    : `Auto-detected: ${THEMES[workspaceType].name} theme based on your components`}
                </p>
              </div>

              <div className="p-6">
                {/* Auto/Manual Toggle */}
                <div className="mb-6 flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium text-sm">Automatic Theme Detection</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Theme changes based on your workspace components
                    </p>
                  </div>
                  <button
                    onClick={() => overrideTheme(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isOverridden
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-muted"
                      }`}
                  >
                    {!isOverridden ? "✓ Auto" : "Enable Auto"}
                  </button>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(Object.keys(THEMES) as WorkspaceType[]).map((themeType) => {
                    const themeConfig = THEMES[themeType];
                    const isActive = activeTheme === themeType;
                    const isDetected = workspaceType === themeType && !isOverridden;
                    // Use dark colors if in dark mode
                    const colors = (theme === 'dark' && themeConfig.darkColors)
                      ? themeConfig.darkColors
                      : themeConfig.colors;

                    return (
                      <motion.button
                        key={themeType}
                        onClick={() => overrideTheme(themeType)}
                        className={`p-4 rounded-xl border text-left transition-all ${isActive
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border bg-card hover:bg-muted/50 hover:border-primary/50"
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Color Preview */}
                        <div className="flex gap-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, rgb(${colors.gradientStart}), rgb(${colors.gradientEnd}))`
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">{themeConfig.name}</h4>
                              {isDetected && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">Auto</span>
                              )}
                              {isActive && isOverridden && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-accent/20 text-accent">Active</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {themeConfig.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
                <button
                  onClick={() => setShowThemeSelector(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <div>
      <TamboProvider
        apiKey={import.meta.env.VITE_TAMBO_API_KEY ?? ""}
        components={components}
        tools={tools}
      >
        <ErrorBoundary>
          <ChatAndLayout />
        </ErrorBoundary>
        {/* Debug overlay is now inside ChatAndLayout for access to state */}
      </TamboProvider>
    </div>
  );
}
