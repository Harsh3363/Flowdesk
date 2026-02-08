import { useState } from "react";

interface Job {
    id: string;
    company: string;
    position: string;
    status: "applied" | "interview" | "offer" | "rejected";
    dateApplied: string;
    notes?: string;
}

interface JobTrackerProps {
    title?: string;
}

export function JobTracker({ title = "Job Tracker" }: JobTrackerProps): JSX.Element {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState<Job["status"]>("applied");
    const [notes, setNotes] = useState("");
    const [filter, setFilter] = useState<Job["status"] | "all">("all");

    const handleAddJob = (e: React.FormEvent) => {
        e.preventDefault();
        if (!company.trim() || !position.trim()) return;

        const newJob: Job = {
            id: Date.now().toString(),
            company: company.trim(),
            position: position.trim(),
            status,
            dateApplied: new Date().toISOString().split("T")[0],
            notes: notes.trim() || undefined,
        };

        setJobs([newJob, ...jobs]);
        setCompany("");
        setPosition("");
        setStatus("applied");
        setNotes("");
    };

    const handleDeleteJob = (id: string) => {
        setJobs(jobs.filter((job) => job.id !== id));
    };

    const handleUpdateStatus = (id: string, newStatus: Job["status"]) => {
        setJobs(jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job)));
    };

    const filteredJobs = filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

    const statusColors = {
        applied: "bg-blue-500/20 text-blue-700 border-blue-500/30",
        interview: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
        offer: "bg-green-500/20 text-green-700 border-green-500/30",
        rejected: "bg-red-500/20 text-red-700 border-red-500/30",
    };

    const stats = {
        applied: jobs.filter((j) => j.status === "applied").length,
        interview: jobs.filter((j) => j.status === "interview").length,
        offer: jobs.filter((j) => j.status === "offer").length,
        rejected: jobs.filter((j) => j.status === "rejected").length,
    };

    return (
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                    {jobs.length} {jobs.length === 1 ? "application" : "applications"}
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-4 gap-3">
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{stats.applied}</div>
                    <div className="text-xs text-blue-600">Applied</div>
                </div>
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{stats.interview}</div>
                    <div className="text-xs text-yellow-600">Interview</div>
                </div>
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{stats.offer}</div>
                    <div className="text-xs text-green-600">Offers</div>
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center">
                    <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                    <div className="text-xs text-red-600">Rejected</div>
                </div>
            </div>

            {/* Add Job Form */}
            <form onSubmit={handleAddJob} className="mb-6 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company name"
                        className="rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Position"
                        className="rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Job["status"])}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                </select>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                    type="submit"
                    className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Add Application
                </button>
            </form>

            {/* Filter */}
            <div className="mb-4 flex gap-2">
                {(["all", "applied", "interview", "offer", "rejected"] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${filter === f
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-foreground">{job.company}</h4>
                                    <p className="text-sm text-muted-foreground">{job.position}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                    title="Delete"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mb-2 flex items-center gap-2">
                                <span className={`rounded border px-2 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">{job.dateApplied}</span>
                            </div>
                            {job.notes && (
                                <p className="mb-2 text-xs text-muted-foreground">{job.notes}</p>
                            )}
                            <div className="flex gap-1">
                                {(["applied", "interview", "offer", "rejected"] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleUpdateStatus(job.id, s)}
                                        disabled={job.status === s}
                                        className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80 disabled:opacity-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {filter === "all" ? "No applications yet" : `No ${filter} applications`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
