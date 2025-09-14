import { votar } from '@/service/votarService';
import { defineStore } from 'pinia';

export const useVotacionStore = defineStore('votacion', {
    state: () => ({
        cargando: false,
        mensaje: null,
        error: null
    }),

    actions: {
        async registrarVoto(payload) {
            this.cargando = true;
            this.error = null;
            try {
                const { data } = await votar(payload);
                return data.data; // el voto registrado
            } catch (err) {
                this.error = err.response?.data || 'Error al registrar el voto';
                throw err;
            } finally {
                this.cargando = false;
            }
        }
    }
});
