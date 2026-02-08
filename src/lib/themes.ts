/**
 * Dynamic theming system for FlowDesk
 * Themes automatically adapt based on workspace type
 */

export type WorkspaceType =
    | "coding"
    | "finance"
    | "productivity"
    | "creative"
    | "relaxation"
    | "default";

export interface ThemeColors {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
    gradientStart: string;
    gradientEnd: string;
}

export interface ThemeConfig {
    name: string;
    type: WorkspaceType;
    description: string;
    colors: ThemeColors;
    darkColors?: ThemeColors;
}

export const THEMES: Record<WorkspaceType, ThemeConfig> = {
    default: {
        name: "Default",
        type: "default",
        description: "Clean and professional light theme",
        colors: {
            background: "250, 250, 252",
            foreground: "15, 15, 20",
            card: "255, 255, 255",
            cardForeground: "15, 15, 20",
            primary: "99, 102, 241",
            primaryForeground: "255, 255, 255",
            secondary: "241, 245, 249",
            secondaryForeground: "15, 23, 42",
            muted: "241, 245, 249",
            mutedForeground: "100, 116, 139",
            accent: "236, 72, 153",
            accentForeground: "255, 255, 255",
            border: "226, 232, 240",
            input: "226, 232, 240",
            ring: "99, 102, 241",
            destructive: "239, 68, 68",
            destructiveForeground: "255, 255, 255",
            gradientStart: "139, 92, 246",
            gradientEnd: "236, 72, 153",
        },
        darkColors: {
            background: "15, 23, 42", // Slate 900
            foreground: "248, 250, 252", // Slate 50
            card: "30, 41, 59", // Slate 800
            cardForeground: "248, 250, 252",
            primary: "129, 140, 248", // Indigo 400
            primaryForeground: "255, 255, 255",
            secondary: "30, 41, 59",
            secondaryForeground: "248, 250, 252",
            muted: "30, 41, 59",
            mutedForeground: "148, 163, 184",
            accent: "244, 114, 182", // Pink 400
            accentForeground: "255, 255, 255",
            border: "51, 65, 85", // Slate 700
            input: "51, 65, 85",
            ring: "129, 140, 248",
            destructive: "248, 113, 113",
            destructiveForeground: "255, 255, 255",
            gradientStart: "129, 140, 248",
            gradientEnd: "244, 114, 182",
        }
    },
    coding: {
        name: "Coding",
        type: "coding",
        description: "Cool blues and purples for focused development",
        colors: {
            background: "245, 247, 255",
            foreground: "15, 23, 42",
            card: "255, 255, 255",
            cardForeground: "15, 23, 42",
            primary: "59, 130, 246", // Blue
            primaryForeground: "255, 255, 255",
            secondary: "238, 242, 255",
            secondaryForeground: "30, 58, 138",
            muted: "241, 245, 249",
            mutedForeground: "71, 85, 105",
            accent: "139, 92, 246", // Purple
            accentForeground: "255, 255, 255",
            border: "219, 234, 254",
            input: "219, 234, 254",
            ring: "59, 130, 246",
            destructive: "239, 68, 68",
            destructiveForeground: "255, 255, 255",
            gradientStart: "59, 130, 246",
            gradientEnd: "139, 92, 246",
        },
        darkColors: {
            background: "10, 10, 12", // Very dark blue/black
            foreground: "226, 232, 240",
            card: "17, 24, 39", // Gray 900
            cardForeground: "226, 232, 240",
            primary: "96, 165, 250", // Blue 400
            primaryForeground: "255, 255, 255",
            secondary: "30, 41, 59",
            secondaryForeground: "226, 232, 240",
            muted: "30, 41, 59",
            mutedForeground: "148, 163, 184",
            accent: "167, 139, 250", // Purple 400
            accentForeground: "255, 255, 255",
            border: "31, 41, 55",
            input: "31, 41, 55",
            ring: "96, 165, 250",
            destructive: "248, 113, 113",
            destructiveForeground: "255, 255, 255",
            gradientStart: "96, 165, 250",
            gradientEnd: "167, 139, 250",
        }
    },
    finance: {
        name: "Finance",
        type: "finance",
        description: "Professional greens and golds for business",
        colors: {
            background: "247, 254, 247",
            foreground: "20, 83, 45",
            card: "255, 255, 255",
            cardForeground: "20, 83, 45",
            primary: "34, 197, 94", // Green
            primaryForeground: "255, 255, 255",
            secondary: "240, 253, 244",
            secondaryForeground: "22, 101, 52",
            muted: "243, 244, 246",
            mutedForeground: "75, 85, 99",
            accent: "234, 179, 8", // Gold
            accentForeground: "255, 255, 255",
            border: "220, 252, 231",
            input: "220, 252, 231",
            ring: "34, 197, 94",
            destructive: "239, 68, 68",
            destructiveForeground: "255, 255, 255",
            gradientStart: "34, 197, 94",
            gradientEnd: "234, 179, 8",
        },
        darkColors: {
            background: "2, 44, 34", // Green 950
            foreground: "240, 253, 244",
            card: "6, 78, 59", // Green 900
            cardForeground: "240, 253, 244",
            primary: "74, 222, 128", // Green 400
            primaryForeground: "6, 78, 59",
            secondary: "6, 78, 59",
            secondaryForeground: "240, 253, 244",
            muted: "20, 83, 45",
            mutedForeground: "167, 243, 208", // Green 200
            accent: "250, 204, 21", // Yellow 400
            accentForeground: "2, 44, 34",
            border: "20, 83, 45",
            input: "20, 83, 45",
            ring: "74, 222, 128",
            destructive: "248, 113, 113",
            destructiveForeground: "255, 255, 255",
            gradientStart: "74, 222, 128",
            gradientEnd: "250, 204, 21",
        }
    },
    productivity: {
        name: "Productivity",
        type: "productivity",
        description: "Energetic oranges and reds for motivation",
        colors: {
            background: "255, 247, 242",
            foreground: "124, 45, 18",
            card: "255, 255, 255",
            cardForeground: "124, 45, 18",
            primary: "249, 115, 22", // Orange
            primaryForeground: "255, 255, 255",
            secondary: "254, 243, 237",
            secondaryForeground: "154, 52, 18",
            muted: "250, 250, 249",
            mutedForeground: "120, 113, 108",
            accent: "239, 68, 68", // Red
            accentForeground: "255, 255, 255",
            border: "254, 215, 170",
            input: "254, 215, 170",
            ring: "249, 115, 22",
            destructive: "220, 38, 38",
            destructiveForeground: "255, 255, 255",
            gradientStart: "249, 115, 22",
            gradientEnd: "239, 68, 68",
        },
        darkColors: {
            background: "67, 20, 7", // Orange 950
            foreground: "255, 237, 213",
            card: "124, 45, 18", // Orange 900
            cardForeground: "255, 237, 213",
            primary: "251, 146, 60", // Orange 400
            primaryForeground: "67, 20, 7",
            secondary: "124, 45, 18",
            secondaryForeground: "255, 237, 213",
            muted: "154, 52, 18",
            mutedForeground: "253, 186, 116",
            accent: "248, 113, 113", // Red 400
            accentForeground: "255, 255, 255",
            border: "154, 52, 18",
            input: "154, 52, 18",
            ring: "251, 146, 60",
            destructive: "248, 113, 113",
            destructiveForeground: "255, 255, 255",
            gradientStart: "251, 146, 60",
            gradientEnd: "248, 113, 113",
        }
    },
    creative: {
        name: "Creative",
        type: "creative",
        description: "Vibrant purples and pinks for inspiration",
        colors: {
            background: "253, 244, 255",
            foreground: "88, 28, 135",
            card: "255, 255, 255",
            cardForeground: "88, 28, 135",
            primary: "168, 85, 247", // Purple
            primaryForeground: "255, 255, 255",
            secondary: "250, 245, 255",
            secondaryForeground: "107, 33, 168",
            muted: "250, 250, 250",
            mutedForeground: "115, 115, 115",
            accent: "236, 72, 153", // Pink
            accentForeground: "255, 255, 255",
            border: "233, 213, 255",
            input: "233, 213, 255",
            ring: "168, 85, 247",
            destructive: "239, 68, 68",
            destructiveForeground: "255, 255, 255",
            gradientStart: "168, 85, 247",
            gradientEnd: "236, 72, 153",
        },
        darkColors: {
            background: "30, 5, 45", // Purple 950 equivalent (custom)
            foreground: "243, 232, 255",
            card: "59, 7, 100", // Purple 900
            cardForeground: "243, 232, 255",
            primary: "192, 132, 252", // Purple 400
            primaryForeground: "59, 7, 100",
            secondary: "59, 7, 100",
            secondaryForeground: "243, 232, 255",
            muted: "88, 28, 135",
            mutedForeground: "216, 180, 254",
            accent: "244, 114, 182", // Pink 400
            accentForeground: "59, 7, 100",
            border: "88, 28, 135",
            input: "88, 28, 135",
            ring: "192, 132, 252",
            destructive: "248, 113, 113",
            destructiveForeground: "255, 255, 255",
            gradientStart: "192, 132, 252",
            gradientEnd: "244, 114, 182",
        }
    },
    relaxation: {
        name: "Relaxation",
        type: "relaxation",
        description: "Soft pastels and earth tones for calm",
        colors: {
            background: "250, 250, 248",
            foreground: "68, 64, 60",
            card: "255, 255, 253",
            cardForeground: "68, 64, 60",
            primary: "132, 204, 22", // Soft green
            primaryForeground: "255, 255, 255",
            secondary: "245, 245, 244",
            secondaryForeground: "87, 83, 78",
            muted: "245, 245, 244",
            mutedForeground: "120, 113, 108",
            accent: "14, 165, 233", // Sky blue
            accentForeground: "255, 255, 255",
            border: "231, 229, 228",
            input: "231, 229, 228",
            ring: "132, 204, 22",
            destructive: "239, 68, 68",
            destructiveForeground: "255, 255, 255",
            gradientStart: "132, 204, 22",
            gradientEnd: "14, 165, 233",
        },
        darkColors: {
            background: "12, 10, 9", // Stone 950
            foreground: "245, 245, 244", // Stone 100
            card: "28, 25, 23", // Stone 900
            cardForeground: "245, 245, 244",
            primary: "163, 230, 53", // Lime 400
            primaryForeground: "28, 25, 23",
            secondary: "28, 25, 23",
            secondaryForeground: "231, 229, 228",
            muted: "41, 37, 36", // Stone 800
            mutedForeground: "168, 162, 158",
            accent: "56, 189, 248", // Sky 400
            accentForeground: "28, 25, 23",
            border: "41, 37, 36",
            input: "41, 37, 36",
            ring: "163, 230, 53",
            destructive: "248, 113, 113",
            destructiveForeground: "255, 255, 255",
            gradientStart: "163, 230, 53",
            gradientEnd: "56, 189, 248",
        }
    },
};

