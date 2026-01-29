import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db';

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({ error: 'API Key required. Provide via x-api-key header or apiKey query param.' });
    }

    try {
        const db = await getDb();
        const keyRecord = await db.get('SELECT * FROM api_keys WHERE key = ?', [apiKey]);

        if (!keyRecord) {
            return res.status(403).json({ error: 'Invalid API Key' });
        }

        if (!keyRecord.active) {
            return res.status(403).json({ error: 'API Key is inactive' });
        }

        // Increment usage count (async, don't await/block)
        db.run('UPDATE api_keys SET requests = requests + 1 WHERE key = ?', [apiKey]);

        // Attach user info to request if needed
        (req as any).apiKeyOwner = keyRecord.owner;
        next();
    } catch (error) {
        console.error('Auth check failed', error);
        res.status(500).json({ error: 'Internal Auth Error' });
    }
}
