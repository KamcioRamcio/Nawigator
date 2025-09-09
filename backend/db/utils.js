// backend/db/utils.js
// Utility functions used across different query modules

export function formatDateToEuropean(date) {
    if (!date) return date;

    // Check if already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date; // Already in correct format
    }

    // Check if in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    }

    // Return original if format is unknown
    return date;
}
