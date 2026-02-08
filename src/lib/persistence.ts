// Data persistence and theme management
import { useEffect, useState } from "react";
import { WorkspaceType, THEMES, applyTheme } from "./themes";

const STORAGE_KEYS = {
    WORKSPACE: "flowdesk_workspace",
    THEME: "flowdesk_theme",
    COMPONENT_DATA: "flowdesk_component_data",
    WORKSPACE_TYPE: "flowdesk_workspace_type",
    THEME_OVERRIDE: "flowdesk_theme_override",
} as const;

export type Theme = "light" | "dark";

// Theme hook - Supports Light/Dark mode
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME);
        return (saved as Theme) || "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return { theme, toggleTheme };
}

// Workspace theme hook - NEW dynamic theming system
export function useWorkspaceTheme(currentMode: Theme = "light") {
    const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.WORKSPACE_TYPE);
        return (saved as WorkspaceType) || "default";
    });

    const [themeOverride, setThemeOverride] = useState<WorkspaceType | null>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME_OVERRIDE);
        return saved as WorkspaceType | null;
    });

    // Apply theme whenever it changes
    useEffect(() => {
        const activeType = themeOverride || workspaceType;
        const themeConfig = THEMES[activeType];
        applyTheme(themeConfig, currentMode === "dark");
        localStorage.setItem(STORAGE_KEYS.WORKSPACE_TYPE, workspaceType);
        if (themeOverride) {
            localStorage.setItem(STORAGE_KEYS.THEME_OVERRIDE, themeOverride);
        } else {
            localStorage.removeItem(STORAGE_KEYS.THEME_OVERRIDE);
        }
    }, [workspaceType, themeOverride, currentMode]);

    const updateWorkspaceType = (type: WorkspaceType) => {
        setWorkspaceType(type);
    };

    const overrideTheme = (type: WorkspaceType | null) => {
        setThemeOverride(type);
    };

    const activeTheme = themeOverride || workspaceType;

    return {
        workspaceType,
        activeTheme,
        themeOverride,
        updateWorkspaceType,
        overrideTheme,
        isOverridden: themeOverride !== null,
    };
}

// Auto-save hook
export function useAutoSave<T>(key: string, data: T, delay = 30000) {
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (error) {
                console.error("Failed to save data:", error);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [key, data, delay]);
}

// Workspace persistence
export interface WorkspaceData {
    slots: Array<{ type: string; props: Record<string, unknown> }>;
    layout?: Record<string, unknown>;
    timestamp: number;
}

export function saveWorkspace(data: WorkspaceData) {
    try {
        localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Failed to save workspace:", error);
        return false;
    }
}

export function loadWorkspace(): WorkspaceData | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error("Failed to load workspace:", error);
        return null;
    }
}

export function exportWorkspace(): string {
    const workspace = loadWorkspace();
    const componentData = localStorage.getItem(STORAGE_KEYS.COMPONENT_DATA);

    const exportData = {
        workspace,
        componentData: componentData ? JSON.parse(componentData) : {},
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
    };

    return JSON.stringify(exportData, null, 2);
}

export function importWorkspace(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString);

        if (data.workspace) {
            localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(data.workspace));
        }

        if (data.componentData) {
            localStorage.setItem(STORAGE_KEYS.COMPONENT_DATA, JSON.stringify(data.componentData));
        }

        return true;
    } catch (error) {
        console.error("Failed to import workspace:", error);
        return false;
    }
}

export function downloadWorkspace() {
    const data = exportWorkspace();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowdesk-workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Component data persistence
export function useComponentData<T>(componentKey: string, initialData: T) {
    const [data, setData] = useState<T>(() => {
        try {
            const allData = localStorage.getItem(STORAGE_KEYS.COMPONENT_DATA);
            if (allData) {
                const parsed = JSON.parse(allData);
                return parsed[componentKey] || initialData;
            }
        } catch (error) {
            console.error("Failed to load component data:", error);
        }
        return initialData;
    });

    useAutoSave(STORAGE_KEYS.COMPONENT_DATA, {
        ...JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPONENT_DATA) || "{}"),
        [componentKey]: data,
    }, 5000);

    return [data, setData] as const;
}
