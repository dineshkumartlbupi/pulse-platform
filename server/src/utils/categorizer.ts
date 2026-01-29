
export type Category = 'Business' | 'Tech' | 'Crime' | 'Politics' | 'Education' | 'Health' | 'General' | 'Entertainment' | 'Sports';

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
    'Crime': ['arrest', 'murder', 'killed', 'police', 'shooting', 'robbery', 'crime', 'court', 'jail', 'prison', 'suspect', 'stabbed'],
    'Politics': ['election', 'senate', 'congress', 'president', 'minister', 'vote', 'law', 'policy', 'campaign', 'democrat', 'republican', 'bjp', 'modi'],
    'Tech': ['ai', 'google', 'apple', 'microsoft', 'crypto', 'bitcoin', 'software', 'app', 'startup', 'cyber', 'robot'],
    'Business': ['stock', 'market', 'economy', 'inflation', 'trade', 'ceo', 'revenue', 'profit', 'bank', 'invest'],
    'Health': ['virus', 'hospital', 'doctor', 'cancer', 'vaccine', 'health', 'disease', 'mental', 'fitness'],
    'Education': ['school', 'university', 'college', 'student', 'exam', 'teacher', 'class', 'degree'],
    'Entertainment': ['movie', 'film', 'actor', 'music', 'song', 'star', 'celebrity', 'hollywood', 'bollywood'],
    'Sports': ['match', 'score', 'team', 'player', 'league', 'tournament', 'cup', 'medal', 'olympic'],
    'General': []
};

export const GLOBAL_CITIES = ['New York', 'London', 'Mumbai', 'Delhi', 'Tokyo', 'Paris', 'Dubai', 'Singapore', 'San Francisco', 'Bangalore'];

export function determineCategory(text: string): Category {
    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) return cat as Category;
    }
    return 'General';
}

export function determineLocation(text: string): { city?: string, country?: string } {
    // Simple lookup for demo purposes. In production this would use a real NER library.
    for (const city of GLOBAL_CITIES) {
        if (text.includes(city)) return { city };
    }
    if (text.includes('India')) return { country: 'India' };
    if (text.includes('USA') || text.includes('U.S.')) return { country: 'USA' };
    if (text.includes('UK')) return { country: 'UK' };

    return {};
}
