import { useEffect, useRef, useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover?: string;
}

interface MusicPlayerProps {
  title?: string;
}

// Default playlist with a sample track
const DEFAULT_TRACKS: Track[] = [
  {
    id: "1",
    title: "Chill Lofi Beats",
    artist: "Study Music",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
  },
  {
    id: "2",
    title: "Ambient Dreams",
    artist: "Relaxation",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
  },
  {
    id: "3",
    title: "Electronic Vibes",
    artist: "Focus Music",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop"
  }
];

export function MusicPlayer({ title = "Music Player" }: MusicPlayerProps): JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTrack = tracks[currentTrackIndex];

  // Load first track on mount
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = volume;
    }
  }, [currentTrack, volume]);

  // Update time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleNext);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleNext);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play().catch(() => { }), 100);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioRef.current!.currentTime = 0;
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play().catch(() => { }), 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock search - in production, this would call Spotify API
    if (searchQuery.trim()) {
      alert(`Search functionality would search for: "${searchQuery}"\n\nTo enable real Spotify search, you need to:\n1. Register a Spotify Developer App\n2. Get Client ID & Secret\n3. Implement OAuth flow\n4. Use Spotify Web API`);
    }
  };

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-border bg-gradient-to-b from-purple-900/20 to-black p-6 text-card-foreground shadow-2xl">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs, artists..."
            className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 pl-12 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm"
          />
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {/* Current Track Display */}
      <div className="mb-6 flex items-center gap-4 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          {currentTrack?.cover ? (
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="truncate text-lg font-semibold text-white">
            {currentTrack?.title || "No track selected"}
          </h4>
          <p className="truncate text-sm text-white/70">
            {currentTrack?.artist || "Unknown artist"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-purple-500 hover:accent-purple-400"
          style={{
            background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <div className="mt-2 flex justify-between text-xs text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          className="rounded-full p-2 text-white/80 transition-all hover:scale-110 hover:text-white"
          title="Previous"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-7 w-7 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-full p-2 text-white/80 transition-all hover:scale-110 hover:text-white"
          title="Next"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="mb-6 flex items-center gap-3">
        <svg className="h-5 w-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-purple-500"
          style={{
            background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <span className="text-xs text-white/60 w-10 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* Playlist */}
      <div className="rounded-lg bg-white/5 p-4 backdrop-blur-sm">
        <h4 className="mb-3 text-sm font-semibold text-white/90">Playlist</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredTracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setCurrentTrackIndex(tracks.indexOf(track));
                setIsPlaying(true);
                setTimeout(() => audioRef.current?.play().catch(() => { }), 100);
              }}
              className={`w-full rounded-lg p-3 text-left transition-all ${currentTrack?.id === track.id
                ? "bg-purple-500/30 text-white"
                : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gradient-to-br from-purple-400 to-pink-400">
                  {track.cover ? (
                    <img src={track.cover} alt={track.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="truncate text-xs opacity-70">{track.artist}</p>
                </div>
                {currentTrack?.id === track.id && isPlaying && (
                  <div className="flex gap-0.5">
                    <span className="h-3 w-0.5 animate-pulse bg-purple-400 rounded-full" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-3 w-0.5 animate-pulse bg-purple-400 rounded-full" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-3 w-0.5 animate-pulse bg-purple-400 rounded-full" style={{ animationDelay: "300ms" }}></span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
