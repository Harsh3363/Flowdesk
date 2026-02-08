import { useState } from "react";

interface YouTubePlayerProps {
  title?: string;
  url?: string;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ??
    trimmed.match(/^([a-zA-Z0-9_-]{11})$/);
  return match ? match[1] : null;
}

export function YouTubePlayer({
  title = "YouTube",
  url: initialUrl = "https://www.youtube.com/watch?v=eKbU94LT2PA",
}: YouTubePlayerProps): JSX.Element {
  const [pastedUrl, setPastedUrl] = useState("");
  const url = pastedUrl || initialUrl;
  const videoId = url ? getYouTubeVideoId(url) : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <input
        type="url"
        value={pastedUrl}
        onChange={(e) => setPastedUrl(e.target.value)}
        placeholder="Paste YouTube URL here"
        className="mb-3 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {videoId ? (
        <div className="aspect-video w-full overflow-hidden rounded border border-border">
          <iframe
            title={title}
            src={`https://www.youtube.com/embed/${videoId}`}
            className="h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : (
        <div className="rounded border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          <p>Paste a URL above to watch (e.g. https://www.youtube.com/watch?v=VIDEO_ID)</p>
        </div>
      )}
    </div>
  );
}
