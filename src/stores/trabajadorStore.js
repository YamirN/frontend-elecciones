import { deleteTrabajador, indexTrabajador, storeTrabajador, updatePerfil, updateTrabajador } from '@/service/trabajadorService';
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
                const response = await storeTrabajador(formData);
                return response.data;
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
        },
        async actualizarPerfil(datos) {
            this.loading = true;
            this.error = null;
            try {
                const response = await updatePerfil(datos);
                this.trabajadores = response.data.data.user; // actualiza el usuario en el estado
                return {
                    success: true,
                    message: response.data.message
                };
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al actualizar perfil';
                return {
                    success: false,
                    message: this.error
                };
            } finally {
                this.loading = false;
            }
        }
    }
});
