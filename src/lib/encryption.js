import CryptoJS from 'crypto-js';

// Helper to generate a consistent key for two users
const getChatKey = (uid1, uid2) => {
    // Sort to ensure same key regardless of who is sender/receiver
    const sortedIds = [uid1, uid2].sort();
    return sortedIds.join('_'); // Simple key derivation
    // In a production app, you might want to salt this or use a more complex key exchange protocol.
};

export const encryptMessage = (text, senderId, receiverId) => {
    try {
        if (!text) return '';
        const key = getChatKey(senderId, receiverId);
        return CryptoJS.AES.encrypt(text, key).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return text; // Fallback? Or fail? Fallback might look weird but potentially better than crashing.
    }
};

export const decryptMessage = (ciphertext, senderId, receiverId) => {
    try {
        if (!ciphertext) return '';
        const key = getChatKey(senderId, receiverId);
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption produces empty string (invalid key or not encrypted), check if it was plain text
        if (!originalText) {
            // Heuristic: If we can't decrypt, assume it's legacy plain text
            return ciphertext;
        }
        return originalText;
    } catch (error) {
        // If it fails (e.g. malformed), return original
        return ciphertext;
    }
};
