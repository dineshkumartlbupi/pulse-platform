
export const CATEGORIES = {
    CRIME: 'CRIME',
    ACCIDENT: 'ACCIDENT',
    FIRE: 'FIRE',
    EARTHQUAKE: 'EARTHQUAKE',
    FLOOD: 'FLOOD',
    OTHER: 'OTHER'
};

const KEYWORDS = {
    [CATEGORIES.CRIME]: ['murder', 'homicide', 'robbery', 'theft', 'assault', 'stabbing', 'shooting', 'arrest', 'police', 'burglary', 'gunshot', 'suspect', 'crime', 'illegal', 'drug', 'trafficking', 'kidnap'],
    [CATEGORIES.ACCIDENT]: ['accident', 'crash', 'collision', 'derailment', 'wreck', 'injured', 'casualty', 'vehicle', 'car', 'bus', 'train', 'plane', 'highway', 'traffic'],
    [CATEGORIES.FIRE]: ['fire', 'blaze', 'explosion', 'burning', 'burn', 'flames', 'firefighter', 'arson', 'smoke'],
    [CATEGORIES.EARTHQUAKE]: ['earthquake', 'tremor', 'quake', 'seismic', 'magnitude', 'aftershock', 'tectonic', 'shaking'],
    [CATEGORIES.FLOOD]: ['flood', 'inundation', 'overflow', 'heavy rain', 'storm', 'tsunami', 'water level', 'drowning', 'flash flood']
};

export function classifyContent(text: string): { category: string; severity: string; score: number } {
    const lowerText = text.toLowerCase();
    let bestCategory = CATEGORIES.OTHER;
    let maxScore = 0;

    for (const [category, words] of Object.entries(KEYWORDS)) {
        let score = 0;
        for (const word of words) {
            if (lowerText.includes(word)) {
                score++;
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    // Determine severity based on score or specific keywords
    let severity = 'LOW';
    if (maxScore > 2 || lowerText.includes('death') || lowerText.includes('dead') || lowerText.includes('critical')) {
        severity = 'HIGH';
    } else if (maxScore > 0) {
        severity = 'MEDIUM';
    }

    // If score is 0, it remains OTHER and LOW severity
    if (maxScore === 0) {
        bestCategory = CATEGORIES.OTHER;
        severity = 'LOW';
    }

    return { category: bestCategory, severity, score: maxScore };
}
