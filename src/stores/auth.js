import { loginAdmin, loginVotante } from "@/service/auth";
import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || null,
        errors: null,
        user: JSON.parse(localStorage.getItem('authUser')) || null,
    }),
    actions: {
        async handleLogin(dni) {
            try {
                const response = await loginVotante(dni);
                if (response.data.success && response.data.token) {
                    this.token = response.data.token;
                    this.user = response.data.votante;
                    sessionStorage.setItem('authToken', this.token);
                    return true;
                }

            } catch (error) {
                this.errors = error.response?.data?.message || 'Error en la autenticación.';
                return false;
            }
        },

        logout() {
            this.token = null;
            sessionStorage.removeItem('authToken') || localStorage.removeItem('authToken') || localStorage.removeItem('authUser');  // Elimina el token

        },

        // Método para verificar si el votante está autenticado
        isAuthenticated() {
            return !!this.token;  // Retorna true si hay un token
        },

        async handleLoginAdmin(email, password) {
            try {
                const response = await loginAdmin(email, password);
                if (response.data.success && response.data.token) {
                    this.token = response.data.token;
                    this.user = response.data.user;
                    localStorage.setItem('authToken', this.token);
                    localStorage.setItem('authUser', JSON.stringify(this.user)); // Guardar usuario
                    return true;
                }

            } catch (error) {

                this.errors = error.response?.data?.message || 'Error en la autenticación.';
                return false;
            }
        },
    },
});


