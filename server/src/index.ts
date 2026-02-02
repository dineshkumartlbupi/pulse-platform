import express from 'express';
import cors from 'cors';
import { getDb, initDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { engine } from './scraper/engine';
import { GoogleNewsScraper } from './scraper/googleNews';
import { InstagramScraper } from './scraper/instagram';
import { YouTubeScraper } from './scraper/youtube';
import { TwitterScraper } from './scraper/twitter';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB and Scrapers
initDb().then(() => {
    engine.register(new GoogleNewsScraper());
    engine.register(new YouTubeScraper());
    engine.register(new InstagramScraper());
    engine.register(new TwitterScraper());
    console.log('Scrapers registered');
}).catch(console.error);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.post('/api/scrape', async (req, res) => {
    try {
        const results = await engine.runAll();
        res.json({ status: 'success', count: results.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Scrape job failed' });
    }
});

// ... imports
import { authenticateApiKey } from './middleware/auth';

// ... existing code

// Public API V1 - Get Feed with Filters
app.get('/api/v1/feed', authenticateApiKey, async (req, res) => {
    try {
        const db = await getDb();
        const {
            category,
            city,
            country,
            source,
            type,
            search,
            severity,
            limit = 20,
            page = 1
        } = req.query;

        let query = 'SELECT * FROM content_items WHERE 1=1';
        const params: any[] = [];

        if (category) {
            query += ' AND category LIKE ?';
            params.push(`%${category}%`);
        }
        if (city) {
            query += ' AND city LIKE ?';
            params.push(`%${city}%`);
        }
        if (country) {
            query += ' AND country LIKE ?';
            params.push(`%${country}%`);
        }
        if (source) {
            query += ' AND source = ?';
            params.push(source);
        }
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Pagination
        const limitNum = parseInt(limit as string) || 20;
        const offset = (parseInt(page as string) - 1) * limitNum;

        query += ` ORDER BY publishedAt DESC LIMIT ? OFFSET ?`;
        params.push(limitNum, offset);

        const items = await db.all(query, params);
        res.json({
            status: 'success',
            results: items.length,
            page: parseInt(page as string) || 1,
            data: items
        });
    } catch (error) {
        console.error('API Feed Error', error);
        res.status(500).json({ error: 'Failed to retrieve feed' });
    }
});

// Admin/Dev route to generate keys (For demo purposes, in prod this would be protected)
app.post('/api/v1/register', async (req, res) => {
    try {
        const { owner } = req.body;
        if (!owner) return res.status(400).json({ error: 'Owner name required' });

        const key = uuidv4().replace(/-/g, '');
        const db = await getDb();

        await db.run('INSERT INTO api_keys (key, owner) VALUES (?, ?)', [key, owner]);

        res.json({
            status: 'success',
            message: 'API Key generated',
            apiKey: key,
            owner
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate key' });
    }
});

// Stats Endpoint for Dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const db = await getDb();
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high_severity,
                SUM(CASE WHEN scrapedAt > datetime('now', '-24 hours') THEN 1 ELSE 0 END) as recent_items
            FROM content_items
        `);

        const categoryStats = await db.all(`
            SELECT category, COUNT(*) as count 
            FROM content_items 
            GROUP BY category
        `);

        res.json({
            status: 'success',
            overview: stats,
            categories: categoryStats
        });
    } catch (error) {
        console.error('Stats Error', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Helper for Haversine Distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// Legacy endpoint for frontend (keep for compatibility or update frontend to use V1)
app.get('/api/content', async (req, res) => {
    try {
        const db = await getDb();
        const {
            category,
            city,
            country,
            source,
            type,
            search,
            limit = 50,
            location, // Add location param
            userLat,
            userLng,
            radius // radius in km
        } = req.query;

        let query = 'SELECT * FROM content_items WHERE 1=1';
        const params: any[] = [];

        if (category) {
            query += ' AND category LIKE ?';
            params.push(`%${category}%`);
        }
        // Generic location search
        if (location) {
            query += ' AND (city LIKE ? OR country LIKE ? OR location LIKE ? OR title LIKE ? OR description LIKE ?)';
            params.push(`%${location}%`, `%${location}%`, `%${location}%`, `%${location}%`, `%${location}%`);
        }
        // Specific filters if provided (though 'location' usually supersedes these in this simple UI)
        if (city) {
            query += ' AND city LIKE ?';
            params.push(`%${city}%`);
        }
        if (country) {
            query += ' AND country LIKE ?';
            params.push(`%${country}%`);
        }
        if (source) {
            query += ' AND source = ?';
            params.push(source);
        }
        if (type && type !== 'ALL') {
            query += ' AND type = ?';
            params.push(type);
        }
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY publishedAt DESC LIMIT ?';
        params.push(limit);

        let content = await db.all(query, params);

        // Radius Filtering if coords provided
        if (userLat && userLng && radius) {
            const lat = parseFloat(userLat as string);
            const lng = parseFloat(userLng as string);
            const rad = parseFloat(radius as string);

            content = content.filter(item => {
                if (!item.lat || !item.lng) return false;
                const dist = getDistanceFromLatLonInKm(lat, lng, item.lat, item.lng);
                return dist <= rad;
            });
        }

        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
