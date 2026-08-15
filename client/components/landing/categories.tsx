import { Compass, Eye, Fingerprint } from "lucide-react";

const categories = [
  {
    icon: Compass,
    title: "Historical Mysteries",
    description:
      "Lost civilizations, vanished explorers, and artifacts that defy conventional timelines.",
  },
  {
    icon: Fingerprint,
    title: "Unsolved Crimes",
    description:
      "Cold cases, cryptic ciphers, and disappearances that left behind more questions than answers.",
  },
  {
    icon: Eye,
    title: "Paranormal & Unexplained",
    description:
      "Sightings, encounters, and phenomena that challenge our understanding of reality.",
  },
];

export function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
      <div className="mb-12 flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Explore by Category
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group rounded-[1.75rem] border border-white/40 bg-white/30 p-8 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25 md:p-9"
          >
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/40 text-primary backdrop-blur-xl">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}