export const bannedWords = [
    // Hindi words requested by user
    'bhosadi', 'behen', 'maa ki', 'chut', 'madar', 'loda', 'lauda', 'laude', 'saale', 'chod',
    // English course words
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'bastard',
    'nigger', 'nigga', 'faggot', 'fag', 'dyke', 'retard', 'twat', 'wanker', 'crap', 'bullshit',
    'motherfucker', 'cock', 'prick'
];

/**
 * Checks if the given text contains any of the banned words or words starting with them.
 * @param {string} text - The input text to check (e.g. username, first name, last name).
 * @returns {boolean} - Returns true if profanity is detected, false otherwise.
 */
export const containsProfanity = (text) => {
    if (!text || typeof text !== 'string') return false;

    // Normalize input text to lowercase and remove leading/trailing spaces
    const normalizedText = text.toLowerCase().trim();

    // Split text into words to check prefixes (handles spaces, dashes, underscores)
    const words = normalizedText.split(/[\s_-]+/);

    for (const bannedWord of bannedWords) {
        // Handle phrases with spaces like "maa ki"
        if (bannedWord.includes(' ')) {
            if (normalizedText.includes(bannedWord)) {
                return true;
            }
        } else {
            // Check if any word starts with the banned word
            for (const word of words) {
                if (word.startsWith(bannedWord)) {
                    return true;
                }
            }
        }
    }

    return false;
};
