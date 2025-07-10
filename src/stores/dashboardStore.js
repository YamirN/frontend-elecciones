import { obtenerDashboard } from '@/service/dashboardService';
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        dashboardData: {
            kpis_totales: {},
            kpis_mensuales: {
                servicios: {},
                ingresos: {},
                clientes: {}
            },
            servicios_populares: [],
            estadisticas_rapidas: {}
        },
        loading: false,
        errors: {} // 👈 aquí se guarda error, no en `this.error`
    }),

    actions: {
        async cargarDashboard() {
            this.loading = true;
            this.errors = {}; // 👈 limpiamos errores previos

            try {
                const response = await obtenerDashboard();

                // Validamos propiedades antes de asignar
                this.dashboardData = {
                    kpis_totales: response?.kpis_totales ?? {},
                    kpis_mensuales: response?.kpis_mensuales ?? {
                        servicios: {},
                        ingresos: {},
                        clientes: {}
                    },
                    servicios_populares: response?.servicios_populares ?? [],
                    estadisticas_rapidas: response?.estadisticas_rapidas ?? {}
                };
            } catch (err) {
                this.errors.dashboard = 'No se pudo cargar el dashboard';
                console.error('[Dashboard Error]', err);
            } finally {
                this.loading = false;
            }
        }
    }
});
