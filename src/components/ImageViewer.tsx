import { useState } from "react";

interface ImageViewerProps {
    title?: string;
    url?: string;
}

export function ImageViewer({
    title = "Image Viewer",
    url: initialUrl,
}: ImageViewerProps): JSX.Element {
    const [imageUrl, setImageUrl] = useState(initialUrl || "");
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setZoom(100);
            setRotation(0);
        }
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleReset = () => {
        setZoom(100);
        setRotation(0);
    };

    return (
        <div className="flex h-[600px] flex-col rounded-lg border border-border bg-card text-card-foreground shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-pink-500/10 to-orange-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold">{title}</h3>
                </div>

                {imageUrl && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setZoom(Math.max(25, zoom - 25))}
                            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            title="Zoom Out"
                        >
                            -
                        </button>
                        <span className="text-xs text-muted-foreground">{zoom}%</span>
                        <button
                            type="button"
                            onClick={() => setZoom(Math.min(400, zoom + 25))}
                            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            title="Zoom In"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            onClick={handleRotate}
                            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            title="Rotate"
                        >
                            ↻
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            title="Reset"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="border-b border-border bg-muted/30 px-4 py-3">
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Enter image URL or upload a file..."
                        className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <label className="cursor-pointer rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Upload
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Image Display */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-muted/40 p-4">
                {imageUrl ? (
                    <div className="flex h-full items-center justify-center">
                        <img
                            src={imageUrl}
                            alt="Uploaded content"
                            className="max-h-full rounded shadow-2xl transition-transform duration-300"
                            style={{
                                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                objectFit: "contain",
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-16 w-16 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-4 text-sm text-muted-foreground">No image loaded</p>
                            <p className="mt-1 text-xs text-muted-foreground">Upload a file or enter a URL above</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {imageUrl && (
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
                    <div className="text-xs text-muted-foreground">
                        Zoom: {zoom}% | Rotation: {rotation}°
                    </div>
                    <a
                        href={imageUrl}
                        download
                        className="text-xs text-primary hover:underline"
                    >
                        Download Image
                    </a>
                </div>
            )}
        </div>
    );
}
