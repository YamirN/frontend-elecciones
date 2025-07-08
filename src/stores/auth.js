import { login, logout, me, refreshToken } from '@/service/auth';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),
    getters: {
        rol: (state) => state.user?.rol || null,
        isAuthenticated: (state) => !!state.user,
        nombreCompleto: (state) => (state.user ? `${state.user.nombre} ${state.user.apellido}` : '')
    },
    actions: {
        async handleLogin(email, password) {
            this.loading = true;
            this.error = null;

            try {
                const response = await login(email, password); // ← Esto debería dejar una cookie en backend
                if (response.data.success) {
                    await this.fetchUser();
                    return true;
                }
                this.error = 'Credenciales inválidas';
                return false;
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al iniciar sesión';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchUser() {
            this.loading = true;
            try {
                const response = await me();
                this.user = response.data.user;
            } catch (err) {
                this.user = null;
                this.error = err.response?.data?.message || 'Error al obtener el usuario';
            } finally {
                this.loading = false;
            }
        },

        async tryRefresh() {
            try {
                await refreshToken(); // Laravel debería renovar el token y/o sesión
                return true;
            } catch {
                await this.handleLogout();
                return false;
            }
        },

        async handleLogout() {
            try {
                await logout(); // borra cookie en backend
            } catch (_) {
                /* No importa el error de logout */
            } finally {
                this.clearSession();
            }
        },

        clearSession() {
            this.user = null;
            this.loading = false;
            this.error = null;
            this.$reset();
        }
    }
});
