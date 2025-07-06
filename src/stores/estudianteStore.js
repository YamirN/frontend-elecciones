import { buscarEstudiantesPorNombre, fetchEstudiante, fetchTodosEstudiantes } from '@/service/estudianteService';
import { defineStore } from 'pinia';

export const useEstudianteStore = defineStore('estudiante', {
    state: () => ({
        estudiantes: [],
        pagination: {
            current_page: 1,
            total: 0,
            per_page: 10
        },
        error: null,
        errors: {},
        loading: false,
        successMessage: null,
        errorMessage: null,
        estudiantesFiltrados: [],
        loadingEstudiantes: false
    }),

    actions: {
        async obtenerEstudiantes(page = 1) {
            const response = await fetchEstudiante(page);
            this.estudiantes = response.data.data;
            this.pagination = {
                current_page: response.data.current_page,
                total: response.data.total,
                per_page: response.data.per_page
            };
        },
        async cargarTodosEstudiantes() {
            this.loading = true;
            try {
                const response = await fetchTodosEstudiantes();
                this.estudiantes = response.data.data;
                console.log('estudiantes:', this.estudiantes);
            } catch (error) {
                this.error = 'Error al cargar estudiantes';
            } finally {
                this.loading = false;
            }
        },
        async buscarPorNombre(nombre) {
            this.loadingEstudiantes = true;
            try {
                const response = await buscarEstudiantesPorNombre(nombre);
                this.estudiantes = response.data.data;
                console.log(this.estudiantes);
            } catch (error) {
                console.error('Error al buscar estudiantes:', error);
                this.estudiantes = [];
            } finally {
                this.loadingEstudiantes = false;
            }
        }

        // async EliminarTodosLosVotantes() {
        //     try {
        //         await DeleteAllVoter();

        //         this.votantes = []; // Limpia la lista localmente
        //         return true;
        //     } catch (error) {
        //         // Maneja errores, por ejemplo, mostrando un mensaje de error
        //         console.error('Error eliminando votantes:', error);
        //         this.error = error.response?.data?.error || 'Error desconocido al eliminar los votantes';
        //         return false;
        //     }
        // },
        // async importarVotantes(file) {
        //     this.loading = true; // Iniciar la carga
        //     this.successMessage = null; // Limpiar el mensaje de éxito previo
        //     this.errorMessage = null; // Limpiar el mensaje de error previo

        //     try {
        //         const response = await importVotantes(file); // Llamada al servicio
        //         if (response.success) {
        //             await this.ObtenerVotantes();
        //             this.successMessage = response.message; // Mensaje de éxito
        //             return true; // Mostrar mensaje de éxito
        //         } else {
        //             this.errorMessage = response.message; // Mensaje de error específico
        //             throw new Error(response.message);
        //         }
        //     } catch (error) {
        //         // Manejo de errores: si hay detalles en el error de la API, úsalos
        //         if (error.response?.data?.message) {
        //             this.errorMessage = error.response.data.message; // Mensaje del backend
        //         } else if (error.message) {
        //             this.errorMessage = error.message; // Mensaje genérico del error
        //         } else {
        //             this.errorMessage = 'Ocurrió un error inesperado al importar los votantes.';
        //         }
        //         throw new Error(this.errorMessage); // Lanza el error para ser capturado
        //     } finally {
        //         this.loading = false; // Finalizar la carga
        //     }
        // }
    }
});
