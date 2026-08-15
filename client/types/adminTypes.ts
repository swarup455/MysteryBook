export type EvidenceStatus =
    | "DOCUMENTED"
    | "REPORTED"
    | "ALLEGED"
    | "FOLKLORE"
    | "UNVERIFIED"
    | "DISPUTED"
    | "DEBUNKED";

export type Topic =
    | "Paranormal"
    | "Haunted Location"
    | "Unsolved Murder"
    | "Disappearance"
    | "Urban Legend"
    | "Folklore"
    | "UFO / UAP"
    | "Cryptid"
    | "Lost Treasure";

export type Country = {
    id: string;
    name: string;
    flag: string;
    regions: number;
    cases: number;
};

export type Region = {
    id: string;
    name: string;
    cases: number;
};

export type Source = {
    title: string;
    publisher: string;
    date: string;
};

export interface Article {
    id: string;
    file: string;
    title: string;
    category: string;
    evidence: EvidenceStatus;
    summary: string;
    sources: Source[];
    sourceCount?: number;
}

export type QueueStep = {
    label: string;
    detail: string;
    candidate?: number;
    final?: boolean;
};

export type ResearchStatus = "idle" | "running" | "done";

export type CountryId = "in" | "us" | "jp" | "gb";

export type RegionId =
    | "wb"
    | "rj"
    | "mh"
    | "ka"
    | "ca"
    | "la"
    | "or"
    | "hk"
    | "ok"
    | "sc"
    | "en";