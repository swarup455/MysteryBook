import { ArrowRight } from "lucide-react";
import { FaGithub as Github, FaInstagram as Instagram, FaTwitter as Twitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const columns = [
  {
    title: "Explore",
    links: ["Historical Mysteries", "Unsolved Crimes", "Paranormal", "Latest Entries"],
  },
  {
    title: "Archive",
    links: ["Submit a Theory", "Signal Alerts", "Case Index", "Contributors"],
  },
  {
    title: "Company",
    links: ["About", "Privacy Policy", "Terms of Service", "Contact"],
  },
];

export function Footer() {
  return (
    <footer className="px-4 pb-6 md:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/40 bg-white/30 p-8 shadow-lg shadow-black/5 backdrop-blur-xl md:p-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="text-base font-semibold tracking-[0.2em]">
              MYSTERY BOOK
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A quiet archive for the unexplained — cases, theories and
              signals from every corner of the record.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Input
                placeholder="Your email"
                className="h-11 rounded-full border-white/50 bg-white/40 backdrop-blur-xl"
              />
              <Button size="icon" className="h-11 w-11 shrink-0 rounded-full">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              New cases, once a week. No noise.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/40 pt-8 md:flex-row md:justify-between">
          <span className="text-xs text-muted-foreground">
            © 2024 Mystery Book. All rights reserved.
          </span>

          <div className="flex items-center gap-3">
            {[Twitter, Instagram, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/40 text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}