import {
    buscarEstudiantesConFiltro,
    createEstudiante,
    deleteAllEstudiantes,
    deleteEstudiante,
    exportarEstudiantes,
    fetchEstudiante,
    fetchNombresEstudiantes,
    fetchTodosEstudiantes,
    importarEstudiantes,
    updateEstudiante
} from '@/service/estudianteService';
import { downloadFile } from '@/service/utils/downloadFile';
import { defineStore } from 'pinia';

export const useEstudianteStore = defineStore('estudiantes', {
    state: () => ({
        estudiantes: [],
        nombresEstudiantes: [],
        pagination: {
            current_page: 1,
            total: 0,
            per_page: 10
        },
        filtrosActuales: {},
        error: null,
        errors: {},
        loading: false,
        successMessage: null,
        errorMessage: null,
        loadingNombres: false,
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
            } catch (error) {
                this.error = 'Error al cargar estudiantes';
            } finally {
                this.loading = false;
            }
        },
        async cargarNombresEstudiantes(filtro = '') {
            this.loadingNombres = true;
            try {
                const response = await fetchNombresEstudiantes(filtro);
                this.nombresEstudiantes = response.data; // <-- ya es el array [{id, nombre}]
            } catch (error) {
                console.error('Error al cargar nombres de estudiantes:', error);
                this.nombresEstudiantes = [];
            } finally {
                this.loadingNombres = false;
            }
        },
        async buscarPorFiltro(filtros = null, page = 1) {
            this.loadingEstudiantes = true;
            try {
                if (filtros) {
                    this.filtrosActuales = filtros; // guardar filtros nuevos
                }
                const response = await buscarEstudiantesConFiltro(this.filtrosActuales, page);
                this.estudiantes = response.data.data;
                this.pagination = {
                    current_page: response.data.current_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                };
            } catch (error) {
                console.error('Error al buscar estudiantes:', error);
                this.estudiantes = [];
            } finally {
                this.loadingEstudiantes = false;
            }
        },
        // ✅ Crear estudiante
        async crearEstudiante(data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await createEstudiante(data);
                await this.obtenerEstudiantes(this.pagination.current_page || 1);
                return response.data;
            } catch (error) {
                this.errors = error.response?.data?.errors || {};
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // ✏️ Actualizar estudiante
        async actualizarEstudiante(id, data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await updateEstudiante(id, data);
                await this.obtenerEstudiantes(this.pagination.current_page || 1);
                return response.data;
            } catch (error) {
                this.errors = error.response?.data?.errors || {};
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 🗑️ Eliminar estudiante
        async eliminarEstudiante(id) {
            this.loading = true;
            try {
                await deleteEstudiante(id);
                this.estudiantes = this.estudiantes.filter((e) => e.id !== id);
                await this.obtenerEstudiantes(this.pagination.current_page || 1);
                return true;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar estudiante';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async eliminarTodosEstudiantes() {
            this.loading = true;
            try {
                const response = await deleteAllEstudiantes();
                this.estudiantes = []; // limpiar lista local
                this.pagination = { current_page: 1, total: 0, per_page: 10 }; // reset paginación
                return response.data; // <-- trae { message, total_eliminados }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar todos los estudiantes';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async exportar() {
            this.loading = true;
            this.error = null;
            try {
                const blob = await exportarEstudiantes();
                downloadFile(blob, 'listado_estudiantes.xlsx');
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al exportar estudiantes';
            } finally {
                this.loading = false;
            }
        },

        async importar(file) {
            this.loading = true;
            this.error = null;
            try {
                await importarEstudiantes(file);
                await this.obtenerEstudiantes(this.pagination.current_page || 1);
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al importar estudiantes';
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});
