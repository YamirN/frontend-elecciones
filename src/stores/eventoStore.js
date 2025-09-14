import { getLogs, getLogsVotar } from '@/service/eventoService';
import { defineStore } from 'pinia';

export const useEventoStore = defineStore('eventos', {
    state: () => ({
        eventos: [],
        eventosvotar: [],
        error: null,
        errors: {},
        loading: false,
        loadingVotar: false
    }),

    actions: {
        async obtenerEventos() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getLogs();
                this.eventos = response.data.data;
            } catch (err) {
                this.error = 'Error al cargar eventos';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        async obtenerEventosVotar() {
            this.loadingVotar = true;
            this.error = null;
            try {
                const response = await getLogsVotar();
                this.eventosvotar = response.data.data;
            } catch (err) {
                this.error = 'Error al cargar eventos de votacion';
                console.error(err);
            } finally {
                this.loadingVotar = false;
            }
        }
    }
});
