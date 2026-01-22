// API Configuration
const API_BASE_URL = '/api';

// API Helper Functions
const api = {
    // Get token from localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Set token in localStorage
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    // Remove token from localStorage
    removeToken: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
    },

    // Make API request
    request: async (url, options = {}) => {
        const token = api.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            
            // Read response as text first, then parse as JSON
            const text = await response.text();
            let data;
            
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                // If JSON parsing fails, create a simple error object
                data = { message: text || `Request failed with status ${response.status}` };
            }

            if (!response.ok) {
                const errorMessage = data.message || data.err?.message || `Request failed with status ${response.status}`;
                const error = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }

            return data;
        } catch (error) {
            // If it's already an Error object with a message, re-throw it
            if (error instanceof Error && error.message) {
                throw error;
            }
            // Otherwise wrap it
            throw new Error(error.message || 'An error occurred');
        }
    },

    // GET request
    get: async (url) => {
        return api.request(url, { method: 'GET' });
    },

    // POST request
    post: async (url, body) => {
        return api.request(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT request
    put: async (url, body) => {
        return api.request(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE request
    delete: async (url) => {
        return api.request(url, { method: 'DELETE' });
    }
};
