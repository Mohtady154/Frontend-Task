const USE_MOCK_SERVER = import.meta.env.VITE_USE_MOCK;
const MOCK_API_URL = import.meta.env.VITE_API_URL_MOCK;
const PROD_API_URL = import.meta.env.VITE_API_URL_PRODUCTION;
console.log(USE_MOCK_SERVER, MOCK_API_URL, PROD_API_URL);

/**
 * Helper to get the full URL for a resource.
 * If using the mock server (API_URL is set and USE_MOCK_SERVER is true), returns `${API_URL}/${resource}`.
 * Otherwise, returns `/data/${resource}.json` (static file).
 * 
 * @param {string} resource - The resource name (e.g., 'authors', 'books').
 * @returns {string} The full URL.
*/
export const getApiUrl = (resource) => {
    const API_URL = USE_MOCK_SERVER === 'true' ? MOCK_API_URL : PROD_API_URL;
    if (API_URL) {
        return `${API_URL}/${resource}`;
    }
    return `/data/${resource}.json`;
};

export default {
    USE_MOCK_SERVER,
    getApiUrl,
};
