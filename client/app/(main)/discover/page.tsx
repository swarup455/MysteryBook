import Link from "next/link";
import { Home } from "lucide-react";
import { redirect } from "next/navigation";
import { SortBar } from "@/components/discover/sort-bar";
import { IncidentCard } from "@/components/discover/incident-card";
import { createClient } from "@/lib/supabase/server";
import type { Incident } from "@/lib/incidents";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

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

export default async function DiscoverPage({
    searchParams,
}: {
    searchParams: Promise<{ country?: string }>;
}) {
    const params = await searchParams;
    const country = params.country?.trim();

    if (!country) {
        redirect("/");
    }

    const supabase = await createClient();

    const { data: rows, error } = await supabase
        .from("cases")
        .select("*")
        .eq("country", country)
        .order("popularity_score", { ascending: false });

    if (error) {
        console.error("Failed to fetch cases:", error);
    }

    const incidents: Incident[] = (rows ?? []).map(toIncident);

    return (
        <main>
            <Navbar />
            <section className="relative overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 field-grid opacity-[0.35]"
                />

                <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 md:px-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm shadow-black/5 backdrop-blur-xl transition-colors hover:text-foreground"
                    >
                        <Home className="h-4 w-4" strokeWidth={1.75} />
                        Home
                    </Link>

                    <p className="mt-8 text-xs font-medium uppercase tracking-[0.28em] text-primary">
                        Case Files
                    </p>

                    <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                        Mysteries of {country}
                    </h1>

                    <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
                        Every documented case, sighting and disappearance on record for
                        this region.
                    </p>
                </div>
            </section>
            <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
                <div className="mb-8">
                    <SortBar count={incidents.length} />
                </div>

                {incidents.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-lg font-medium">
                            No cases found for {country}.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Try selecting another country.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {incidents.map((incident) => (
                            <IncidentCard key={incident.id} incident={incident} />
                        ))}
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}