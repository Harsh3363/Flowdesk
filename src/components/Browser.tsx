import { useState } from "react";
import { ExternalLink, AlertCircle } from "lucide-react";

interface BrowserProps {
    title?: string;
    initialUrl?: string;
}

export function Browser({ title = "Browser", initialUrl = "https://www.google.com/search?igu=1" }: BrowserProps): JSX.Element {
    const [url, setUrl] = useState(initialUrl);
    const [iframeUrl, setIframeUrl] = useState(initialUrl);
    const [showFallback, setShowFallback] = useState(false);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        let target = url.trim();
        if (!target.startsWith("http")) {
            target = `https://${target}`;
        }
        setIframeUrl(target);
        setUrl(target);
        setShowFallback(false); // Reset fallback when navigating
    };

    const handleOpenInNewTab = () => {
        window.open(iframeUrl, '_blank', 'noopener,noreferrer');
    };

    // Check if URL is likely to be blocked
    const isLikelyBlocked = (urlString: string) => {
        const blockedDomains = ['linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'github.com'];
        return blockedDomains.some(domain => urlString.includes(domain));
    };

    return (
        <div className="flex h-[600px] flex-col rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1 mr-2">
                    <button className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        onClick={() => setIframeUrl(url)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>

                <form onSubmit={handleNavigate} className="flex-1">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Search or enter URL..."
                    />
                </form>

                <button
                    onClick={handleOpenInNewTab}
                    className="p-1 hover:bg-muted rounded text-muted-foreground"
                    title="Open in new tab"
                >
                    <ExternalLink className="w-4 h-4" />
                </button>

                <div className="text-xs font-medium text-muted-foreground px-2">FlowBrowser</div>
            </div>

            <div className="flex-1 bg-background relative">
                {showFallback || isLikelyBlocked(iframeUrl) ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="max-w-md text-center space-y-4">
                            <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
                            <h3 className="text-lg font-semibold text-foreground">Can't Display This Page</h3>
                            <p className="text-sm text-muted-foreground">
                                This website blocks embedding for security reasons. Many sites like LinkedIn, Facebook, and GitHub prevent being shown in iframes.
                            </p>
                            <button
                                onClick={handleOpenInNewTab}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open in New Tab
                            </button>
                            <p className="text-xs text-muted-foreground mt-4">
                                💡 Tip: Try YouTube, Wikipedia, or Google - they work great in the browser!
                            </p>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={iframeUrl}
                        title={title}
                        className="w-full h-full border-none"
                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                        onError={() => setShowFallback(true)}
                    />
                )}
            </div>
        </div>
    );
}
