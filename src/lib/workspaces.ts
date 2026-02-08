// Workspace management with persistence
import { useState, useEffect } from "react";

export interface Workspace {
    id: string;
    name: string;
    slots: Array<{ type: string; props: Record<string, unknown> }>;
    createdAt: string;
}

const WORKSPACES_KEY = "flowdesk_workspaces";
const ACTIVE_WORKSPACE_KEY = "flowdesk_active_workspace";

export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
        try {
            const saved = localStorage.getItem(WORKSPACES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
        return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    });

    // Auto-save workspaces
    useEffect(() => {
        localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    }, [workspaces]);

    // Auto-save active workspace
    useEffect(() => {
        if (activeWorkspaceId) {
            localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeWorkspaceId);
        } else {
            localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        }
    }, [activeWorkspaceId]);

    const createWorkspace = (name: string, slots: Workspace["slots"]) => {
        const newWorkspace: Workspace = {
            id: Date.now().toString(),
            name,
            slots,
            createdAt: new Date().toISOString(),
        };
        setWorkspaces([...workspaces, newWorkspace]);
        setActiveWorkspaceId(newWorkspace.id);
        return newWorkspace;
    };

    const updateWorkspace = (id: string, slots: Workspace["slots"]) => {
        setWorkspaces(workspaces.map(w =>
            w.id === id ? { ...w, slots } : w
        ));
    };

    const deleteWorkspace = (id: string) => {
        const filtered = workspaces.filter(w => w.id !== id);
        setWorkspaces(filtered);

        if (activeWorkspaceId === id) {
            setActiveWorkspaceId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
        }
    };

    const switchWorkspace = (id: string) => {
        setActiveWorkspaceId(id);
    };

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

    return {
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        switchWorkspace,
    };
}
