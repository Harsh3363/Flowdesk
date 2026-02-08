import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Component error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-destructive mb-1">
                                {this.props.componentName
                                    ? `${this.props.componentName} failed to load`
                                    : "Something went wrong"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
