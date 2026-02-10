const API_BASE = '/api';

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

async function request(endpoint, options = {}) {
    const { body, ...restOptions } = options;

    const config = {
        ...restOptions,
        headers: {
            ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
        },
        ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.message || `Request failed: ${response.status}`,
            response.status,
            errorData
        );
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
}

const api = {
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError };
export default api;
