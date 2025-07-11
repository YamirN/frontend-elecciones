<script setup>
import { useCitaStore } from '@/stores/citaStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

// Props y datos reactivos

const currentPage = ref(0);
const itemsPerPage = ref(5);

const citaStore = useCitaStore();
const { historialCitas, historialMeta } = storeToRefs(citaStore);

// Datos de ejemplo para el historial

// Computed
const totalRecords = computed(() => historialMeta.value?.total ?? 0);

const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage.value));

// Métodos
const formatDate = (fecha) => {
    // Asume formato "15-07-2025" → podrías usar dayjs, date-fns o hacerlo a mano
    return fecha;
};

const formatTime = (hora) => {
    return hora?.slice(0, 5) ?? '';
};

const onPageChange = async (event) => {
    currentPage.value = event.page + 1; // PrimeVue usa índices desde 0
    await citaStore.fetchHistorialCitas(currentPage.value, itemsPerPage.value);
};

onMounted(async () => {
    await citaStore.fetchHistorialCitas(currentPage.value, itemsPerPage.value);
});
</script>

<template>
    <div class="appointments-section">
        <Card class="appointments-card">
            <template #title>
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="pi pi-history mr-2"></i>
                        Historial de citas
                    </h2>
                </div>
            </template>

            <template #content>
                <div v-if="Array.isArray(historialCitas) && historialCitas.length">
                    <div v-for="cita in historialCitas" :key="cita.id" class="appointment-item">
                        <!-- Columna izquierda: Fecha, hora y duración -->
                        <div class="appointment-datetime">
                            <div class="date-display">
                                {{ formatDate(cita.fecha) }}
                            </div>
                            <div class="time-display">
                                {{ formatTime(cita.hora) }}
                            </div>
                            <div class="duration-display">
                                <i class="pi pi-clock mr-1"></i>
                                {{ cita.servicio?.duracion }} min
                            </div>
                        </div>

                        <!-- Columna derecha: Cliente, estado y servicio -->
                        <div class="appointment-info">
                            <!-- Cliente y estado en la misma línea -->
                            <div class="client-status-row">
                                <div class="client-name">
                                    <i class="pi pi-user mr-2"></i>
                                    {{ cita.cliente?.nombre }} {{ cita.cliente?.apellido }}
                                </div>

                                <span
                                    class="status-tag px-3 py-1 rounded-full text-sm font-semibold capitalize"
                                    :class="{
                                        'bg-blue-100 text-blue-700': cita.estado?.toLowerCase() === 'pendiente',
                                        'bg-green-100 text-green-700': cita.estado?.toLowerCase() === 'atendida',
                                        'bg-red-100 text-red-700': ['cancelada', 'cliente_ausente'].includes(cita.estado?.toLowerCase()),
                                        'bg-gray-100 text-gray-700': !cita.estado
                                    }"
                                >
                                    {{ cita.estado }}
                                </span>
                            </div>

                            <!-- Información del servicio -->
                            <div class="service-info">
                                <div class="service-name">
                                    <i class="pi pi-tag mr-2"></i>
                                    {{ cita.servicio?.nombre }}
                                </div>
                                <div class="service-type">
                                    <i class="pi pi-info-circle mr-2"></i>
                                    {{ cita.es_de_pack ? 'Pack de servicios' : 'Servicio individual' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="no-appointments">
                    <i class="pi pi-calendar-times text-4xl text-gray-400 mb-3"></i>
                    <p class="no-appointments-text">No hay citas en el historial</p>
                    <p class="no-appointments-subtitle">Las citas completadas o pendientes aparecerán aquí</p>
                </div>

                <!-- Paginación -->
                <div v-if="totalPages > 1" class="pagination-section">
                    <Paginator :rows="itemsPerPage" :totalRecords="totalRecords" :first="(currentPage - 1) * itemsPerPage" :pageLinkSize="5" @page="onPageChange" />
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.appointments-section {
    margin-bottom: 2rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.section-title {
    display: flex;
    align-items: center;
    margin: 0;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

/* Filtros */
.filters-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

/* Lista de citas - ESPACIADO REDUCIDO */
.appointments-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem; /* Reducido de 1.5rem a 0.75rem */
}

.appointment-item {
    display: grid;
    grid-template-columns: 200px 1fr auto;
    gap: 2rem;
    align-items: start;
    padding: 0.5rem 2rem; /* Reducido el padding vertical de 2rem a 1.25rem */
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: white;
    transition: all 0.3s ease;
}

.appointment-item:hover {
    border-color: #d1d5db;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

/* Fecha y hora */
.appointment-datetime {
    display: flex;
    flex-direction: column;
    gap: 0.25rem; /* Reducido de 0.75rem a 0.5rem */
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
}

.date-display {
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    text-transform: capitalize;
}

.time-display {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
}

.duration-display {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 500;
}

/* Información de la cita */
.appointment-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Reducido de 1rem a 0.75rem */
}

.client-status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.client-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
}

.status-tag {
    font-weight: 600;
    font-size: 0.875rem;
}

.service-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Reducido de 0.5rem a 0.375rem */
}

.service-name,
.service-type {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    color: #6b7280;
    font-weight: 500;
}

.service-name {
    color: #374151;
    font-weight: 600;
}

/* Acciones */
.appointment-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-self: center;
}

/* Sin citas */
.no-appointments {
    text-align: center;
    padding: 4rem 2rem;
}

.no-appointments-text {
    font-size: 1.25rem;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
    font-weight: 500;
}

.no-appointments-subtitle {
    font-size: 1rem;
    color: #9ca3af;
    margin: 0;
}

/* Paginación */
.pagination-section {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
    .appointment-item {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1rem 1.5rem; /* Reducido también en móviles */
    }

    .appointment-datetime {
        padding: 1rem;
        gap: 0.5rem;
    }

    .client-status-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .appointment-actions {
        flex-direction: row;
        justify-content: center;
        align-self: stretch;
    }

    .section-header {
        flex-direction: column;
        align-items: stretch;
    }

    .filters-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .appointment-item {
        padding: 1rem;
    }

    .time-display {
        font-size: 1.25rem;
    }

    .client-name {
        font-size: 1.125rem;
    }
}
</style>
