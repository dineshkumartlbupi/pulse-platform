'use client';

import { useEffect, useState } from 'react';
import { ContentCard } from './ContentCard';
import { RefreshCw, Filter, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const Feed = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScraping, setIsScraping] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const CATEGORIES = ['ALL', 'Business', 'Tech', 'Crime', 'Politics', 'Education', 'Health', 'Entertainment', 'Sports'];

    const [category, setCategory] = useState('ALL');
    const [locationInput, setLocationInput] = useState('');

    const fetchContent = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter !== 'ALL') params.append('type', filter);
            if (category !== 'ALL') params.append('category', category);
            if (locationInput.trim()) params.append('location', locationInput);

            const res = await fetch(`http://localhost:3001/api/content?${params.toString()}`);
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    // ... scrape logic ...
    const triggerScrape = async () => {
        try {
            setIsScraping(true);
            await fetch('http://localhost:3001/api/scrape', { method: 'POST' });
            // Poll or wait, then refresh
            setTimeout(fetchContent, 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setIsScraping(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchContent, 500); // Debounce location typing
        return () => clearTimeout(timeout);
    }, [filter, category, locationInput]);

    // ... render ...

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col gap-6 mb-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Pulse Feed
                        </h1>
                        <p className="text-zinc-400 text-sm">Real-time content aggregator</p>
                    </div>

                    <button
                        onClick={triggerScrape}
                        disabled={isScraping}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
                        {isScraping ? 'Scraping...' : 'Refresh'}
                    </button>
                </div>

                {/* Filters Section */}
                <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Filter className="w-4 h-4" />
                        <span>Filters:</span>
                    </div>

                    {/* Type Filter */}
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        {['ALL', 'NEWS', 'VIDEO', 'SOCIAL'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-zinc-800 mx-2 hidden md:block"></div>

                    {/* Location Filter Input */}
                    <div className="relative flex items-center gap-2">
                        <div className="relative flex items-center">
                            <MapPin className="absolute left-3 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Filter by Location"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-blue-500/50 w-32 sm:w-48 placeholder:text-zinc-600"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if ('geolocation' in navigator) {
                                    navigator.geolocation.getCurrentPosition(async (position) => {
                                        const { latitude, longitude } = position.coords;
                                        try {
                                            // Free reverse geocoding to get city
                                            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                                            const data = await res.json();
                                            if (data.city) setLocationInput(data.city);
                                            else if (data.locality) setLocationInput(data.locality);
                                            else if (data.principalSubdivision) setLocationInput(data.principalSubdivision);
                                        } catch (e) {
                                            console.error('Geo error', e);
                                        }
                                    });
                                } else {
                                    alert('Geolocation not supported');
                                }
                            }}
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-blue-500/30 flex items-center gap-1"
                        >
                            <MapPin className="w-3 h-3" /> Near Me
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${category === cat
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-zinc-900/50 rounded-xl border border-zinc-800/50"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item, idx) => (
                        <ContentCard key={item.id} {...item} index={idx} />
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-full py-20 text-center text-zinc-500">
                            No content found for this filter.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
