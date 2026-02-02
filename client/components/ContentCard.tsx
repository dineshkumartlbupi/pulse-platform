'use client';

import { Share2, Link, Calendar, Youtube, Newspaper, Instagram, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export type ContentType = 'NEWS' | 'VIDEO' | 'SOCIAL';

interface ContentCardProps {
    id: string;
    title: string;
    url: string;
    source: string;
    type: ContentType;
    publishedAt: string;
    imageUrl?: string;
    description?: string;
    location?: string;
    category?: string;
    severity?: string;
    index: number;
    city?: string;
    country?: string;
}

const SourceIcon = ({ type }: { type: ContentType }) => {
    switch (type) {
        case 'VIDEO': return <Youtube className="w-4 h-4 text-red-500" />;
        case 'SOCIAL': return <Instagram className="w-4 h-4 text-pink-500" />;
        case 'NEWS': default: return <Newspaper className="w-4 h-4 text-blue-500" />;
    }
};

const DEFAULT_IMAGES = {
    NEWS: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', // News/Abstract
    VIDEO: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80', // Abstract Video/Play
    SOCIAL: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' // Social/Connect
};

export const ContentCard = ({ title, url, source, type, publishedAt, imageUrl, description, location, category, severity, index, city, country }: ContentCardProps) => {
    const [imgSrc, setImgSrc] = useState<string>(imageUrl || DEFAULT_IMAGES[type]);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(imageUrl || DEFAULT_IMAGES[type]);
        setHasError(false);
    }, [imageUrl, type]);

    const handleImageError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(DEFAULT_IMAGES[type]);
        }
    };

    const isFresh = (new Date().getTime() - new Date(publishedAt).getTime()) < (1000 * 60 * 60); // < 1 hour

    const getSeverityColor = (sev?: string) => {
        if (sev === 'HIGH') return 'bg-red-600 text-white animate-pulse';
        if (sev === 'MEDIUM') return 'bg-orange-500/20 text-orange-400 border-orange-500/50 border';
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50 border';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-900/40 transition-colors group cursor-pointer relative overflow-hidden"
        >
            {isFresh && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-red-500/20 shadow-lg z-10">
                    LIVE
                </div>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden bg-zinc-800 rounded-lg mb-3">
                    <img
                        src={imgSrc}
                        alt={title}
                        onError={handleImageError}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-white border border-white/10">
                            <SourceIcon type={type} />
                            {source}
                        </div>
                        {category && category !== 'OTHER' && (
                            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium text-white border border-white/10 uppercase tracking-wider">
                                {category}
                            </div>
                        )}
                    </div>

                    {severity && (
                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-bold ${getSeverityColor(severity)} backdrop-blur-sm`}>
                            {severity} PRIORITY
                        </div>
                    )}
                </div>

                <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
                        </div>
                        {(city || country || (location && location !== 'Global')) && (
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <MapPin className="w-3 h-3" />
                                <span>{city ? `${city}, ${country || ''}` : (country || location)}</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
                        <span className="flex items-center gap-1 hover:text-white transition-colors">
                            <Link className="w-3 h-3" />
                            Read source
                        </span>
                        <button className="hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </a>
        </motion.div>
    );
};
