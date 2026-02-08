import { useState } from "react";

interface PDFViewerProps {
    title?: string;
    url?: string;
}

export function PDFViewer({
    title = "PDF Viewer",
    url: initialUrl,
}: PDFViewerProps): JSX.Element {
    const [pdfUrl, setPdfUrl] = useState(initialUrl || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setCurrentPage(1);
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex h-[600px] flex-col rounded-lg border border-border bg-card text-card-foreground shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold">{title}</h3>
                </div>

                {pdfUrl && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setZoom(Math.max(50, zoom - 10))}
                            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            title="Zoom Out"
                        >
                            -
                        </button>
                        <span className="text-xs text-muted-foreground">{zoom}%</span>
                        <button
                            type="button"
                            onClick={() => setZoom(Math.min(200, zoom + 10))}
                            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            title="Zoom In"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="border-b border-border bg-muted/30 px-4 py-3">
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <input
                        type="url"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        placeholder="Enter PDF URL or upload a file..."
                        className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <label className="cursor-pointer rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Upload
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </form>
            </div>

            {/* PDF Display */}
            <div className="flex-1 overflow-auto bg-muted/20 p-4">
                {pdfUrl ? (
                    <div className="mx-auto" style={{ width: `${zoom}%` }}>
                        <iframe
                            src={`${pdfUrl}#page=${currentPage}`}
                            className="h-[500px] w-full rounded border border-border bg-white shadow-lg"
                            title={title}
                        />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-16 w-16 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-4 text-sm text-muted-foreground">No PDF loaded</p>
                            <p className="mt-1 text-xs text-muted-foreground">Upload a file or enter a URL above</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {pdfUrl && (
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </button>
                        <span className="text-xs text-muted-foreground">Page {currentPage}</span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Next
                        </button>
                    </div>
                    <a
                        href={pdfUrl}
                        download
                        className="text-xs text-primary hover:underline"
                    >
                        Download PDF
                    </a>
                </div>
            )}
        </div>
    );
}
