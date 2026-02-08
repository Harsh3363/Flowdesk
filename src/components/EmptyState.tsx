import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Inbox, FileText, LayoutGrid, Plus } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: "inbox" | "file" | "grid" | "custom";
    customIcon?: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const iconMap = {
    inbox: Inbox,
    file: FileText,
    grid: LayoutGrid,
};

export function EmptyState({
    title,
    description,
    icon = "inbox",
    customIcon,
    action,
}: EmptyStateProps): JSX.Element {
    const IconComponent = iconMap[icon as keyof typeof iconMap];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
        >
            <div className="mb-4 rounded-full bg-muted/50 p-4">
                {customIcon || (IconComponent && <IconComponent className="h-8 w-8 text-muted-foreground" />)}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}
