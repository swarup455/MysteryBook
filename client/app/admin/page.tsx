"use client";

import { useState, useEffect, useRef, type ReactNode, type HTMLAttributes } from "react";
import {
    Play, Search, CheckCircle2, Circle, Loader2, FileText, Link2,
    ArrowLeft, ChevronRight, Home, Bookmark, BookmarkCheck, X, Globe2,
    LayoutGrid, FlaskConical, Hash, ChevronDown,
} from "lucide-react";
import {
    EvidenceStatus, Topic, Country,
    Region, Source, Article,
    CountryId, RegionId
} from "@/types/adminTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Types
interface EvidenceStyle {
    label: string;
    className: string;
}

interface QueueStep {
    label: string;
    detail: string;
    candidate?: number;
    final?: boolean;
}

interface SelectOption {
    id?: string;
    name?: string;
    flag?: string;
    regions?: number;
    cases?: number;
}

type ViewType = "playground" | "archive";
type ResearchStatus = "idle" | "running" | "done";

const TOPICS: Topic[] = [
    "Paranormal", "Haunted Location", "Unsolved Murder", "Disappearance",
    "Urban Legend", "Folklore", "UFO / UAP", "Cryptid", "Lost Treasure",
];

const COUNTRIES: Country[] = [
    { id: "in", name: "India", flag: "🇮🇳", regions: 4, cases: 4 },
    { id: "us", name: "United States", flag: "🇺🇸", regions: 3, cases: 2 },
    { id: "jp", name: "Japan", flag: "🇯🇵", regions: 2, cases: 1 },
    { id: "gb", name: "United Kingdom", flag: "🇬🇧", regions: 2, cases: 2 },
];

const REGIONS: Record<CountryId, Region[]> = {
    in: [
        { id: "wb", name: "West Bengal", cases: 2 },
        { id: "rj", name: "Rajasthan", cases: 1 },
        { id: "mh", name: "Maharashtra", cases: 1 },
        { id: "ka", name: "Karnataka", cases: 0 },
    ],
    us: [
        { id: "ca", name: "California", cases: 1 },
        { id: "la", name: "Louisiana", cases: 1 },
        { id: "or", name: "Oregon", cases: 0 },
    ],
    jp: [
        { id: "hk", name: "Hokkaido", cases: 1 },
        { id: "ok", name: "Okinawa", cases: 0 },
    ],
    gb: [
        { id: "sc", name: "Scotland", cases: 1 },
        { id: "en", name: "England", cases: 1 },
    ],
};

