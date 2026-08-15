import Link from "next/link";
import { ArrowRight, Eye, MapPin } from "lucide-react";
import type { Incident } from "@/lib/incidents";

const gradients: Record<Incident["category"], string> = {
  Historical: "from-[#5c3420] via-[#6b3d24] to-[#3a2013]",
  "Unsolved Crime": "from-[#4a2418] via-[#5c2e1c] to-[#2c150d]",
  Paranormal: "from-[#3c2a1a] via-[#4a3320] to-[#241a10]",
};

export function IncidentCard({
  incident,
}: {
  incident: Incident;
}) {
  const href = `/discover/${encodeURIComponent(
    incident.location
  )}/${encodeURIComponent(incident.id)}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/30 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
    >
      <div
        className={`relative h-48 shrink-0 overflow-hidden bg-gradient-to-br ${gradients[incident.category]}`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 mix-blend-overlay field-grid"
          style={{ backgroundSize: "18px 18px" }}
        />

        <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-xl">
          {incident.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 text-lg font-medium leading-snug">
          {incident.title}
        </h3>

        <p className="mt-2 line-clamp-3 min-h-[4.5rem] flex-1 text-sm leading-relaxed text-muted-foreground">
          {incident.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/40 pt-4 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{incident.location}</span>
          </span>

          <span className="ml-3 shrink-0">{incident.date}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            {incident.views.toLocaleString()} views
          </span>

          <span className="flex items-center gap-1.5 text-sm font-medium text-primary transition-transform duration-200 group-hover:translate-x-1">
            Read the case
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}