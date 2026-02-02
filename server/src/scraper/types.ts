export interface ScrapeResult {
    title: string;
    url: string;
    source: string;
    type: 'NEWS' | 'VIDEO' | 'SOCIAL';
    publishedAt: Date;
    description?: string;
    imageUrl?: string;

    // API V2 Fields
    location?: string;
    category?: string;
    severity?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
}

export interface Scraper {
    name: string;
    scrape(): Promise<ScrapeResult[]>;
}
