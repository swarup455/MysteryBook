"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";

export function SearchPanel() {
  const router = useRouter();
  const [country, setCountry] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return countries;

    return countries.filter((c) =>
      c.name.toLowerCase().includes(query)
    );
  }, [search]);

  const selected = countries.find((c) => c.name === country);

  return (
    <div className="relative mx-auto max-w-3xl px-6 pb-20">
      <div className="rounded-[2rem] border border-white/40 bg-white/30 p-4 shadow-xl shadow-black/5 backdrop-blur-2xl md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-16 flex-1 items-center gap-3 rounded-[1.5rem] border border-white/50 bg-white/40 px-6 backdrop-blur-xl">
            {selected ? (
              <img
                src={selected.flag}
                alt={selected.name}
                className="h-5 w-7 shrink-0 rounded-[3px] object-cover"
              />
            ) : (
              <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}

            {/* modal={true} stops Radix from closing the popover on outside
                pointerdown before cmdk's onSelect fires */}
            <Popover open={open} onOpenChange={setOpen} modal={true}>
              <PopoverTrigger>
                <div
                  role="combobox"
                  tabIndex={0}
                  aria-expanded={open}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen((prev) => !prev);
                    }
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-between bg-transparent text-left text-sm outline-none"
                >
                  {selected ? selected.name : "Select a country to investigate..."}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-0 bg-white border border-border shadow-2xl z-50"
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search country..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList className="max-h-72 scrollbar-hide">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCountries.map((c) => (
                        <CommandItem
                          key={c.code}
                          value={c.name}
                          onSelect={() => {
                            setCountry(c.name);
                            setSearch("");
                            setOpen(false);
                          }}
                          className="my-1"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              country === c.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            size="lg"
            className="h-16 shrink-0 rounded-[1.5rem] px-8 text-base"
            onClick={() =>
              router.push(
                `/discover?country=${encodeURIComponent(country || "United States")}`
              )
            }
          >
            Explore Mysteries
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Select a region to access localized case files
      </p>
    </div>
  );
}