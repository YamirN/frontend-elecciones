import { asignarCandidatos, obtenerCandidatos } from '@/service/candidateService';
import { defineStore } from 'pinia';

export const useCandidatoStore = defineStore('candidato', {
    state: () => ({
        candidatos: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaCandidatosPorPartido(partidoId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await obtenerCandidatos(partidoId);
                this.candidatos = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar candidatos';
                this.candidatos = [];
            } finally {
                this.loading = false;
            }
        },
        async asignarCandidatos(partidoId, eleccionId, candidatos) {
            this.loading = true;
            this.error = null;
            try {
                const payload = {
                    partido_id: partidoId,
                    eleccion_id: eleccionId,
                    candidatos
                };
                await asignarCandidatos(payload);
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al asignar candidatos';
                throw error; // para que el componente pueda atraparlo
            } finally {
                this.loading = false;
            }
        },

        reset() {
            this.candidatos = [];
            this.errors = null;
            this.loading = false;
        }
    }
});
