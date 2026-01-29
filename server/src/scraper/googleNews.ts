import { Scraper, ScrapeResult } from './types';
import * as cheerio from 'cheerio';
import axios from 'axios';
import parser from 'xml2js';
import { determineCategory, determineLocation } from '../utils/categorizer';

export class GoogleNewsScraper implements Scraper {
    name = 'GoogleNews';

    async scrape(): Promise<ScrapeResult[]> {
        const results: ScrapeResult[] = [];

        // Define queries covering Breaking News and various categories, focusing on India & Global
        const queries = [
            // India Specific (gl=IN)
            { type: 'Breaking India', url: 'https://news.google.com/rss/search?q=when:1h&hl=en-IN&gl=IN&ceid=IN:en' },
            { type: 'Local Lucknow', url: 'https://news.google.com/rss/search?q=Lucknow+news+when:1d&hl=en-IN&gl=IN&ceid=IN:en' },

            // Global/US Breaking
            { type: 'Breaking US', url: 'https://news.google.com/rss/search?q=when:1h&hl=en-US&gl=US&ceid=US:en' },

            // Standard Topics (using generic English)
            { type: 'Topic', term: 'technology' },
            { type: 'Topic', term: 'business' },
            { type: 'Topic', term: 'politics' }, // Will likely get mix
            { type: 'Topic', term: 'cricket', url: 'https://news.google.com/rss/search?q=cricket+news&hl=en-IN&gl=IN&ceid=IN:en' }, // Adding Cricket for India
            { type: 'Topic', term: 'crime' },
            { type: 'Topic', term: 'education' },
            { type: 'Topic', term: 'health' },
            { type: 'Topic', term: 'sports' },
            { type: 'Topic', term: 'entertainment' }
        ];

        try {
            for (const q of queries) {
                // Construct URL if not provided explicitly
                const rssUrl = q.url || `https://news.google.com/rss/search?q=${q.term}+when:1d&hl=en-US&gl=US&ceid=US:en`;

                try {
                    const response = await axios.get(rssUrl, { timeout: 5000 });
                    const result = await parser.parseStringPromise(response.data);
                    const items = result.rss.channel[0].item || [];

                    // Take top 20 items per query to maximize content
                    const topItems = items.slice(0, 20);

                    for (const item of topItems) {
                        const title = item.title ? item.title[0] : 'No Title';
                        const link = item.link ? item.link[0] : '';
                        const pubDate = item.pubDate ? new Date(item.pubDate[0]) : new Date();
                        const rssDesc = item.description ? item.description[0] : '';
                        const source = item.source ? item.source[0]._ : 'Google News';

                        let imageUrl: string | undefined;
                        let fullContent = '';

                        // 1. Extract Image from RSS description if available
                        if (rssDesc) {
                            try {
                                const $ = cheerio.load(rssDesc);
                                const img = $('img').first().attr('src');
                                if (img && !img.includes('googleusercontent')) imageUrl = img;
                            } catch (e) { }
                        }

                        // 2. Visit URL to get Full Content & Better Image
                        // This step fetches the actual article page to scrape the body text
                        if (link) {
                            try {
                                const pageRes = await axios.get(link, {
                                    timeout: 4000,
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                                    }
                                });
                                const $page = cheerio.load(pageRes.data);

                                // Try to get OG Image if we don't have one from RSS
                                if (!imageUrl) {
                                    imageUrl = $page('meta[property="og:image"]').attr('content');
                                }

                                // Extract Article Text: Heuristic to find the main content
                                // Remove common noise elements
                                $page('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

                                // Try common content selectors
                                let paragraphs = $page('article p');
                                if (paragraphs.length < 2) paragraphs = $page('main p');
                                if (paragraphs.length < 2) paragraphs = $page('div.content p');
                                if (paragraphs.length < 2) paragraphs = $page('div.story-body p');
                                if (paragraphs.length < 2) paragraphs = $page('p'); // Fallback to all paragraphs

                                const textParts: string[] = [];
                                paragraphs.each((i, el) => {
                                    // Limit to first 15 paragraphs to ensure we get substantial content but not junk
                                    if (i < 15) {
                                        const text = $page(el).text().trim();
                                        // Filter out short snippets that are likely UI elements or captions
                                        if (text.length > 60) textParts.push(text);
                                    }
                                });

                                if (textParts.length > 0) fullContent = textParts.join('\n\n');

                            } catch (e) {
                                // console.log('Failed to fetch full content for', link);
                            }
                        }

                        // Use full content if found, otherwise fallback to RSS description
                        const finalDescription = fullContent || (rssDesc ? rssDesc.replace(/<[^>]*>?/gm, "") : '');

                        // Auto-categorize
                        const category = determineCategory(title + ' ' + finalDescription);
                        const locData = determineLocation(title);

                        let location = 'Global';
                        if (locData.city) location = locData.city;
                        else if (locData.country) location = locData.country;
                        else {
                            if (title.includes('US') || title.includes('U.S.')) location = 'United States';
                            else if (title.includes('UK') || title.includes('Britain')) location = 'United Kingdom';
                            else if (title.includes('India')) location = 'India';
                        }

                        results.push({
                            title,
                            url: link,
                            source,
                            type: 'NEWS',
                            publishedAt: pubDate,
                            description: finalDescription, // Contains full text if successful
                            imageUrl,
                            location,
                            category,
                            city: locData.city,
                            country: locData.country
                        });
                    }
                } catch (e) {
                    console.log(`Failed query: ${q.type || q.term}`);
                }
            } // End of queries loop

        } catch (error) {
            console.error('Google News RSS failed', error);
        }
        return results;
    }
}
