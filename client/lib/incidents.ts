export type Incident = {
    id: string;
    category: "Historical" | "Unsolved Crime" | "Paranormal";
    title: string;
    description: string;
    date: string;
    location: string;
    views: number;
    imageUrl?: string;
};

export const incidents: Incident[] = [
    {
        id: "1",
        category: "Unsolved Crime",
        title: "The Vanishing Hiker",
        description:
            "An experienced hiker vanished without a trace. No clues, no footprints, just questions.",
        date: "Mar 2011",
        location: "Pacific Northwest",
        views: 18400,
    },
    {
        id: "2",
        category: "Paranormal",
        title: "Lights Over Barrowfield",
        description:
            "Dozens of residents reported the same unexplained lights hovering above the valley for three nights.",
        date: "Sep 1987",
        location: "Barrowfield",
        views: 9200,
    },
    {
        id: "3",
        category: "Historical",
        title: "The Sealed Vault of Merrow Hall",
        description:
            "A vault bricked shut for over a century was opened to find nothing but a single, unmarked key.",
        date: "Jun 1904",
        location: "Merrow Hall",
        views: 6100,
    },
    {
        id: "4",
        category: "Unsolved Crime",
        title: "The Riverside Ledger",
        description:
            "A ledger recovered from the river names twelve people — none of whom were ever identified.",
        date: "Nov 1998",
        location: "Riverside District",
        views: 14700,
    },
    {
        id: "5",
        category: "Paranormal",
        title: "The Whistling House",
        description:
            "Three families in a row abandoned the same property, each citing an identical, unexplained sound.",
        date: "Jan 2003",
        location: "Aldergate Row",
        views: 11300,
    },
    {
        id: "6",
        category: "Historical",
        title: "The Cartographer's Error",
        description:
            "A 200-year-old map marks a settlement that, by every other record, never existed.",
        date: "1821",
        location: "Northern Reaches",
        views: 5400,
    },
    {
        id: "7",
        category: "Unsolved Crime",
        title: "Signal from Pier Seven",
        description:
            "A distress signal was logged, traced, and confirmed — from a pier that had been demolished a decade earlier.",
        date: "Jul 2015",
        location: "Old Harbor",
        views: 21900,
    },
    {
        id: "8",
        category: "Paranormal",
        title: "The Recurring Guest",
        description:
            "Hotel staff across three decades describe the same guest, in the same room, who never checks out.",
        date: "1994–present",
        location: "The Kestrel Hotel",
        views: 16800,
    },
    {
        id: "9",
        category: "Historical",
        title: "The Empty Grave of Thistlewood",
        description:
            "A marked, undisturbed grave was opened during routine works and found to have never held a body.",
        date: "1889",
        location: "Thistlewood Cemetery",
        views: 7700,
    },
];