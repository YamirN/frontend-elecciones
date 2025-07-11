import { asignarTrabajador, cambiarEstadoCita, crearCitaTemporal, historialCitasAtendidas, indexCita, listarCitasPorCliente, obtenerTrabajadoresDisponibles, resumenDelDia } from '@/service/citasService';
import { obtenerHorasDisponibles } from '@/service/servicioService';
import { defineStore } from 'pinia';

export const useCitaStore = defineStore('cita', {
    state: () => ({
        citas: [],
        citasCliente: [],
        availableHours: [],
        trabajadoresDisponibles: [],
        availableTrabajadores: [],
        resumenHoy: {
            estadisticas: {
                atendidas_hoy: {},
                pendientes_hoy: {},
                total_hoy: {}
            },
            proximas_citas: []
        },
        historialCitas: [],
        historialMeta: {},
        loadingTrabajadores: false,
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
        },
        async ListaCita() {
            try {
                const response = await indexCita();
                this.citas = response.data.data;
            } catch (error) {
                this.errors = 'Error al cargar los citas';
                console.error('Error loading citas:', error);
            }
        },
        async CitasCliente() {
            this.loading = true;
            try {
                const response = await listarCitasPorCliente();
                this.citasCliente = response.data.data;
            } catch (error) {
                console.error('Error al cargar citas del cliente:', error);
                this.errors = error.response?.data?.message || 'Error desconocido';
            } finally {
                this.loading = false;
            }
        },
        async cargarHorasDisponibles({ fecha, cliente_id, servicio_id }) {
            try {
                const response = await obtenerHorasDisponibles({ fecha, cliente_id, servicio_id });
                this.availableHours = response.data.horas;
            } catch (error) {
                console.error('Error al obtener horas disponibles:', error);
                this.availableHours = [];
            }
        },
        async cargarTrabajadoresDisponibles(fecha, hora, citaId = null, servicioId) {
            this.loadingTrabajadores = true;
            try {
                this.trabajadoresDisponibles = await obtenerTrabajadoresDisponibles(fecha, hora, citaId, servicioId);
            } catch (error) {
                console.error('Error al cargar trabajadores disponibles:', error);
                this.trabajadoresDisponibles = [];
            } finally {
                this.loadingTrabajadores = false;
            }
        },

        async asignarTrabajador({ citaId, trabajadorId }) {
            try {
                await asignarTrabajador(citaId, trabajadorId);
                return true;
            } catch (error) {
                console.error('Error al asignar trabajador:', error);
                throw error;
            }
        },
        async cambiarEstado({ citaId, estado }) {
            try {
                const response = await cambiarEstadoCita(citaId, estado);
                return response.data; // podrías usarlo para mostrar datos actualizados
            } catch (error) {
                console.error('Error al cambiar estado de la cita:', error);
                throw error; // propagar para que lo manejes en el componente
            }
        },
        async fetchResumenDelDia() {
            this.loading = true;
            try {
                const data = await resumenDelDia();
                this.resumenHoy = data;
            } catch (error) {
                console.error('Error al cargar resumen del día:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchHistorialCitas(page = 1, perPage = 5) {
            this.loading = true;
            try {
                const response = await historialCitasAtendidas({ page, per_page: perPage });
                this.historialCitas = response.data;
                this.historialMeta = response.meta;
                this.historialLinks = response.links;
            } catch (error) {
                console.error('Error al cargar historial de citas:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});
