import { login, logout, me, refreshToken } from '@/service/auth';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
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
                const response = await login(email, password);

                if (response.data.success) {
                    await this.fetchUser(); // importante: obtiene el usuario autenticado
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
                // 🟡 Si no hay token, intenta refrescar
                if (!this.accessToken) {
                    const refreshed = await this.tryRefresh();
                    if (!refreshed) {
                        this.user = null;
                        return;
                    }
                }

                // Ya con token asegurado, hace /me
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
                const resp = await refreshToken();
                if (resp.data.token) {
                    this.accessToken = resp.data.token;
                    return true;
                }
                return false;
            } catch {
                await this.handleLogout();
                return false;
            }
        },

        async handleLogout() {
            this.loading = true;
            this.error = null;
            try {
                await logout();
            } catch (_) {
                /* no importa el error para logout */
            } finally {
                this.token = null;
                this.user = null;
                this.loading = false;
            }
        }
    }
});
