import { createMesa, deleteMesa, fetchMesas } from '@/service/mesaSufragioService';
import { defineStore } from 'pinia';

export const useMesaSufragioStore = defineStore('mesaSufragio', {
    state: () => ({
        mesas: [],
        error: null,
        errors: {}
    }),

    actions: {
        async getMesas() {

            try {
                const response = await fetchMesas();
                this.mesas = response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar las mesas.';
            }
        },

        async addMesa(form) {
            try {
                const response = await createMesa(form);

                if (response.data) {
                    await this.getMesas();
                    return true;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear la mesa.';
            }
        },
        async removeMesa(id) {
            try {
                await deleteMesa(id); // Llamar al servicio para eliminar
                await this.getMesas(); // Recargar mesas después de eliminar
                return true; // Operación exitosa
            } catch (error) {

                this.error = error.response?.data?.message || 'Error al eliminar la mesa.';
                return false; // Fallo
            }
        },

    },
});