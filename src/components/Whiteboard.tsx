import { useRef, useState, useEffect } from "react";

interface WhiteboardProps {
    title?: string;
}

export function Whiteboard({ title = "Whiteboard" }: WhiteboardProps): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#3b82f6");
    const [brushSize, setBrushSize] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
    }, [color, brushSize]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ("touches" in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ("touches" in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const saveImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "whiteboard.png";
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="flex h-[600px] flex-col rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-sm">{title}</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                    />
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-24 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                        onClick={clearCanvas}
                        className="rounded px-3 py-1 text-xs font-medium border border-border hover:bg-muted"
                    >
                        Clear
                    </button>
                    <button
                        onClick={saveImage}
                        className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Save
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white relative cursor-crosshair overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={600}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
