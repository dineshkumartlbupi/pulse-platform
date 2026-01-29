import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  return db;
}

export async function initDb() {
  const database = await getDb();
  await database.exec(`
    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      description TEXT,
      imageUrl TEXT,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      publishedAt TEXT,
      scrapedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      tags TEXT,
      location TEXT,
      category TEXT,
      city TEXT,
      country TEXT,
      lat REAL,
      lng REAL
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      status TEXT,
      message TEXT,
      source TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      owner TEXT,
      plan TEXT DEFAULT 'free',
      requests INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Database initialized');
}
