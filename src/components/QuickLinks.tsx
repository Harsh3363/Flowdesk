import { useState } from "react";
import { useComponentData } from "../lib/persistence";

interface Link {
    id: string;
    title: string;
    url: string;
    category: string;
}

export function QuickLinks({ title = "Quick Links" }) {
    const [links, setLinks] = useComponentData<Link[]>("quicklinks", []);
    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [category, setCategory] = useState("General");

    const addLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newUrl.trim()) return;

        const link: Link = {
            id: Date.now().toString(),
            title: newTitle.trim(),
            url: newUrl.trim(),
            category,
        };

        setLinks([...links, link]);
        setNewTitle("");
        setNewUrl("");
    };

    const deleteLink = (id: string) => {
        setLinks(links.filter((l) => l.id !== id));
    };

    const categories = ["General", "Work", "Learning", "Social", "Tools"];
    const groupedLinks = categories.map(cat => ({
        category: cat,
        links: links.filter(l => l.category === cat)
    })).filter(g => g.links.length > 0);

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
            <h3 className="font-semibold mb-4">{title}</h3>

            <form onSubmit={addLink} className="mb-4 space-y-2">
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Link title..."
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Add
                    </button>
                </div>
            </form>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {groupedLinks.length > 0 ? (
                    groupedLinks.map(group => (
                        <div key={group.category}>
                            <div className="text-xs font-semibold text-muted-foreground mb-2">{group.category}</div>
                            <div className="space-y-2">
                                {group.links.map(link => (
                                    <div
                                        key={link.id}
                                        className="group flex items-center gap-2 rounded-lg border border-border bg-background p-2 hover:shadow-sm"
                                    >
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-sm hover:text-primary"
                                        >
                                            🔗 {link.title}
                                        </a>
                                        <button
                                            onClick={() => deleteLink(link.id)}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">No links yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
