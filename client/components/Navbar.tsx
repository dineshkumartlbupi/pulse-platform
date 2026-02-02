'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Terminal } from 'lucide-react';

export const Navbar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                Pulse
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                href="/"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/')
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/api"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/api')
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                API Portal
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/dineshkumartlbupi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
                        >
                            <Terminal className="w-4 h-4" />
                            <span>Developer</span>
                        </a>
                        <button className="md:hidden p-2 text-zinc-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
