import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MapPin, Calendar, Hash, Share2, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Incident } from "@/lib/incidents";
import { Footer } from "@/components/landing/footer";

const gradients: Record<Incident["category"], string> = {
    Historical: "from-[#5c3420] via-[#6b3d24] to-[#3a2013]",
    "Unsolved Crime": "from-[#4a2418] via-[#5c2e1c] to-[#2c150d]",
    Paranormal: "from-[#3c2a1a] via-[#4a3320] to-[#241a10]",
};

const statusLabel: Record<Incident["category"], string> = {
    Historical: "ARCHIVED",
    "Unsolved Crime": "UNSOLVED",
    Paranormal: "UNEXPLAINED",
};

function toIncident(row: any): Incident {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        category: "Unsolved Crime",
        location: row.country,
        date: row.event_date
            ? new Date(row.event_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "Date unknown",
        views: row.popularity_score ?? 0,
    };
}

export default async function CaseDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: row, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !row) {
        notFound();
    }

    const incident = toIncident(row);

    const { data: relatedRows } = await supabase
        .from("cases")
        .select("*")
        .eq("country", row.country)
        .neq("id", id)
        .limit(3);

    const related: Incident[] = (relatedRows ?? []).map(toIncident);
    const fileNumber = incident.id.slice(0, 8).toUpperCase();

    return (
        <main>
            {/* Hero / case banner */}
            <section
                className={`relative overflow-hidden bg-gradient-to-br ${gradients[incident.category]}`}
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay field-grid"
                    style={{ backgroundSize: "18px 18px" }}
                />

                <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-12 md:px-10">
                    <Link
                        href={`/discover?country=${encodeURIComponent(incident.location)}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                        Back to Mysteries of {incident.location}
                    </Link>

                    <div className="mt-10 flex flex-wrap items-start justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">
                                <Hash className="h-3 w-3" strokeWidth={2} />
                                File No. {fileNumber}
                            </div>

                            <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
                                {incident.title}
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    {incident.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    {incident.date}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                                    {incident.views.toLocaleString()} views
                                </span>
                            </div>
                        </div>

                        {/* Signature element: rubber-stamp status badge */}
                        <div
                            className="pointer-events-none mt-2 shrink-0 -rotate-6 rounded-md border-[3px] border-white/40 px-4 py-2 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/50 mix-blend-screen"
                            style={{ fontFamily: "'Courier New', monospace" }}
                        >
                            {statusLabel[incident.category]}
                            <div className="text-[9px] font-normal tracking-[0.15em] text-white/40">
                                case status
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Body */}
            <section className="mx-auto max-w-5xl px-6 py-14 md:px-10">
                <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                    {/* Narrative */}
                    <article className="rounded-[1.75rem] border border-white/40 bg-white/30 p-8 shadow-lg shadow-black/5 backdrop-blur-xl md:p-10">
                        <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
                            {incident.category}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight">
                            Case Summary
                        </h2>
                        <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/80">
                            {incident.description
                                .split(/\n+/)
                                .filter(Boolean)
                                .map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="rounded-[1.75rem] border border-white/40 bg-white/30 p-6 shadow-lg shadow-black/5 backdrop-blur-xl">
                            <h3 className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                                Quick Facts
                            </h3>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between border-b border-white/40 pb-3">
                                    <dt className="text-muted-foreground">Category</dt>
                                    <dd className="font-medium">{incident.category}</dd>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/40 pb-3">
                                    <dt className="text-muted-foreground">Location</dt>
                                    <dd className="font-medium">{incident.location}</dd>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/40 pb-3">
                                    <dt className="text-muted-foreground">Date</dt>
                                    <dd className="font-medium">{incident.date}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-muted-foreground">File No.</dt>
                                    <dd className="font-mono font-medium">{fileNumber}</dd>
                                </div>
                            </dl>

                            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/40 px-4 py-2.5 text-sm font-medium text-foreground/80 backdrop-blur-xl transition-colors hover:text-foreground">
                                <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                Share this case
                            </button>
                            {row.source_url && (
                                <a
                                    href={row.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/40 px-4 py-2.5 text-sm font-medium text-foreground/80 backdrop-blur-xl transition-colors hover:bg-white/60 hover:text-foreground"
                                >
                                    Source
                                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </a>
                            )}
                        </div>
                    </aside>
                </div>

                {/* Related cases */}
                {related.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-lg font-semibold tracking-tight">
                            More from {incident.location}
                        </h3>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/case/${r.id}`}
                                    className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-white/40 bg-white/30 shadow-md shadow-black/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/25"
                                >
                                    <div
                                        className={`h-28 bg-gradient-to-br ${gradients[r.category]}`}
                                    />
                                    <div className="p-5">
                                        <p className="line-clamp-2 text-sm font-medium leading-snug">
                                            {r.title}
                                        </p>
                                        <span className="mt-2 inline-block text-xs text-primary">
                                            Read the case →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}