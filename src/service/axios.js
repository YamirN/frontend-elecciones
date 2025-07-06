import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
});

// Evita múltiples refresh simultáneos
let isRefreshing = false;
let refreshPromise = null;

// ✅ Interceptor de solicitud: añade el token si existe
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.accessToken) {
            config.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authStore = useAuthStore();
        const originalRequest = error.config;

        if (originalRequest.url.includes('/logout')) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = authStore.tryRefresh().finally(() => {
                    isRefreshing = false;
                });
            }

            const success = await refreshPromise;

            if (success) {
                return apiClient(originalRequest);
            } else {
                await authStore.handleLogout();
                return Promise.reject(error);
            }
        } catch (e) {
            await authStore.handleLogout();
            return Promise.reject(e);
        }
    }
);

export default apiClient;