const ARTICLES: Record<RegionId, Article[]> = {
    wb: [
        {
            id: "a1", file: "IN-WB-0417", title: "Dow Hill Forest Range", category: "Haunted Location",
            evidence: "REPORTED",
            summary: "A colonial-era forest range near Kurseong known among locals and forestry staff for decades of reported sightings and unexplained sounds along the boarding-school road. Reports concentrate around the old ranger's bungalow and the stretch of road leading to the abandoned school building.",
            sources: [
                { title: "Forest ranger interview transcript", publisher: "Darjeeling District Archive", date: "1998" },
                { title: "Regional folklore survey, Kurseong section", publisher: "West Bengal Heritage Society", date: "2011" },
                { title: "Local newspaper feature on the boarding-school road", publisher: "Darjeeling Times", date: "2016" },
            ],
            sourceCount: 3,
        },
        {
            id: "a2", file: "IN-WB-0418", title: "The Kurseong Line Disappearance", category: "Disappearance",
            evidence: "DOCUMENTED",
            summary: "A 1962 case involving a mail clerk who vanished along the narrow-gauge rail line between two stations. The case remains open in district records, with the last confirmed sighting logged by a signal-post attendant.",
            sources: [
                { title: "Police case bulletin, District Records", publisher: "West Bengal State Archive", date: "1962" },
                { title: "Follow-up inquiry summary", publisher: "District Court Records", date: "1965" },
            ],
            sourceCount: 2,
        },
    ],
    rj: [
        {
            id: "a3", file: "IN-RJ-0102", title: "Bhangarh Fort", category: "Haunted Location",
            evidence: "FOLKLORE",
            summary: "One of the most widely cited haunted sites in the region, tied to a centuries-old curse narrative. Archaeological Survey notices restrict entry after sunset, which has itself become part of the local account.",
            sources: [
                { title: "Heritage survey note on entry restrictions", publisher: "Archaeological Survey of India", date: "2004" },
                { title: "Oral history collection, Alwar district", publisher: "Rajasthan Folklore Project", date: "2019" },
            ],
            sourceCount: 2,
        },
    ],
    mh: [
        {
            id: "a9", file: "IN-MH-0206", title: "The Lonar Crater Lights", category: "UFO / UAP",
            evidence: "UNVERIFIED",
            summary: "Sporadic reports of unexplained lights over the Lonar impact crater lake, first logged by a local astronomy club and repeated inconsistently in regional press since.",
            sources: [
                { title: "Astronomy club observation log", publisher: "Buldhana Skywatch Circle", date: "2020" },
            ],
            sourceCount: 1,
        },
    ],
    ca: [
        {
            id: "a4", file: "US-CA-0091", title: "The Winchester Signal", category: "Paranormal",
            evidence: "ALLEGED",
            summary: "Recurring claims of unexplained electrical activity in a section of the historic estate, first raised by maintenance staff and later picked up by a regional paranormal research group.",
            sources: [
                { title: "Estate maintenance incident log", publisher: "County Historical Trust", date: "2009" },
            ],
            sourceCount: 1,
        },
    ],
    la: [
        {
            id: "a5", file: "US-LA-0033", title: "Bayou St. John Disappearance", category: "Disappearance",
            evidence: "DOCUMENTED",
            summary: "A 1971 missing-persons case along the bayou that remains formally unsolved, with a sheriff's report noting an abandoned boat as the only recovered evidence.",
            sources: [
                { title: "Sheriff's department report excerpt", publisher: "Orleans Parish Records", date: "1971" },
                { title: "Case status review", publisher: "Louisiana Cold Case Unit", date: "1998" },
            ],
            sourceCount: 2,
        },
    ],
    hk: [
        {
            id: "a6", file: "JP-HK-0015", title: "The Otaru Fog Lights", category: "UFO / UAP",
            evidence: "REPORTED",
            summary: "Harbor watch logs describe recurring unexplained lights during heavy fog conditions over three consecutive winters, corroborated by two independent fishing crews.",
            sources: [
                { title: "Harbor watch log entries", publisher: "Otaru Maritime Bureau", date: "1988" },
            ],
            sourceCount: 1,
        },
    ],
    sc: [
        {
            id: "a7", file: "GB-SC-0028", title: "The Cairngorm Grey Man", category: "Cryptid",
            evidence: "FOLKLORE",
            summary: "A long-standing mountaineering account of an unexplained presence encountered near the summit ridge, documented across multiple decades of club journals.",
            sources: [
                { title: "Club journal, summit ridge accounts", publisher: "Scottish Highland Mountaineering Society", date: "1970-2005 (compiled)" },
            ],
            sourceCount: 1,
        },
    ],
    en: [
        {
            id: "a8", file: "GB-EN-0071", title: "Borley Rectory Accounts", category: "Haunted Location",
            evidence: "DISPUTED",
            summary: "One of the most investigated reportedly haunted sites in the country. Later investigation raised significant doubts about the original witness accounts, and the case is preserved as a study in evidentiary standards.",
            sources: [
                { title: "Original investigative society report", publisher: "Society for Psychical Research", date: "1938" },
                { title: "Critical re-examination of witness testimony", publisher: "Society for Psychical Research", date: "1956" },
            ],
            sourceCount: 2,
        },
    ],
};

const QUEUE_TEMPLATE = (country: string, region: string, topic: string): QueueStep[] => [
    { label: "Generating initial search queries", detail: `${region} ${topic.toLowerCase()} — seed set` },
    { label: "Searching web sources", detail: `"${region} ${topic.toLowerCase()} reports"` },
    { label: "Analyzing results for relevance", detail: "14 results scored" },
    { label: "Candidate identified", detail: "Entity extracted, checking novelty", candidate: 0 },
    { label: "Verifying regional association", detail: `Confirming link to ${region}` },
    { label: "Gathering supporting sources", detail: "3 independent sources found" },
    { label: "Candidate saved", detail: "Duplicate check passed" },
    { label: "Generating follow-up queries", detail: "Based on discovered entity" },
    { label: "Searching web sources", detail: "Follow-up query set" },
    { label: "Candidate identified", detail: "Second entity extracted", candidate: 1 },
    { label: "Verifying regional association", detail: `Confirming link to ${region}` },
    { label: "Candidate saved", detail: "Duplicate check passed" },
    { label: "Novelty rate dropped", detail: "2 consecutive low-novelty iterations" },
    { label: "Session complete", detail: "Saturation reached", final: true },
];

