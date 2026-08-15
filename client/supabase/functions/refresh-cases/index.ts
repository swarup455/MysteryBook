// @ts-nocheck

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { countries } from "./countries.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CASE_CLASSES: { qid: string; label: string; category: string }[] = [
    { qid: "Q11519624", label: "unsolved crime", category: "unsolved-crime" },
    { qid: "Q19393843", label: "unsolved murder", category: "murder" },
    { qid: "Q132821", label: "murder", category: "murder" },
    { qid: "Q2055205", label: "cold case", category: "cold-case" },
    { qid: "Q3030513", label: "disappearance", category: "disappearance" },
    { qid: "Q7884274", label: "unexplained disappearance", category: "disappearance" },
    { qid: "Q388505", label: "missing person", category: "disappearance" },
    { qid: "Q18356450", label: "unidentified decedent", category: "unidentified-person" },
    { qid: "Q332102", label: "paranormal", category: "paranormal" },
    { qid: "Q772636", label: "cryptid", category: "cryptid" },
    { qid: "Q1434167", label: "urban legend", category: "urban-legend" },
    { qid: "Q421", label: "unidentified flying object (UFO/UAP)", category: "ufo" },
    { qid: "Q2239243", label: "mythical / legendary creature", category: "legendary-creature" },
];

const CATEGORY_PRIORITY = [
    "unidentified-person",
    "murder",
    "cold-case",
    "unsolved-crime",
    "disappearance",
    "cryptid",
    "urban-legend",
    "legendary-creature",
    "ufo",
    "paranormal",
];

const CLASS_BY_QID: Record<string, { label: string; category: string }> =
    Object.fromEntries(CASE_CLASSES.map((c) => [c.qid, c]));

const KEYWORD_CATEGORY_RULES: { category: string; patterns: RegExp[] }[] = [
    { category: "murder", patterns: [/\bmurder(ed|s)?\b/i, /\bhomicide\b/i] },
    { category: "disappearance", patterns: [/\bdisappear\w*\b/i, /\bmissing person\b/i, /\bvanished\b/i] },
    { category: "unidentified-person", patterns: [/\bunidentified (body|remains|person|decedent)\b/i, /\bjohn doe\b/i, /\bjane doe\b/i] },
    { category: "cold-case", patterns: [/\bcold case\b/i] },
    { category: "unsolved-crime", patterns: [/\bunsolved\b/i] },
    { category: "cryptid", patterns: [/\bcryptid\b/i, /\bsea monster\b/i, /\blake monster\b/i, /\blake creature\b/i] },
    { category: "ufo", patterns: [/\bufo\b/i, /\bunidentified flying object\b/i, /\buap\b/i, /\bflying saucer\b/i] },
    { category: "urban-legend", patterns: [/\burban legend\b/i] },
    { category: "legendary-creature", patterns: [/\blegendary creature\b/i, /\bmythical creature\b/i, /\bfolklore\b/i] },
    { category: "paranormal", patterns: [/\bparanormal\b/i, /\bhaunt(ed|ing)\b/i, /\bghost\b/i, /\bpoltergeist\b/i, /\bpossession\b/i] },
];

function categoriesFromQids(matchedQids: string[]): Set<string> {
    return new Set(matchedQids.map((q) => CLASS_BY_QID[q]?.category).filter(Boolean) as string[]);
}

function categoriesFromKeywords(text: string): Set<string> {
    const cats = new Set<string>();
    if (!text) return cats;
    for (const rule of KEYWORD_CATEGORY_RULES) {
        if (rule.patterns.some((p) => p.test(text))) cats.add(rule.category);
    }
    return cats;
}

function pickCategory(matchedQids: string[], text: string): string {
    const cats = new Set([...categoriesFromQids(matchedQids), ...categoriesFromKeywords(text)]);
    for (const p of CATEGORY_PRIORITY) {
        if (cats.has(p)) return p;
    }
    return "unexplained";
}

const CANDIDATE_LIMIT = 1000;
const SEARCH_RESULTS_PER_QUERY = 100;
const SEARCH_CONCURRENCY = 2;
const ENRICH_CAP = 40;
const ENRICH_CONCURRENCY = 1;
const TIME_BUDGET_MS = 55_000;
const UPSERT_CHUNK_SIZE = 200;
const MIN_LABEL_LENGTH = 2;
const MIN_RELEVANCE_SCORE = 8;

