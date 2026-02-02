'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Shield, Activity, Database, Key } from 'lucide-react';

export default function ApiPortalPage() {
    const [stats, setStats] = useState<any>(null);
    const [owner, setOwner] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to fetch stats', err));
    }, []);

    const generateKey = async () => {
        if (!owner.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/v1/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setApiKey(data.apiKey);
            }
        } catch (error) {
            console.error('Failed to generate key', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        Pulse API Platform
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Access real-time sensitive event data from global sources.
                        Power your applications with our categorization engine.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4 hover:border-blue-500/30 transition-colors">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Database className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-sm font-medium">Total Events</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {stats?.overview?.total_items?.toLocaleString() || '...'}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4 hover:border-red-500/30 transition-colors">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-sm font-medium">Critical Alerts</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {stats?.overview?.high_severity?.toLocaleString() || '...'}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4 hover:border-purple-500/30 transition-colors">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-sm font-medium">Recent (24h)</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {stats?.overview?.recent_items?.toLocaleString() || '...'}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Get Access */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-2xl font-semibold">Get API Access</h2>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
                            {apiKey ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-400 mb-2">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">API Key Generated</span>
                                    </div>
                                    <div className="bg-black/50 border border-zinc-700 rounded-xl p-4 flex items-center justify-between group">
                                        <code className="font-mono text-zinc-300 break-all">{apiKey}</code>
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-zinc-500 bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg">
                                        Store this key safely. You won't be able to see it again.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Organization / Developer Name</label>
                                        <input
                                            type="text"
                                            value={owner}
                                            onChange={(e) => setOwner(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={generateKey}
                                        disabled={loading || !owner.trim()}
                                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Generating...' : 'Generate New Key'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Documentation */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Terminal className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-semibold">Documentation</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-mono ml-2">curl example</span>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <pre className="font-mono text-sm text-zinc-300">
                                        <span className="text-blue-400">curl</span> -X GET \<br />
                                        &nbsp;&nbsp;'http://localhost:3001/api/v1/feed?category=CRIME&severity=HIGH' \<br />
                                        &nbsp;&nbsp;-H <span className="text-green-400">'x-api-key: {apiKey || 'YOUR_API_KEY'}'</span>
                                    </pre>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-zinc-300">Available Query Parameters</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                        <code className="text-blue-400 text-sm">category</code>
                                        <p className="text-xs text-zinc-500 mt-1">CRIME, ACCIDENT, FIRE, EARTHQUAKE, FLOOD</p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                        <code className="text-blue-400 text-sm">severity</code>
                                        <p className="text-xs text-zinc-500 mt-1">HIGH, MEDIUM, LOW</p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                        <code className="text-blue-400 text-sm">city</code>
                                        <p className="text-xs text-zinc-500 mt-1">Filter by city name</p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                        <code className="text-blue-400 text-sm">search</code>
                                        <p className="text-xs text-zinc-500 mt-1">Full text search</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
