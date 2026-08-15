import { ArrowRight, Bell, MessageSquareText } from "lucide-react";

export function FeaturedCase() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
      <div className="grid-cols-1 space-y-6 md:grid-cols-3">
        {/* Large featured case */}
        <a
          href="#"
          className="group relative col-span-2 flex min-h-[400px] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-white/30 p-9 shadow-lg shadow-black/10 md:p-11"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[#5c3420] via-[#6b3d24] to-[#3a2013]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 mix-blend-overlay field-grid"
            style={{ backgroundSize: "22px 22px" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
          />

          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-xl">
              Latest Entry
            </span>
            <h3 className="mt-5 text-3xl font-semibold text-white md:text-4xl">
              The Vanishing Hiker
            </h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
              In 2011, an experienced hiker vanished without a trace in the
              Pacific Northwest. No clues. No footprints. Just questions.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white transition-transform duration-200 group-hover:translate-x-1">
              Read the case
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </a>

        {/* Side cards */}
        <div className="flex flex-col md:flex-row gap-6">
          <a
            href="#"
            className="flex flex-1 flex-col justify-between rounded-[1.75rem] border border-white/40 bg-white/30 p-8 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25"
          >
            <MessageSquareText
              className="h-5 w-5 text-primary"
              strokeWidth={1.75}
            />
            <div>
              <h4 className="text-lg font-medium">Submit a Theory</h4>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                Connect the dots on active cases.
              </p>
            </div>
          </a>

          <a
            href="#"
            className="flex flex-1 flex-col justify-between rounded-[1.75rem] border border-white/40 bg-white/40 p-8 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25"
          >
            <Bell className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <div>
              <h4 className="text-lg font-medium">Signal Alerts</h4>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                Get notified when new evidence surfaces in followed cases.
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}