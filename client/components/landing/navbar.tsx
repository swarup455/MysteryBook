const links = ["Explore", "Categories", "About"];

export function Navbar() {
  return (
    <div className="sticky top-4 z-50 px-4 md:px-6">
      <header className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/40 bg-white/40 px-6 py-5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <span className="text-sm font-semibold tracking-[0.2em]">
          MYSTERY BOOK
        </span>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link, i) => (
            <a
              key={link}
              href="#"
              className={
                i === 0
                  ? "text-sm font-medium text-primary"
                  : "text-sm text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {link}
            </a>
          ))}
        </nav>
      </header>
    </div>
  );
}