const SEARCH_QUERIES = [
    "unsolved crime",
    "unsolved murder",
    "cold case",
    "missing person",
    "mysterious disappearance",
    "unexplained death",
    "unidentified person",
    "unidentified remains",
    "paranormal case",
    "ghost sighting",
    "haunting",
    "UFO sighting",
    "alien encounter",
    "cryptid sighting",
    "urban legend",
    "unexplained phenomenon",
    "mysterious incident",
    "mysterious event",
    "unexplained case",
];

const GENERIC_TITLE_PATTERNS = [
    /^list of /i,
    /\(disambiguation\)$/i,
    /^index of /i,
    /^outline of /i,
    /^timeline of /i,
    /^glossary of /i,
    /^category:/i,
    /^portal:/i,
    /^wikipedia:/i,
    /^template:/i,
    /^comparison of /i,
];

const MEDIA_TITLE_PATTERNS = [
    /\(\d{4}.*(?:film|movie|TV|television|series|podcast|novel|book|documentary)\)/i,
    /\b(?:film|movie|TV series|television series|podcast|novel|book|documentary|video game)\b/i,
];

const SCORE_KEYWORDS: { pattern: RegExp; weight: number }[] = [
    { pattern: /\bunsolved\b/i, weight: 4 },
    { pattern: /\bmyster(y|ious)\b/i, weight: 3 },
    { pattern: /\bdisappear\w*\b/i, weight: 3 },
    { pattern: /\bmissing\b/i, weight: 2 },
    { pattern: /\bmurder(ed|s)?\b/i, weight: 2 },
    { pattern: /\bcold case\b/i, weight: 3 },
    { pattern: /\bunidentified\b/i, weight: 3 },
    { pattern: /\bunexplained\b/i, weight: 3 },
    { pattern: /\bparanormal\b/i, weight: 3 },
    { pattern: /\bhaunt(ed|ing)\b/i, weight: 2 },
    { pattern: /\bghost\b/i, weight: 1 },
    { pattern: /\bcryptid\b/i, weight: 3 },
    { pattern: /\bmonster\b/i, weight: 1 },
    { pattern: /\bufo\b/i, weight: 3 },
    { pattern: /\bunidentified flying object\b/i, weight: 3 },
    { pattern: /\bsighting\b/i, weight: 1 },
    { pattern: /\blegend\b/i, weight: 1 },
    { pattern: /\bfolklore\b/i, weight: 1 },
    { pattern: /\bvanished\b/i, weight: 2 },
    { pattern: /\bcrime\b/i, weight: 1 },
    { pattern: /\bvictim\b/i, weight: 1 },
];

function scoreKeywords(text: string): number {
    if (!text) return 0;
    let score = 0;
    for (const { pattern, weight } of SCORE_KEYWORDS) {
        const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
        const globalPattern = new RegExp(pattern.source, flags);
        const matches = text.match(globalPattern);
        if (matches) score += weight * Math.min(matches.length, 3);
    }
    return score;
}

function hasRealWorldCaseSignal(candidate: Candidate, text: string): boolean {
    const strongSignals = [
        /\bunsolved\b/i,
        /\bmurder\b/i,
        /\bhomicide\b/i,
        /\bmissing person\b/i,
        /\bdisappeared\b/i,
        /\bdisappearance\b/i,
        /\bunidentified\b/i,
        /\bcold case\b/i,
        /\bparanormal\b/i,
        /\bhaunt(?:ed|ing)?\b/i,
        /\bghost\b/i,
        /\bufo\b/i,
        /\buap\b/i,
        /\balien encounter\b/i,
        /\bcryptid\b/i,
        /\burban legend\b/i,
        /\bunexplained phenomenon\b/i,
        /\bunexplained incident\b/i,
    ];

    return strongSignals.some((pattern) => pattern.test(text));
}

function normalizeTitle(title: string): string {
    return title.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
}

function isGenericTitle(title: string): boolean {
    return GENERIC_TITLE_PATTERNS.some((p) => p.test(title));
}

function hasUsableLabel(label: string | undefined): boolean {
    if (!label) return false;
    if (label.length < MIN_LABEL_LENGTH) return false;
    if (/^Q\d+$/.test(label)) return false;
    return true;
}