const MOCK_FOUND = (topic: string): Article[] => [
    {
        id: "new1", file: "IN-WB-0501", title: "The Ghum Station Watchman", category: topic,
        evidence: "REPORTED", sourceCount: 3,
        summary: "A recurring account among railway staff of a night watchman figure seen on the platform after the last scheduled service, tied to an unresolved incident from the station's early operating years.",
        sources: [
            { title: "Railway staff testimony, informal collection", publisher: "Northeast Frontier Railway Heritage Group", date: "2014" },
            { title: "Station operations log excerpt", publisher: "Ghum Station Archive", date: "1955" },
            { title: "Regional travel feature", publisher: "The Hill Gazette", date: "2019" },
        ],
    },
    {
        id: "new2", file: "IN-WB-0502", title: "The Senchal Lake Silence", category: topic,
        evidence: "FOLKLORE", sourceCount: 2,
        summary: "A local account explaining an unusual absence of bird activity around the reservoir, passed down through generations of nearby residents and referenced in a regional folklore compilation.",
        sources: [
            { title: "Oral history compilation, Senchal division", publisher: "Darjeeling Folklore Project", date: "2017" },
            { title: "Forest department field note", publisher: "West Bengal Forest Department", date: "2003" },
        ],
    },
];

const EVIDENCE: Record<string, { label: string; className: string }> = {
    CONFIRMED: {
        label: "Confirmed",
        className: "border-emerald-600/25 bg-emerald-500/10 text-emerald-700",
    },
    REPORTED: {
        label: "Reported",
        className: "border-amber-600/25 bg-amber-500/10 text-amber-700",
    },
    DISPUTED: {
        label: "Disputed",
        className: "border-rose-600/25 bg-rose-500/10 text-rose-700",
    },
    UNVERIFIED: {
        label: "Unverified",
        className: "border-white/40 bg-white/30 text-muted-foreground",
    },
};

function EvidenceBadge({ status }: { status: EvidenceStatus }) {
    const evidence = EVIDENCE[status] || EVIDENCE.UNVERIFIED;
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-xl",
                evidence.className
            )}
        >
            {evidence.label}
        </span>
    );
}

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {children}
        </p>
    );
}

function StatusStamp({ status, stepIndex, total }: {
    status: ResearchStatus;
    stepIndex: number;
    total: number;
}) {
    const label = status === "idle" ? "Idle" : status === "running" ? "Searching" : "Complete";
    return (
        <div className="flex items-center gap-3">
            {status !== "idle" && (
                <span className="font-mono text-xs text-muted-foreground">
                    {Math.min(stepIndex, total)}/{total}
                </span>
            )}
            <Badge variant={status === "done" ? "secondary" : status === "running" ? "default" : "outline"}>
                {label}
            </Badge>
        </div>
    );
}

