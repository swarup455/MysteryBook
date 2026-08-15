export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Atmospheric signature: faint radar rings + coordinate grid, kept quiet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 field-grid opacity-[0.35]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-8 h-[560px] w-[560px] -translate-x-1/2 md:top-0"
      >
        <div className="absolute inset-0 rounded-full border border-primary/[0.08]" />
        <div className="absolute inset-[15%] rounded-full border border-primary/[0.07] animate-spin-slow" />
        <div className="absolute inset-[32%] rounded-full border border-primary/[0.09]" />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 animate-pulse-soft" />
        <span className="absolute left-[18%] top-[22%] text-[9px] tracking-widest text-primary/25">
          51.5N
        </span>
        <span className="absolute bottom-[18%] right-[16%] text-[9px] tracking-widest text-primary/25">
          0.1W
        </span>
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-24 text-center md:pt-36">
        <span className="inline-flex items-center rounded-full border border-white/50 bg-white/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.28em] text-primary shadow-sm shadow-black/5 backdrop-blur-xl">
          The Archive of the Unknown
        </span>

        <h1 className="mt-8 text-balance text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
          Some stories were never meant to be solved.
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
          Discover the world&apos;s most fascinating mysteries, unsolved
          crimes, paranormal events and unexplained phenomena.
        </p>
      </div>
    </section>
  );
}