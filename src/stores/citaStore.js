import { asignarTrabajador, crearCitaTemporal, indexCita, listarCitasPorCliente, obtenerTrabajadoresDisponibles } from '@/service/citasService';
import { obtenerHorasDisponibles } from '@/service/servicioService';
import { formatFechaBackend } from '@/service/utils/formatFechaBackend';
import { defineStore } from 'pinia';

export const useCitaStore = defineStore('cita', {
    state: () => ({
        citas: [],
        citasCliente: [],
        availableHours: [],
        trabajadoresDisponibles: [],
        availableTrabajadores: [],
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
        async cargarTrabajadoresDisponibles(fecha, hora, citaId = null) {
            this.loadingTrabajadores = true;
            try {
                const fechaFormateada = formatFechaBackend(fecha);

                console.log('📤 Enviando a API:', {
                    fecha: fechaFormateada,
                    hora,
                    citaId
                });

                this.trabajadoresDisponibles = await obtenerTrabajadoresDisponibles(fechaFormateada, hora, citaId);
            } catch (error) {
                console.error('❌ Error al cargar trabajadores disponibles:', error);
                this.trabajadoresDisponibles = [];
            } finally {
                this.loadingTrabajadores = false;
            }
        },
        async asignarTrabajador({ citaId, trabajadorId }) {
            try {
                await asignarTrabajador(citaId, trabajadorId);
            } catch (error) {
                console.error('Error al asignar trabajador:', error);
                throw error;
            }
        }
    }
});