function CandidateCard({
    candidate,
    isSaved,
    onOpen,
    onSave,
}: {
    candidate: Article;
    isSaved: boolean;
    onOpen: () => void;
    onSave: () => void;
}) {
    return (
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/40 bg-white/30 p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        {candidate.file}
                    </span>
                    <h3 className="mt-1 text-base font-medium leading-snug">{candidate.title}</h3>
                </div>
                <EvidenceBadge status={candidate.evidence} />
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {candidate.summary}
            </p>
            <div className="flex items-center justify-between border-t border-white/40 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {candidate.sourceCount} sources
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSave}
                        className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-xl transition-colors hover:border-primary/25"
                    >
                        {isSaved ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
                        ) : (
                            <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
                        )}
                        {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                        onClick={onOpen}
                        className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-white/80"
                    >
                        Open
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailModal({
    item,
    isSaved,
    onSave,
    onClose,
}: {
    item: Article;
    isSaved: boolean;
    onSave: () => void;
    onClose: () => void;
}) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl rounded-[2rem] border border-white/40 bg-white/70 p-7 shadow-xl shadow-black/10 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                {item.file}
                            </span>
                            <DialogTitle className="mt-1 text-xl font-medium">{item.title}</DialogTitle>
                            <div className="mt-3 flex items-center gap-2">
                                <EvidenceBadge status={item.evidence} />
                                <span className="text-xs text-muted-foreground">{item.category}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Summary
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">{item.summary}</p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Sources
                        </p>
                        <div className="mt-3 space-y-2">
                            {item.sources.map((source: Source, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 rounded-[1.25rem] border border-white/40 bg-white/30 p-3 backdrop-blur-xl"
                                >
                                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                    <div>
                                        <p className="text-sm text-foreground">{source.title}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {source.publisher} · {source.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-full border border-white/40 bg-white/30 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:border-primary/25"
                    >
                        Close
                    </button>
                    <button
                        onClick={onSave}
                        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                        {isSaved ? (
                            <BookmarkCheck className="h-4 w-4" strokeWidth={2} />
                        ) : (
                            <Bookmark className="h-4 w-4" strokeWidth={2} />
                        )}
                        {isSaved ? "Saved to archive" : "Save to archive"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Playground() {
    const [countryId, setCountryId] = useState<CountryId | undefined>(undefined);
    const [regionId, setRegionId] = useState<RegionId | undefined>(undefined);
    const [topic, setTopic] = useState<Topic | undefined>(undefined);
    const [status, setStatus] = useState<ResearchStatus>("idle");
    const [stepIndex, setStepIndex] = useState(0);
    const [found, setFound] = useState<Article[]>([]);
    const [openCandidate, setOpenCandidate] = useState<Article | null>(null);
    const [saved, setSaved] = useState<Set<string>>(new Set());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const country = COUNTRIES.find((c) => c.id === countryId);
    const regionOptions = countryId ? REGIONS[countryId] : [];
    const region = regionOptions.find((r) => r.id === regionId);

    const steps = country && region && topic ? QUEUE_TEMPLATE(country.name, region.name, topic) : [];
    const candidates = topic ? MOCK_FOUND(topic) : [];

    const canStart = Boolean(country && region && topic && status !== "running");

    function start() {
        setStatus("running");
        setStepIndex(0);
        setFound([]);
        setOpenCandidate(null);
        setSaved(new Set());
    }

    useEffect(() => {
        if (status !== "running") return;

        intervalRef.current = setInterval(() => {
            setStepIndex((currentIndex) => {
                const next = currentIndex + 1;
                const step = steps[currentIndex];

                if (step?.candidate !== undefined && candidates[step.candidate]) {
                    setFound((prevFound) => [...prevFound, candidates[step.candidate]]);
                }

                if (next >= steps.length) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    setStatus("done");
                }

                return next;
            });
        }, 650);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [status, steps, candidates]);

    function toggleSave(id: string) {
        setSaved((prevSaved) => {
            const next = new Set(prevSaved);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    return (
        <div className="space-y-8">
            <div>
                <span className="inline-flex items-center rounded-full border border-white/40 bg-white/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-xl">
                    Research Lab
                </span>
                <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
                    Start a research session
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Pick a country, region and topic. The agent researches iteratively and shows its work below as it runs.
                </p>
            </div>

            <div className="rounded-[2rem] border border-white/40 bg-white/30 p-6 shadow-xl shadow-black/5 backdrop-blur-2xl md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end">
                    <div className="flex-1 space-y-2.5">
                        <Label htmlFor="country-select" className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Country
                        </Label>
                        <Select
                            value={countryId}
                            onValueChange={(value: string) => {
                                setCountryId(value as CountryId);
                                setRegionId(undefined);
                            }}
                        >
                            <SelectTrigger
                                id="country-select"
                                className="h-14 rounded-[1.25rem] border-white/50 bg-white/40 px-5 text-sm backdrop-blur-xl"
                            >
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl">
                                {COUNTRIES.map((country) => (
                                    <SelectItem key={country.id} value={country.id}>
                                        {country.flag} {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2.5">
                        <Label htmlFor="region-select" className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Region
                        </Label>
                        <Select
                            value={regionId}
                            onValueChange={(value: string) => setRegionId(value as RegionId)}
                            disabled={!countryId}
                        >
                            <SelectTrigger
                                id="region-select"
                                className="h-14 rounded-[1.25rem] border-white/50 bg-white/40 px-5 text-sm backdrop-blur-xl"
                            >
                                <SelectValue placeholder={countryId ? "Select region" : "Select country first"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl">
                                {regionOptions.map((region) => (
                                    <SelectItem key={region.id} value={region.id}>
                                        {region.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2.5">
                        <Label htmlFor="topic-select" className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                            Topic
                        </Label>
                        <Select
                            value={topic}
                            onValueChange={(value: string) => setTopic(value as Topic)}
                            disabled={!regionId}
                        >
                            <SelectTrigger
                                id="topic-select"
                                className="h-14 rounded-[1.25rem] border-white/50 bg-white/40 px-5 text-sm backdrop-blur-xl"
                            >
                                <SelectValue placeholder={regionId ? "Select topic" : "Select region first"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl">
                                {TOPICS.map((topic) => (
                                    <SelectItem key={topic} value={topic}>
                                        {topic}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={start}
                        disabled={!canStart}
                        size="lg"
                        className="h-14 shrink-0 gap-2 rounded-[1.25rem] px-8 text-base"
                    >
                        {status === "running" ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        ) : (
                            <Play className="h-4 w-4" strokeWidth={2} />
                        )}
                        Start research
                    </Button>
                </div>
            </div>

            {/* Queue */}
            {steps.length > 0 && (
                <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/30 shadow-lg shadow-black/5 backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <Search className="h-4 w-4 text-primary" strokeWidth={1.75} />
                            <span className="text-sm font-medium">Research queue</span>
                        </div>
                        <StatusStamp status={status} stepIndex={stepIndex} total={steps.length} />
                    </div>
                    <div className="max-h-80 space-y-0.5 overflow-y-auto p-3 font-mono text-sm">
                        {status === "idle" ? (
                            <p className="px-3 py-6 text-center text-muted-foreground">
                                Ready — select a session above and start research to see live progress here.
                            </p>
                        ) : (
                            steps.slice(0, Math.max(stepIndex, 1)).map((step: QueueStep, index: number) => {
                                const isDone = index < stepIndex;
                                const isActive = index === stepIndex - 1 && status === "running";
                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-start gap-3 rounded-xl px-3 py-2 transition-colors",
                                            isActive && "bg-white/40 backdrop-blur-xl"
                                        )}
                                    >
                                        <span className="mt-0.5 shrink-0">
                                            {isActive ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" strokeWidth={2} />
                                            ) : isDone ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
                                            ) : (
                                                <Circle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                                            )}
                                        </span>
                                        <span className="text-foreground">{step.label}</span>
                                        <span className="text-muted-foreground">— {step.detail}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Results */}
            {found.length > 0 && (
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <Eyebrow>{status === "done" ? "Session complete" : "Discovering"}</Eyebrow>
                        <span className="font-mono text-xs text-muted-foreground">
                            {found.length} found
                        </span>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {found.map((candidate: Article) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                isSaved={saved.has(candidate.id)}
                                onOpen={() => setOpenCandidate(candidate)}
                                onSave={() => toggleSave(candidate.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {openCandidate && (
                <DetailModal
                    item={openCandidate}
                    isSaved={saved.has(openCandidate.id)}
                    onSave={() => toggleSave(openCandidate.id)}
                    onClose={() => setOpenCandidate(null)}
                />
            )}
        </div>
    );
}

function Archive() {
    const [countryId, setCountryId] = useState<CountryId | null>(null);
    const [regionId, setRegionId] = useState<RegionId | null>(null);
    const [articleId, setArticleId] = useState<string | null>(null);

    const country = COUNTRIES.find((c) => c.id === countryId);
    const region = countryId ? REGIONS[countryId].find((r) => r.id === regionId) : null;
    const article =
        regionId && articleId ? ARTICLES[regionId]?.find((a) => a.id === articleId) : null;

    return (
        <div className="space-y-8">
            <div>
                <span className="inline-flex items-center rounded-full border border-white/40 bg-white/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-xl">
                    Data Archive
                </span>
                <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
                    Browse the collection
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Browse saved mysteries by country, region, and category.
                </p>
            </div>

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/40 bg-white/30 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur-xl">
                <button
                    onClick={() => {
                        setCountryId(null);
                        setRegionId(null);
                        setArticleId(null);
                    }}
                    className="flex items-center gap-1.5 hover:text-foreground"
                >
                    <Home className="h-3.5 w-3.5" strokeWidth={1.75} />
                    All countries
                </button>
                {country && (
                    <>
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <button
                            onClick={() => {
                                setRegionId(null);
                                setArticleId(null);
                            }}
                            className="hover:text-foreground"
                        >
                            {country.name}
                        </button>
                    </>
                )}
                {region && (
                    <>
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <button onClick={() => setArticleId(null)} className="hover:text-foreground">
                            {region.name}
                        </button>
                    </>
                )}
                {article && (
                    <>
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span className="text-foreground">{article.title}</span>
                    </>
                )}
            </div>

            {article ? (
                <ArticleDetail article={article} onBack={() => setArticleId(null)} />
            ) : region ? (
                <div className="grid gap-5 sm:grid-cols-2">
                    {(ARTICLES[region.id] || []).length === 0 ? (
                        <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">
                            No mysteries saved for {region.name} yet.
                        </p>
                    ) : (
                        ARTICLES[region.id].map((article: Article) => (
                            <button key={article.id} onClick={() => setArticleId(article.id)} className="text-left">
                                <div className="flex h-full flex-col gap-4 rounded-[1.75rem] border border-white/40 bg-white/30 p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                                {article.file}
                                            </span>
                                            <h3 className="mt-1 text-base font-medium leading-snug">{article.title}</h3>
                                        </div>
                                        <EvidenceBadge status={article.evidence} />
                                    </div>
                                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                        {article.summary}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-white/40 pt-4 text-xs text-muted-foreground">
                                        <span>{article.category}</span>
                                        <span className="flex items-center gap-1.5">
                                            <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                            {article.sources.length} sources
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            ) : country ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {REGIONS[country.id].map((region: Region) => (
                        <button key={region.id} onClick={() => setRegionId(region.id)} className="text-left">
                            <div className="flex items-center justify-between rounded-[1.75rem] border border-white/40 bg-white/30 p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25">
                                <div>
                                    <h3 className="text-base font-medium">{region.name}</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {region.cases} {region.cases === 1 ? "mystery" : "mysteries"}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {COUNTRIES.map((country: Country) => (
                        <button key={country.id} onClick={() => setCountryId(country.id)} className="text-left">
                            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/40 bg-white/30 p-6 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors duration-200 hover:border-primary/25">
                                <span className="text-3xl">{country.flag}</span>
                                <div>
                                    <h3 className="text-base font-medium">{country.name}</h3>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Globe2 className="h-3 w-3" strokeWidth={1.75} />
                                        {country.regions} regions · {country.cases} mysteries
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ArticleDetail({ article, onBack }: { article: Article; onBack: () => void }) {
    return (
        <div>
            <Button
                variant="ghost"
                onClick={onBack}
                className="mb-6 gap-2"
            >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                Back
            </Button>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                <Card className="p-8">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <Hash className="h-3 w-3" strokeWidth={2} />
                        {article.file}
                    </div>
                    <h2 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                        {article.title}
                    </h2>
                    <div className="mt-4 flex items-center gap-3">
                        <EvidenceBadge status={article.evidence} />
                        <span className="text-xs text-muted-foreground">{article.category}</span>
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-foreground">{article.summary}</p>
                </Card>

                <Card className="h-fit p-6">
                    <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Sources
                    </h3>
                    <div className="mt-4 space-y-3">
                        {article.sources.map((source: Source, index: number) => (
                            <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                                <p className="flex items-start gap-2 text-sm text-foreground">
                                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                                    {source.title}
                                </p>
                                <p className="mt-1 pl-5 text-xs text-muted-foreground">
                                    {source.publisher} · {source.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function AdminPanel() {
    const [view, setView] = useState<ViewType>("playground");

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-medium tracking-widest">
                            MYSTERY BOOK
                        </span>
                        <Badge variant="outline" className="font-mono text-xs uppercase tracking-widest">
                            Admin
                        </Badge>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/30 px-1 py-2 backdrop-blur-xl">
                        {[
                            { key: "playground", label: "Playground", icon: FlaskConical },
                            { key: "archive", label: "Data Archive", icon: LayoutGrid },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setView(key as ViewType)}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full px-3 py-3 text-xs font-medium transition-colors duration-200",
                                    view === key
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
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
                {view === "playground" ? <Playground /> : <Archive />}
            </main>
        </div>
    );
}