// Detect workspace type based on component composition
export function detectWorkspaceType(componentTypes: string[]): WorkspaceType {
    const types = new Set(componentTypes);

    // Coding workspace
    if (types.has("CodeEditor") || types.has("Terminal")) {
        return "coding";
    }

    // Finance workspace
    if (types.has("Spreadsheet") || types.has("ChartView") || types.has("MetricCard")) {
        return "finance";
    }

    // Productivity workspace
    if (types.has("TaskList") && types.has("NotesApp")) {
        return "productivity";
    }

    // Creative workspace
    if (types.has("Whiteboard") || types.has("RichTextEditor") || types.has("ImageViewer")) {
        return "creative";
    }

    // Relaxation workspace
    if (types.has("MusicPlayer") || types.has("PomodoroTimer")) {
        return "relaxation";
    }

    return "default";
}

// Apply theme to document
export function applyTheme(theme: ThemeConfig, isDark = false) {
    const root = document.documentElement;
    const colors = (isDark && theme.darkColors) ? theme.darkColors : theme.colors;

    Object.entries(colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
    });

    // Add theme class for additional styling
    // Preserve existing classes (like drag-active etc) but manage theme classes
    const currentClasses = Array.from(root.classList)
        .filter(c => !c.startsWith('theme-') && c !== 'dark');

    const newClasses = [
        ...currentClasses,
        `theme-${theme.type}`,
        ...(isDark ? ['dark'] : [])
    ];

    root.className = newClasses.join(' ');
}
