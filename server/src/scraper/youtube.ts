import { Scraper, ScrapeResult } from './types';
import * as cheerio from 'cheerio';
import axios from 'axios';

import { determineCategory, determineLocation } from '../utils/categorizer';

export class YouTubeScraper implements Scraper {
    name = 'YouTube';

    async scrape(): Promise<ScrapeResult[]> {
        const results: ScrapeResult[] = [];
        try {
            const channels = [
                { name: 'The Verge', id: 'UCddiUEpeqJcYeBxX1IVBKvQ' },
                { name: 'MKBHD', id: 'UCBJycsmduvYEL83R_U4JriQ' },
                { name: 'TechCrunch', id: 'UCCFWe75PZJkwandI8tV1R-A' }
            ];

            for (const channel of channels) {
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
                try {
                    const response = await axios.get(rssUrl);
                    const $ = cheerio.load(response.data, { xmlMode: true });

                    $('entry').each((i, el) => {
                        if (i > 3) return; // Limit to 3 latest videos per channel
                        const $el = $(el);
                        const title = $el.find('title').text();
                        const url = $el.find('link').attr('href') || '';
                        const videoId = $el.find('yt\\:videoId').text();
                        const publishedAt = new Date($el.find('published').text());
                        const description = $el.find('media\\:group > media\\:description').text();
                        const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

                        // Auto-detect metadata
                        const category = determineCategory(title + ' ' + description);
                        const locData = determineLocation(title + ' ' + description);
                        let location = 'Global';
                        if (locData.city) location = locData.city;
                        else if (locData.country) location = locData.country;

                        results.push({
                            title,
                            url,
                            source: `YouTube - ${channel.name}`,
                            type: 'VIDEO',
                            publishedAt,
                            imageUrl: thumbnail,
                            description: description.substring(0, 200) + '...',
                            location,
                            category,
                            city: locData.city,
                            country: locData.country
                        });
                    });
                } catch (e) {
                    console.error(`Failed to scrape YouTube channel ${channel.name}`);
                }
            }

        } catch (error) {
            console.error('YouTube scrape failed', error);
        }
        return results;
    }
}
