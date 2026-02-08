import { useState, useEffect } from "react";

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    color: string;
}

interface NotesAppProps {
    title?: string;
}

const COLORS = [
    { name: "yellow", class: "bg-yellow-100 border-yellow-300" },
    { name: "pink", class: "bg-pink-100 border-pink-300" },
    { name: "blue", class: "bg-blue-100 border-blue-300" },
    { name: "green", class: "bg-green-100 border-green-300" },
    { name: "purple", class: "bg-purple-100 border-purple-300" },
];

export function NotesApp({ title = "Notes" }: NotesAppProps): JSX.Element {
    const [notes, setNotes] = useState<Note[]>(() => {
        try {
            const saved = localStorage.getItem("flowdesk_notes");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    // Persist notes to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("flowdesk_notes", JSON.stringify(notes));
        } catch { }
    }, [notes]);

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteTitle.trim() && !noteContent.trim()) return;

        const newNote: Note = {
            id: Date.now().toString(),
            title: noteTitle.trim() || "Untitled",
            content: noteContent.trim(),
            createdAt: new Date().toLocaleString(),
            color: selectedColor.class,
        };

        setNotes([newNote, ...notes]);
        setNoteTitle("");
        setNoteContent("");
    };

    const handleDeleteNote = (id: string) => {
        setNotes(notes.filter((note) => note.id !== id));
    };

    return (
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg">
            <div className="mb-6 flex items-center gap-2">
                <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-bold">{title}</h3>
                <span className="ml-auto text-sm text-muted-foreground">
                    {notes.length} {notes.length === 1 ? "note" : "notes"}
                </span>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-6 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Note content..."
                    rows={3}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Color:</span>
                    {COLORS.map((color) => (
                        <button
                            key={color.name}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`h-6 w-6 rounded-full border-2 ${color.class} ${selectedColor.name === color.name ? "ring-2 ring-primary ring-offset-2" : ""
                                }`}
                            title={color.name}
                        />
                    ))}
                </div>
                <button
                    type="submit"
                    className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Add Note
                </button>
            </form>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className={`group relative rounded-lg border-2 p-4 shadow-sm transition-all hover:shadow-md ${note.color}`}
                        >
                            <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="absolute right-2 top-2 rounded-full bg-white/80 p-1 opacity-0 shadow transition-opacity group-hover:opacity-100"
                                title="Delete note"
                            >
                                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h4 className="mb-2 font-semibold text-gray-800">{note.title}</h4>
                            <p className="mb-3 whitespace-pre-wrap text-sm text-gray-700">{note.content}</p>
                            <div className="text-xs text-gray-500">{note.createdAt}</div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                        <p className="text-sm text-muted-foreground">No notes yet. Create your first note above!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
