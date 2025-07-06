import { indexEleccion } from '@/service/eleccionesService';
import { defineStore } from 'pinia';

export const useEleccionStore = defineStore('eleccion', {
    state: () => ({
        elecciones: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaEleccion() {
            this.loading = true;
            try {
                const response = await indexEleccion();
                this.elecciones = response.data;
                this.error = null;
            } catch (error) {
                this.errors = 'Error al cargar las elecciones';
                console.error('Error loading elecciones:', error);
            } finally {
                this.loading = false;
            }
        }

        // async crearCandidato(form) {
        //     try {
        //         form.fecha_postulacion = formatDateForCreateUsers(form.fecha_postulacion);
        //         const response = await createCandidate(form);

        //         if (response.data.success) {
        //             await this.ObtenerCandidatos();
        //             return true;
        //         }
        //     } catch (error) {
        //         if (error.response && error.response.data && error.response.data.errors) {
        //             this.errors = error.response.data.errors; // Guardar los errores por cada campo
        //         } else {
        //             this.errors = { general: ['Error al crear el candidato'] }; // Error genérico si no hay detalles
        //         }
        //         console.error('Error creando candidato:', error);
        //         return false;
        //     }
        // }
        // async actualizarCandidato(form) {
        //     try {
        //         if (form.fecha_postulacion) {
        //             const formattedDate = formatDateForApi(form.fecha_postulacion);
        //             if (formattedDate) {
        //                 form.fecha_postulacion = formattedDate;
        //             }
        //         }

        //         await updateCandidate(form);
        //         await this.ObtenerCandidatos();
        //         return { success: true, message: 'Candidato actualizado' };
        //     } catch (error) {
        //         this.errors = error.response?.data?.errors || {};
        //         console.error('Error actualizando candidato:', error);
        //         return { success: false, error: this.errors };
        //     }
        // }
    }
});
