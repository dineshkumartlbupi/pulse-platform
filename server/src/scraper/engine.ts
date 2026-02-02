import { Scraper } from './types';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';
// test
export class ScraperEngine {
    private scrapers: Scraper[] = [];

    register(scraper: Scraper) {
        this.scrapers.push(scraper);
    }

    async runAll() {
        console.log('Starting scrape job...');
        const results = [];

        for (const scraper of this.scrapers) {
            console.log(`Running scraper: ${scraper.name}`);
            try {
                const items = await scraper.scrape();
                await this.saveItems(items);
                results.push(...items);
                await this.log(scraper.name, 'SUCCESS', `Scraped ${items.length} items`);
            } catch (error: any) {
                console.error(`Error in scraper ${scraper.name}:`, error);
                await this.log(scraper.name, 'ERROR', error.message);
            }
        }
        console.log('Scrape job finished');
        return results;
    }

    private async saveItems(items: any[]) {
        const db = await getDb();
        const cleanItems = items.filter(i => i.title && i.url); // Basic validation

        for (const item of cleanItems) {
            try {
                await db.run(
                    `INSERT OR IGNORE INTO content_items (id, title, url, description, imageUrl, source, type, publishedAt, location, category, severity, city, country, lat, lng)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        uuidv4(),
                        item.title,
                        item.url,
                        item.description,
                        item.imageUrl,
                        item.source,
                        item.type,
                        item.publishedAt.toISOString(),
                        item.location,
                        item.category,
                        item.severity,
                        item.city,
                        item.country,
                        item.lat,
                        item.lng
                    ]
                );
            } catch (e) {
                console.error('Failed to save item:', item.title, e);
            }
        }
    }

    private async log(source: string, status: string, message: string) {
        const db = await getDb();
        await db.run(
            `INSERT INTO logs (id, status, message, source) VALUES (?, ?, ?, ?)`,
            [uuidv4(), status, message, source]
        );
    }
}

export const engine = new ScraperEngine();
