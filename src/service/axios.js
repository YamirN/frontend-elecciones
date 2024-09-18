import axios from 'axios';

// Configuración base de Axios
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Cambia esto por la URL de tu API
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    withCredentials: true // Esto es necesario si tu API utiliza cookies para autenticación
});

// Interceptores de respuesta para manejar errores globales
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
