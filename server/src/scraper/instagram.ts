import { Scraper, ScrapeResult } from './types';
import { chromium } from 'playwright';

import { determineCategory, determineLocation } from '../utils/categorizer';

export class InstagramScraper implements Scraper {
    name = 'Instagram';

    async scrape(): Promise<ScrapeResult[]> {
        const results: ScrapeResult[] = [];
        console.log('Starting Instagram scrape...');
        const browser = await chromium.launch({ headless: true }); // Headless true for server
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        try {
            const page = await context.newPage();
            // Try scraping a public tag or profile. Note: deeply unreliable without session.
            // Trying a public profile which is slightly more permissive than tags sometimes.
            await page.goto('https://www.instagram.com/creators/', { timeout: 30000, waitUntil: 'domcontentloaded' });

            // Wait for some content (best effort)
            try {
                await page.waitForSelector('article', { timeout: 5000 });
            } catch (e) {
                console.log('Instagram article selector not found, might be login walled.');
            }

            // Extract image posts
            const posts = await page.$$('article a');
            const limit = Math.min(posts.length, 10);

            for (let i = 0; i < limit; i++) {
                const post = posts[i];
                const href = await post.getAttribute('href');
                const img = await post.$('img');
                const src = await img?.getAttribute('src');
                const alt = await img?.getAttribute('alt');

                if (href && src) {
                    const title = alt ? alt.substring(0, 100) : 'Instagram Post';
                    const description = alt || 'Instagram content';

                    // Auto-detect metadata
                    const category = determineCategory(description);
                    const locData = determineLocation(description);
                    let location = 'Global';
                    if (locData.city) location = locData.city;
                    else if (locData.country) location = locData.country;

                    results.push({
                        title,
                        url: `https://www.instagram.com${href}`,
                        source: 'Instagram',
                        type: 'SOCIAL',
                        publishedAt: new Date(),
                        imageUrl: src,
                        description,
                        location,
                        category,
                        city: locData.city,
                        country: locData.country
                    });
                }
            }

        } catch (error) {
            console.error('Instagram scrape failed:', error);
        } finally {
            await browser.close();
        }

        return results;
    }
}
