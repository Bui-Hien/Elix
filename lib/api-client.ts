import axios from 'axios';

// Singleton Axios Instance
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // IMPORTANT: Send cookies automatically
    timeout: 10000, // 10 seconds default
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');

            // Only inject Bearer token if localStorage has one (fallback)
            if (token && token !== "undefined") {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const isAuthCheck = error.config?.url?.includes('/auth/me');
        const isUnauthorized = error.response?.status === 401;
        const isLogin = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/google-login') || error.config?.url?.includes('/auth/forgot-password');
        const isCartOrWishlist = error.config?.url?.includes('/cart') || error.config?.url?.includes('/wishlist');

        // Only log errors that are NOT auth checks for guests OR normal login failures, and ignore 401s for cart/wishlist
        if (!isAuthCheck && !isLogin && !(isUnauthorized && isCartOrWishlist)) {
            if (!error.response) {
                console.error(`❌ API Network Error (Backend down or unreachable): ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
            } else {
                console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
            }
            if (error.response?.data) {
                console.error('❌ Response:', error.response.data);
            }
        }

        // Handle 401/403 (Auto Logout logic if user has a stale token)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (typeof window !== 'undefined' && !isLogin) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    console.warn('🚪 Session expired. Clearing token.');
                    localStorage.removeItem('accessToken');
                    // Avoid reload loops, only reload if we were on a non-auth protected page
                    const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
                    if (!isAuthPage) {
                        window.location.reload();
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);



// Add custom methods to the axios instance
const extendedApiClient = Object.assign(apiClient, {
    createPaymentLink: async (orderId: string) => {
        const response = await apiClient.post<{ checkoutUrl: string }>(`/orders/${orderId}/payment-link`);
        return response as any as { checkoutUrl: string };
    }
});

export default extendedApiClient;
export { extendedApiClient as apiClient }; // Named export for compatibility

// Special client for long-running operations (like reindex)
export const longApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 120000, // 2 minutes for reindex operations
});

// Apply same interceptors to longApiClient
longApiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

longApiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('❌ Long API Error:', error.config?.method?.toUpperCase(), error.config?.url);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Response:', error.response?.data);
        return Promise.reject(error);
    }
);