function buildSparql(countryQid: string) {
    const classUnion = CASE_CLASSES.map(
        (c) => `{ ?item wdt:P31/wdt:P279* wd:${c.qid} . BIND("${c.qid}" AS ?matchedClass) }`,
    ).join("\n      UNION\n      ");

    return `
    SELECT ?item ?itemLabel
           (SAMPLE(?date) AS ?date)
           (SAMPLE(?image) AS ?image)
           (SAMPLE(?article) AS ?article)
           (SAMPLE(?coords) AS ?coords)
           (GROUP_CONCAT(DISTINCT ?matchedClass; separator="|") AS ?matchedClasses)
    WHERE {
      { ?item wdt:P17 wd:${countryQid}. }
      UNION
      { ?item wdt:P495 wd:${countryQid}. }

      {
        ${classUnion}
      }

      OPTIONAL { ?item wdt:P585 ?date. }
      OPTIONAL { ?item wdt:P18 ?image. }
      OPTIONAL { ?item wdt:P625 ?coords. }
      OPTIONAL {
        ?article schema:about ?item;
                 schema:isPartOf <https://en.wikipedia.org/>.
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    GROUP BY ?item ?itemLabel
    LIMIT ${CANDIDATE_LIMIT}
  `;
}

async function fetchFromWikidata(countryQid: string) {
    const sparql = buildSparql(countryQid);
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;

    const res = await fetch(url, {
        headers: {
            "User-Agent": "MysteryBookPipeline/3.0 (contact: mysterybook-ops)",
            Accept: "application/sparql-results+json",
        },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Wikidata request failed: ${res.status} ${res.statusText} — ${body.slice(0, 300)}`);
    }

    const json = await res.json();
    return json.results.bindings as any[];
}

async function fetchWithGracefulRetry(url: string, label: string, attempts = 2): Promise<Response | null> {
    for (let i = 0; i < attempts; i++) {
        let res: Response;
        try {
            res = await fetch(url, {
                headers: { "User-Agent": "MysteryBookPipeline/3.0 (contact: mysterybook-ops)" },
            });
        } catch (err) {
            console.warn(`${label}: network error (attempt ${i + 1}): ${(err as Error).message}`);
            continue;
        }

        if (res.ok) return res;

        if (res.status === 404) return null;

        if (res.status === 429 || res.status >= 500) {
            const retryAfter = Number(res.headers.get("Retry-After") ?? "10");

            const waitMs = Number.isFinite(retryAfter)
                ? retryAfter * 1000
                : 10000;

            console.warn(
                `${label}: ${res.status}, waiting ${waitMs}ms before retry`
            );

            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
        }

        console.warn(`${label}: ${res.status}, not retrying`);
        return null;
    }
    console.warn(`${label}: giving up after ${attempts} attempts`);
    return null;
}

async function fetchWikipediaSummary(title: string) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetchWithGracefulRetry(url, `Wikipedia summary (${title})`);
    if (!res) return null;
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchWikipediaSearchPages(query: string, countryName: string) {
    const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: `${query} ${countryName}`,
        gsrlimit: String(SEARCH_RESULTS_PER_QUERY),
        gsrnamespace: "0",
        prop: "pageprops|extracts",
        ppprop: "wikibase_item|disambiguation",
        exintro: "1",
        explaintext: "1",
        exchars: "500",
        format: "json",
    });
    const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
    const res = await fetchWithGracefulRetry(url, `Wikipedia search (${query} / ${countryName})`);
    if (!res) return [];
    let json: any;
    try {
        json = await res.json();
    } catch {
        return [];
    }
    const pages = json?.query?.pages;
    if (!pages) return [];
    return Object.values(pages) as any[];
}

async function fetchPageviews(title: string) {
    const end = new Date();
    end.setDate(end.getDate() - 2);
    const start = new Date(end);
    start.setDate(start.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

    const url =
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
        `en.wikipedia.org/all-access/all-agents/` +
        `${encodeURIComponent(title)}/daily/${fmt(start)}/${fmt(end)}`;

    const res = await fetchWithGracefulRetry(url, `Pageviews (${title})`);
    if (!res) return 0;

    try {
        const json = await res.json();
        return (json.items ?? []).reduce((sum: number, item: { views: number }) => sum + (item.views ?? 0), 0);
    } catch {
        return 0;
    }
}

function toWikipediaTitle(articleUrl: string | undefined | null) {
    if (!articleUrl) return null;
    const parts = articleUrl.split("/wiki/");
    return parts[1] ? decodeURIComponent(parts[1]).replace(/_/g, " ") : null;
}

function articleUrlFromTitle(title: string) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

function parseCoords(coordsValue: string | undefined) {
    if (!coordsValue) return { latitude: null, longitude: null };
    const match = coordsValue.trim().match(/^Point\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$/i);
    if (!match) return { latitude: null, longitude: null };
    const longitude = parseFloat(match[1]);
    const latitude = parseFloat(match[2]);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return { latitude: null, longitude: null };
    }
    return { latitude, longitude };
}

async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let cursor = 0;

    async function worker() {
        while (cursor < items.length) {
            const i = cursor++;
            results[i] = await fn(items[i], i);
        }
    }

    const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

type Candidate = {
    wikidataId: string | null;
    title: string;
    wikiTitle: string | null;
    articleUrl: string | null;
    text: string;
    matchedQids: string[];
    date: string | null;
    image: string | null;
    latitude: number | null;
    longitude: number | null;
    isDisambiguation: boolean;
    sources: string[];
};

function candidateFromWikidataBinding(binding: any): Candidate {
    const wikidataId = binding.item.value.split("/").pop();
    const title = binding.itemLabel?.value ?? "Untitled Case";
    const date = binding.date?.value ? binding.date.value.slice(0, 10) : null;
    const image = binding.image?.value ?? null;
    const articleUrl = binding.article?.value ?? null;
    const wikiTitle = toWikipediaTitle(articleUrl);
    const { latitude, longitude } = parseCoords(binding.coords?.value);
    const matchedQids = (binding.matchedClasses?.value ?? "").split("|").filter(Boolean);

    return {
        wikidataId,
        title,
        wikiTitle,
        articleUrl,
        text: title,
        matchedQids,
        date,
        image,
        latitude,
        longitude,
        isDisambiguation: false,
        sources: ["wikidata"],
    };
}

function candidateFromSearchPage(page: any): Candidate {
    const wikiTitle = page.title as string;
    const articleUrl = articleUrlFromTitle(wikiTitle);
    const wikidataId = page.pageprops?.wikibase_item ?? null;
    const isDisambiguation = !!(page.pageprops && "disambiguation" in page.pageprops);
    const extract = page.extract ?? "";

    return {
        wikidataId,
        title: wikiTitle,
        wikiTitle,
        articleUrl,
        text: `${wikiTitle} ${extract}`,
        matchedQids: [],
        date: null,
        image: null,
        latitude: null,
        longitude: null,
        isDisambiguation,
        sources: ["wikipedia-search"],
    };
}

function dedupKey(candidate: Candidate): string {
    if (candidate.wikidataId) return `qid:${candidate.wikidataId}`;
    const titleForKey = candidate.wikiTitle ?? candidate.title;
    return `title:${normalizeTitle(titleForKey)}`;
}

function mergeCandidatePair(existing: Candidate, incoming: Candidate): Candidate {
    return {
        wikidataId: existing.wikidataId ?? incoming.wikidataId,
        title: existing.title,
        wikiTitle: existing.wikiTitle ?? incoming.wikiTitle,
        articleUrl: existing.articleUrl ?? incoming.articleUrl,
        text: `${existing.text} ${incoming.text}`,
        matchedQids: Array.from(new Set([...existing.matchedQids, ...incoming.matchedQids])),
        date: existing.date ?? incoming.date,
        image: existing.image ?? incoming.image,
        latitude: existing.latitude ?? incoming.latitude,
        longitude: existing.longitude ?? incoming.longitude,
        isDisambiguation: existing.isDisambiguation || incoming.isDisambiguation,
        sources: Array.from(new Set([...existing.sources, ...incoming.sources])),
    };
}

function mergeCandidates(wikidataCandidates: Candidate[], searchCandidates: Candidate[]): Candidate[] {
    const map = new Map<string, Candidate>();
    for (const candidate of [...wikidataCandidates, ...searchCandidates]) {
        const key = dedupKey(candidate);
        const existing = map.get(key);
        map.set(key, existing ? mergeCandidatePair(existing, candidate) : candidate);
    }
    return Array.from(map.values());
}

function isRejectedCandidate(candidate: Candidate): boolean {
    if (candidate.isDisambiguation) return true;
    if (!hasUsableLabel(candidate.title)) return true;
    if (isGenericTitle(candidate.title)) return true;

    // Reject obvious entertainment/media pages
    if (MEDIA_TITLE_PATTERNS.some((p) => p.test(candidate.title))) {
        return true;
    }

    return false;
}

function structuralBonus(candidate: Candidate): number {
    let score = 0;
    if (candidate.articleUrl) score += 2;
    if (candidate.image) score += 1;
    if (candidate.latitude !== null && candidate.longitude !== null) score += 1;
    if (candidate.date) score += 1;
    return score;
}

function classBonus(matchedQids: string[]): number {
    return matchedQids.length > 0 ? 6 : 0;
}

function candidatePreScore(candidate: Candidate): number {
    const titleScore = scoreKeywords(candidate.title) * 2;
    const bodyScore = scoreKeywords(candidate.text);
    return titleScore + bodyScore + classBonus(candidate.matchedQids) + structuralBonus(candidate);
}

async function fetchWikipediaSearchCandidates(countryName: string): Promise<Candidate[]> {
    const perQuery = await mapWithConcurrency(SEARCH_QUERIES, SEARCH_CONCURRENCY, async (query) => {
        try {
            const pages = await fetchWikipediaSearchPages(query, countryName);
            return pages.map(candidateFromSearchPage);
        } catch (err) {
            console.warn(`[${countryName}] search query failed "${query}": ${(err as Error).message}`);
            return [];
        }
    });
    return perQuery.flat();
}

async function enrichCandidate(candidate: Candidate, country: string) {
    let wikiTitle = candidate.wikiTitle ?? toWikipediaTitle(candidate.articleUrl);
    let summary: any = null;
    let popularity = 0;

    if (wikiTitle) {
        const description = candidate.text;

        const combinedText = `${candidate.title} ${description}`;

        if (!hasRealWorldCaseSignal(candidate, combinedText)) {
            return {
                isDisambiguation: false,
                finalScore: 0,
                row: null,
            };
        }

        const preliminaryScore = candidatePreScore({
            ...candidate,
            text: combinedText,
        });

        if (preliminaryScore < MIN_RELEVANCE_SCORE) {
            return {
                isDisambiguation: false,
                finalScore: preliminaryScore,
                row: null,
            };
        }
    }

    const isDisambiguation = candidate.isDisambiguation || summary?.type === "disambiguation";
    // const description = summary?.extract ?? "";
    const description = candidate.text;
    const combinedText = `${candidate.title} ${description} ${candidate.text}`;
    const category = pickCategory(candidate.matchedQids, combinedText);

    const preScore = candidatePreScore({ ...candidate, text: combinedText });
    const popularityScore = Math.log10(popularity + 1) * 2;
    const finalScore = preScore + popularityScore;

    const hasEnoughSubstance = !!(
        description ||
        candidate.date ||
        candidate.image ||
        candidate.articleUrl ||
        (candidate.latitude !== null && candidate.longitude !== null)
    );

    if (isDisambiguation || !hasEnoughSubstance) {
        return { isDisambiguation: true, finalScore: 0, row: null };
    }

    const row = {
        title: candidate.title,
        country,
        category,
        description,
        event_date: candidate.date,
        // image_url: candidate.image ?? summary?.thumbnail?.source ?? null,
        image_url: candidate.image ?? null,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        source_url: candidate.articleUrl,
        source_name: candidate.articleUrl ? "Wikipedia" : null,
        popularity_score: popularity,
        external_id: candidate.wikidataId ?? (wikiTitle ? `wp:${normalizeTitle(wikiTitle)}` : `title:${normalizeTitle(candidate.title)}`),
        updated_at: new Date().toISOString(),
    };

    return { isDisambiguation: false, finalScore, row };
}

async function upsertCases(rows: any[]) {
    if (rows.length === 0) return 0;
    let stored = 0;

    for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
        const chunk = rows.slice(i, i + UPSERT_CHUNK_SIZE);
        const { error } = await supabase.from("cases").upsert(chunk, { onConflict: "external_id" });

        if (error) {
            console.error(`Supabase upsert failed for chunk ${i / UPSERT_CHUNK_SIZE}: ${error.message}`);
            continue;
        }
        stored += chunk.length;
    }

    return stored;
}

async function runForCountry(country: string, countryQid: string) {
    const log = (msg: string) => console.log(`[${country}] ${msg}`);

    let wikidataBindings: any[] = [];
    try {
        wikidataBindings = await fetchFromWikidata(countryQid);
    } catch (err) {
        log(`Wikidata query failed: ${(err as Error).message}`);
    }
    log(`wikidata raw results: ${wikidataBindings.length}`);

    const wikidataCandidates = wikidataBindings.map(candidateFromWikidataBinding);

    let searchCandidates: Candidate[] = [];
    try {
        searchCandidates = await fetchWikipediaSearchCandidates(country);
    } catch (err) {
        log(`Wikipedia search failed: ${(err as Error).message}`);
    }
    log(`wikipedia search raw results: ${searchCandidates.length}`);

    const merged = mergeCandidates(wikidataCandidates, searchCandidates);
    log(`merged unique candidates: ${merged.length}`);

    const filtered = merged.filter((c) => !isRejectedCandidate(c));
    const rejectedGeneric = merged.length - filtered.length;
    log(`rejected generic/disambiguation/no-label: ${rejectedGeneric}`);

    const ranked = [...filtered].sort((a, b) => candidatePreScore(b) - candidatePreScore(a));
    const toEnrich = ranked.slice(0, ENRICH_CAP);
    const truncated = ranked.length - toEnrich.length;
    if (truncated > 0) {
        log(`ranked pool ${ranked.length}, enriching top ${toEnrich.length} (truncated ${truncated})`);
    }

    const enriched = await mapWithConcurrency(toEnrich, ENRICH_CONCURRENCY, async (candidate) => {
        try {
            return await enrichCandidate(candidate, country);
        } catch (err) {
            console.warn(`[${country}] skipping candidate "${candidate.title}": ${(err as Error).message}`);
            return null;
        }
    });

    let rejectedDisambiguationOrThin = 0;
    let rejectedByRelevance = 0;
    const accepted = enriched.filter((r) => {
        if (!r || !r.row) {
            rejectedDisambiguationOrThin++;
            return false;
        }
        if (r.finalScore < MIN_RELEVANCE_SCORE) {
            rejectedByRelevance++;
            return false;
        }
        return true;
    });

    accepted.sort((a, b) => b!.finalScore - a!.finalScore);

    const rows = accepted.map((r) => r!.row);
    log(
        `enriched: ${enriched.filter(Boolean).length}, rejected (disambiguation/thin): ${rejectedDisambiguationOrThin}, ` +
        `rejected (low relevance): ${rejectedByRelevance}, accepted: ${rows.length}`,
    );

    const stored = await upsertCases(rows);
    log(`stored: ${stored}`);

    return {
        wikidataFound: wikidataBindings.length,
        wikipediaSearchFound: searchCandidates.length,
        mergedUnique: merged.length,
        rejectedGeneric,
        rankedPool: ranked.length,
        enrichedCount: enriched.filter(Boolean).length,
        accepted: rows.length,
        stored,
    };
}

Deno.serve(async (req: Request) => {
    const startedAt = Date.now();
    const url = new URL(req.url);

    const countriesParam = url.searchParams.get("countries");
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10) || 0;
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let targetCountries = countries;
    if (countriesParam) {
        const wanted = new Set(countriesParam.split(",").map((s) => s.trim().toLowerCase()));
        targetCountries = countries.filter((c) => wanted.has(c.name.toLowerCase()));
    } else if (limit !== undefined) {
        targetCountries = countries.slice(offset, offset + limit);
    }

    const results: Record<string, any> = {};
    let truncatedByTimeBudget = false;

    try {
        for (const country of targetCountries) {
            if (Date.now() - startedAt > TIME_BUDGET_MS) {
                truncatedByTimeBudget = true;
                console.warn(`Time budget (${TIME_BUDGET_MS}ms) reached before processing ${country.name}; stopping early.`);
                break;
            }

            try {
                results[country.name] = await runForCountry(country.name, country.wikidataId);
            } catch (err) {
                console.error(`[${country.name}] unhandled error: ${(err as Error).message}`);
                results[country.name] = { error: (err as Error).message };
            }
        }

        return new Response(
            JSON.stringify({
                ok: true,
                truncatedByTimeBudget,
                processedCountries: Object.keys(results).length,
                totalCountriesRequested: targetCountries.length,
                results,
            }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ ok: false, error: (err as Error).message, results }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
});