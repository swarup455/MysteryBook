"use client";

import { useState } from "react";
import { Flame, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
    { key: "popular", label: "Most Popular", icon: Flame },
    { key: "date", label: "Date", icon: CalendarDays },
] as const;

export function SortBar({ count }: { count: number }) {
    const [active, setActive] = useState<(typeof options)[number]["key"]>(
        "popular"
    );

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {count} case files found
            </p>

            <div className="inline-flex items-center gap-1 self-start rounded-full border border-white/40 bg-white/30 p-1 backdrop-blur-xl">
                {options.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                            active === key
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}