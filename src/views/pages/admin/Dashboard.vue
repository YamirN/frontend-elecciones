<script setup>
import { useDashboardStore } from '@/stores/dashboardStore';
import { computed, onMounted, ref } from 'vue';

import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

// 1. Store
const dashboardStore = useDashboardStore();
const dashboardData = computed(() => dashboardStore.dashboardData);
console.log('DashboardData inicial:', dashboardStore.dashboardData);
// 2. Estados
const loadingReservations = ref(false);
const chartData = ref(null);
const chartOptions = ref(null);

// 3. Cargar datos
onMounted(async () => {
    await dashboardStore.cargarDashboard();
});

// 4. Estado de carga
// const isLoaded = computed(() => !dashboardStore.loading && dashboardData.value.servicios_populares.length > 0);
// const reservasRecientes = computed(() => dashboardData.value.reservas_recientes ?? []);

// 5. Método para refrescar
const refreshChart = async () => {
    await dashboardStore.cargarDashboard();
};

// 6. Actualizar gráfico cuando cambie servicios_populares
// watch(
//     () => dashboardData.value?.servicios_populares,
//     (servicios) => {
//         if (!servicios || !servicios.length) return;

//         chartData.value = {
//             labels: servicios.map((s) => s.nombre),
//             datasets: [
//                 {
//                     data: servicios.map((s) => s.total),
//                     backgroundColor: ['#60A5FA', '#FBBF24', '#34D399', '#F87171', '#A78BFA'],
//                     borderColor: '#fff',
//                     borderWidth: 2
//                 }
//             ]
//         };

//         chartOptions.value = {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'bottom',
//                     labels: {
//                         usePointStyle: true,
//                         padding: 20
//                     }
//                 }
//             }
//         };
//     },
//     { immediate: true }
// );

