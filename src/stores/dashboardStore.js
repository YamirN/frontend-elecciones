import { obtenerDashboard } from '@/service/dashboardService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        dashboardData: ref(null),
        loading: false,
        errors: {}
    }),

    actions: {
        async cargarDashboard() {
            this.loading = true;
            this.error = null;

            try {
                const response = await obtenerDashboard();
                this.dashboardData = response.data;
                console.log('dashboardData', this.dashboardData);
            } catch (err) {
                this.error = 'No se pudo cargar el dashboard';
                console.error(err);
            } finally {
                this.loading = false;
            }
        }
    }
});
