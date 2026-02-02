import { Scraper, ScrapeResult } from './types';
import * as cheerio from 'cheerio';
import axios from 'axios';
import parser from 'xml2js';

import { classifyContent } from '../utils/categories';
import { determineLocation } from '../utils/categorizer';

export class TwitterScraper implements Scraper {
    name = 'Twitter';

    // List of reliable Nitter instances
    private instances = [
        'https://nitter.net',
        'https://nitter.cz',
        'https://nitter.privacydev.net',
        'https://nitter.projectsegfau.lt',
        'https://nitter.poast.org'
    ];

    async scrape(): Promise<ScrapeResult[]> {
        const results: ScrapeResult[] = [];
        // Added improved accounts list including local news handles for diversity
        const accounts = ['verge', 'TechCrunch', 'elonmusk', 'OpenAI', 'BBCBreaking', 'CNN', 'NDTV'];

        // Try instances until one works
        let activeInstance = '';
        for (const instance of this.instances) {
            try {
                // Simple health check
                await axios.get(`${instance}/elonmusk/rss`, { timeout: 5000 });
                activeInstance = instance;
                console.log(`Using Nitter instance: ${activeInstance}`);
                break;
            } catch (e) {
                console.log(`Instance ${instance} failed or unreachable.`);
            }
        }

        if (!activeInstance) {
            console.error('All Nitter instances failed.');
            return [];
        }

        for (const account of accounts) {
            try {
                const rssUrl = `${activeInstance}/${account}/rss`;
                const response = await axios.get(rssUrl, { timeout: 8000 });
                const result = await parser.parseStringPromise(response.data);

                const items = result.rss.channel[0].item || [];
                const topItems = items.slice(0, 5);

                for (const item of topItems) {
                    const title = item.title ? item.title[0] : '';
                    const link = item.link ? item.link[0] : '';
                    const description = item.description ? item.description[0] : '';
                    const pubDate = item.pubDate ? new Date(item.pubDate[0]) : new Date();

                    let imageUrl: string | undefined;
                    // Nitter puts images in description HTML
                    if (description) {
                        const $ = cheerio.load(description);
                        const img = $('img').first().attr('src');
                        if (img) imageUrl = img;
                    }

                    // Auto-detect metadata
                    const fullText = title + ' ' + description;
                    const classification = classifyContent(fullText);
                    const locData = determineLocation(fullText);
                    let location = 'Global';
                    if (locData.city) location = locData.city;
                    else if (locData.country) location = locData.country;

                    if (classification.category !== 'OTHER') {
                        results.push({
                            title: `@${account}: ${title}`,
                            url: link,
                            source: 'X (Twitter)',
                            type: 'SOCIAL',
                            publishedAt: pubDate,
                            description: title,
                            imageUrl,
                            location,
                            category: classification.category,
                            severity: classification.severity,
                            city: locData.city,
                            country: locData.country
                        });
                    }
                }
            } catch (error: any) {
                console.error(`Twitter scrape failed for ${account} on ${activeInstance}:`, error.message);
            }
        }
        return results;
    }
}