// 7. Utilidades
const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Completado':
            return 'success';
        case 'En Curso':
            return 'info';
        case 'Confirmado':
        case 'Pendiente':
            return 'warning';
        case 'Cancelado':
            return 'danger';
        default:
            return 'info';
    }
};
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Main Content -->
        <div class="p-6">
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Servicios Vendidos -->
                <Card v-if="dashboardData.kpis_totales" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <template #content>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-500 text-sm font-medium">Servicios Vendidos</p>
                                <p class="text-3xl font-bold">
                                    {{ dashboardData.kpis_totales.totalServiciosVendidos ?? 0 }}
                                </p>
                                <p class="text-blue-500 text-xs mt-1">
                                    <i class="pi pi-arrow-up mr-1"></i>
                                    {{ dashboardData.kpis_mensuales.servicios.variacion ?? 0 }}% vs mes anterior
                                </p>
                            </div>
                            <div class="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                                <i class="pi pi-shopping-cart text-2xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Ingresos -->
                <Card v-if="dashboardData.kpis_totales" class="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <template #content>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-500 text-sm font-medium">Ingresos</p>
                                <p class="text-3xl font-bold">S/. {{ dashboardData.kpis_totales.totalIngresos ?? 0 }}</p>
                                <p class="text-green-500 text-xs mt-1">
                                    <i class="pi pi-arrow-up mr-1"></i>
                                    + {{ dashboardData.kpis_mensuales.ingresos.variacion ?? 0 }}% vs mes anterior
                                </p>
                            </div>
                            <div class="bg-green-400 bg-opacity-30 p-3 rounded-full">
                                <i class="pi pi-dollar text-2xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Clientes -->
                <Card v-if="dashboardData.value?.kpis_totales" class="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <template #content>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-purple-500 text-sm font-medium">Clientes</p>
                                <p class="text-3xl font-bold">{{ dashboardData.kpis_totales.totalClientes ?? 0 }}</p>
                                <p class="text-purple-500 text-xs mt-1">
                                    <i class="pi pi-arrow-up mr-1"></i>
                                    + {{ dashboardData.kpis_mensuales.clientes.variacion ?? 0 }}% vs mes anterior
                                </p>
                            </div>
                            <div class="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                                <i class="pi pi-users text-2xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Trabajadores -->
                <Card v-if="dashboardData.kpis_totales" class="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <template #content>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-orange-500 text-sm font-medium">Trabajadores</p>
                                <p class="text-3xl font-bold">{{ dashboardData.kpis_totales.totalTrabajadores ?? 0 }}</p>
                                <p class="text-orange-500 text-xs mt-1">
                                    <i class="pi pi-check mr-1"></i>
                                    Activos
                                </p>
                            </div>
                            <div class="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                                <i class="pi pi-id-card text-2xl"></i>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Charts and Stats Section -->
            <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                Servicios Más Vendidos Chart
                <Card class="shadow-sm rounded-2xl">
                    <template #title>
                        <div class="flex items-center justify-between px-4 pt-4">
                            <h3 class="text-lg font-semibold text-gray-800">Servicios Más Vendidos</h3>
                            <Button icon="pi pi-refresh" text @click="refreshChart" />
                        </div>
                    </template>
                    <template #content>
                        <div class="p-4">
                            <Chart v-if="isLoaded" :data="chartData" :options="chartOptions" type="doughnut" />
                            <div v-else class="text-center text-sm text-gray-400">Cargando gráfico...</div>
                        </div>
                    </template>
                </Card>

                Estadísticas Rápidas
                <Card v-if="dashboardData.estadisticas_rapidas" class="shadow-sm rounded-2xl">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 px-4 pt-4">Estadísticas Rápidas</h3>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                            Reservas Hoy
                            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-calendar text-blue-600 text-xl"></i>
                                    <span class="font-medium text-gray-700">Reservas Hoy</span>
                                </div>
                                <span class="text-2xl font-bold text-blue-600">
                                    {{ dashboardData.estadisticas_rapidas?.reservasHoy ?? 0 }}
                                </span>
                            </div>

                            Citas sin trabajador
                            <div class="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-user-minus text-purple-600 text-xl"></i>
                                    <span class="font-medium text-gray-700">Citas con trabajador sin asignar</span>
                                </div>
                                <span class="text-2xl font-bold text-purple-600">
                                    {{ dashboardData.estadisticas_rapidas?.citasSinTrabajador ?? 0 }}
                                </span>
                            </div>

                            Pendientes
                            <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg col-span-1 sm:col-span-2">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-exclamation-triangle text-yellow-600 text-xl"></i>
                                    <span class="font-medium text-gray-700">Pendientes</span>
                                </div>
                                <span class="text-2xl font-bold text-yellow-600">
                                    {{ dashboardData.estadisticas_rapidas?.pendientes ?? 0 }}
                                </span>
                            </div>
                        </div>
                    </template>
                </Card>
            </div> -->

            <!-- Reservas Recientes - Diseño en Columnas -->
            <Card class="shadow-sm rounded-2xl border border-gray-100">
                <template #title>
                    <div class="flex items-center justify-between px-4 pt-4">
                        <h3 class="text-xl font-semibold text-gray-800 tracking-tight">Reservas Recientes</h3>
                        <Button label="Ver Todas" icon="pi pi-external-link" text size="small" class="!text-primary-600 hover:underline" @click="goToReservasList" />
                    </div>
                </template>

                <template #content>
                    <div class="p-4">
                        <DataTable
                            :value="reservasRecientes"
                            stripedRows
                            responsiveLayout="scroll"
                            class="p-datatable-sm custom-datatable"
                            :loading="loadingReservations"
                            :rows="8"
                            scrollable
                            scrollHeight="400px"
                            emptyMessage="No hay reservas recientes"
                        >
                            <!-- Cliente -->
                            <Column field="cliente" header="Cliente">
                                <template #body="{ data }">
                                    <div class="flex items-center gap-3 py-2">
                                        <Avatar :label="data.cliente.charAt(0)" class="bg-blue-500 text-white font-bold shadow" size="small" shape="circle" />
                                        <span class="text-gray-800 font-medium">{{ data.cliente }}</span>
                                    </div>
                                </template>
                            </Column>

                            <!-- Servicio -->
                            <Column field="servicio" header="Servicio">
                                <template #body="{ data }">
                                    <span class="text-sm text-gray-600 py-2 block">{{ data.servicio }}</span>
                                </template>
                            </Column>

                            <!-- Fecha -->
                            <Column field="fecha" header="Fecha">
                                <template #body="{ data }">
                                    <div class="flex items-center gap-1 text-sm text-gray-700 py-2">
                                        <i class="pi pi-calendar text-gray-400" />
                                        <span>{{ formatDate(data.fecha) }}</span>
                                    </div>
                                </template>
                            </Column>

                            <!-- Hora -->
                            <Column field="hora" header="Hora">
                                <template #body="{ data }">
                                    <div class="flex items-center gap-1 text-sm text-gray-700 py-2">
                                        <i class="pi pi-clock text-gray-400" />
                                        <span>{{ data.hora }}</span>
                                    </div>
                                </template>
                            </Column>

                            <!-- Precio -->
                            <Column field="precio" header="Precio">
                                <template #body="{ data }">
                                    <div class="flex items-center gap-1 text-sm font-semibold text-green-600 py-2">
                                        <i class="pi pi-dollar text-gray-400" />
                                        <span>${{ data.precio }}</span>
                                    </div>
                                </template>
                            </Column>

                            <!-- Estado -->
                            <Column field="estado" header="Estado">
                                <template #body="{ data }">
                                    <div class="py-2 flex justify-start md:justify-end">
                                        <Tag :value="data.estado" :severity="getStatusSeverity(data.estado)" class="text-xs px-2 py-1 rounded-full" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.p-card {
    border-radius: 12px;
    border: none;
    box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.p-card:hover {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.3s ease;
}

.p-datatable .p-datatable-tbody > tr > td {
    padding: 0.75rem;
}

.p-datatable .p-datatable-thead > tr > th {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #374151;
}

/* Custom scrollbar for table */
.p-datatable-wrapper::-webkit-scrollbar {
    height: 6px;
}

.p-datatable-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.p-datatable-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.p-datatable-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }

    .p-datatable {
        font-size: 0.875rem;
    }
}
</style>
