import { deleteTrabajador, indexTrabajador, storeTrabajador, updateTrabajador } from '@/service/trabajadorService';
import { defineStore } from 'pinia';

export const useTrabajadorStore = defineStore('trabajador', {
    state: () => ({
        trabajadores: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaTrabajador() {
            try {
                const response = await indexTrabajador();
                this.trabajadores = response.data.data;
            } catch (error) {
                this.errors = 'Error al cargar los trabajadores';
                console.error('Error loading trabajadores:', error);
            }
        },
        async crearTrabajador(formData) {
            this.errors = {};
            try {
                await storeTrabajador(formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    this.errors = error.response.data.errors;
                    return false;
                }
                console.error('Error inesperado al crear el trabajador:', error);
                return false; // 👈 también devuelve false aquí
            }
        },

        async actualizarTrabajador(formData, id) {
            try {
                await updateTrabajador(id, formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    throw error;
                }
                console.error('Error al actualizar trabajador:', error);
                throw new Error('Error inesperado al actualizar el trabajador');
            }
        },

        async eliminarTrabajador(id) {
            try {
                await deleteTrabajador(id);
                return true;
            } catch (error) {
                console.error('Error al eliminar trabajador:', error);
                return false;
            }
        }
    }
});
