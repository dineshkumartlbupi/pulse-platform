
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

export const GLOBAL_CITIES = [
    'New York', 'London', 'Mumbai', 'Delhi', 'Tokyo', 'Paris', 'Dubai', 'Singapore', 'San Francisco', 'Bangalore',
    'Lucknow', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Kanpur', 'Nagpur',
    'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
];

export function determineCategory(text: string): Category {
    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) return cat as Category;
    }
    return 'General';
}

export const CITY_COORDINATES: Record<string, { lat: number, lng: number, country: string }> = {
    'New York': { lat: 40.7128, lng: -74.0060, country: 'USA' },
    'London': { lat: 51.5074, lng: -0.1278, country: 'UK' },
    'Mumbai': { lat: 19.0760, lng: 72.8777, country: 'India' },
    'Delhi': { lat: 28.7041, lng: 77.1025, country: 'India' },
    'Tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
    'Paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
    'Dubai': { lat: 25.2048, lng: 55.2708, country: 'UAE' },
    'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
    'San Francisco': { lat: 37.7749, lng: -122.4194, country: 'USA' },
    'Bangalore': { lat: 12.9716, lng: 77.5946, country: 'India' },
    'Lucknow': { lat: 26.8467, lng: 80.9461, country: 'India' },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, country: 'India' },
    'Chennai': { lat: 13.0827, lng: 80.2707, country: 'India' },
    'Kolkata': { lat: 22.5726, lng: 88.3639, country: 'India' },
    'Pune': { lat: 18.5204, lng: 73.8567, country: 'India' },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, country: 'India' },
    'Jaipur': { lat: 26.9124, lng: 75.7873, country: 'India' },
    'Surat': { lat: 21.1702, lng: 72.8311, country: 'India' },
    'Kanpur': { lat: 26.4499, lng: 80.3319, country: 'India' },
    'Nagpur': { lat: 21.1458, lng: 79.0882, country: 'India' },
    'Indore': { lat: 22.7196, lng: 75.8577, country: 'India' },
    'Thane': { lat: 19.2183, lng: 72.9781, country: 'India' },
    'Bhopal': { lat: 23.2599, lng: 77.4126, country: 'India' },
    'Visakhapatnam': { lat: 17.6868, lng: 83.2185, country: 'India' },
    'Patna': { lat: 25.5941, lng: 85.1376, country: 'India' },
    'Vadodara': { lat: 22.3072, lng: 73.1812, country: 'India' },
    'Ghaziabad': { lat: 28.6692, lng: 77.4538, country: 'India' },
    'Ludhiana': { lat: 30.9010, lng: 75.8573, country: 'India' },
    'Agra': { lat: 27.1767, lng: 78.0081, country: 'India' },
    'Nashik': { lat: 19.9975, lng: 73.7898, country: 'India' }
};

export function determineLocation(text: string): { city?: string, country?: string, lat?: number, lng?: number } {
    // Simple lookup for demo purposes. In production this would use a real NER library.
    for (const city of GLOBAL_CITIES) {
        // Case-insensitive check
        const regex = new RegExp(`\\b${city}\\b`, 'i');
        if (regex.test(text)) {
            const coords = CITY_COORDINATES[city];
            return {
                city,
                country: coords ? coords.country : 'India',
                lat: coords?.lat,
                lng: coords?.lng
            };
        }
    }

    // Check for specific countries if no city found
    if (text.includes('India')) return { country: 'India' };
    if (text.includes('USA') || text.includes('U.S.')) return { country: 'USA' };
    if (text.includes('UK')) return { country: 'UK' };
    if (text.includes('Canada')) return { country: 'Canada' };
    if (text.includes('Australia')) return { country: 'Australia' };

    return {};
}
