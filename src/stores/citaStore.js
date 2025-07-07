import { crearCitaTemporal } from '@/service/citasService';
import { defineStore } from 'pinia';

export const useCitaStore = defineStore('cita', {
    state: () => ({
        citaTemporal: null,
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async generarCitaTemporal(payload) {
            this.errors = {};
            this.error = null;
            this.loading = true;

            try {
                const response = await crearCitaTemporal(payload);
                this.citaTemporal = response;
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    this.errors = error.response.data.errors;
                } else {
                    this.error = 'Ocurrió un error al generar la cita temporal';
                    console.error('Error al crear cita temporal:', error);
                }
                return false;
            } finally {
                this.loading = false;
            }
        }
    }
});
