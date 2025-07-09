<script setup>
import { useDashboardStore } from '@/stores/dashboardStore';
import { storeToRefs } from 'pinia';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';

const dashboardStore = useDashboardStore();
const { dashboardData } = storeToRefs(dashboardStore);
// Reactive data

const quickStats = ref({
    reservasHoy: 24,
    serviciosEnCurso: 8,
    pendientes: 3
});

const loadingReservations = ref(false);

// Chart data
const chartData = ref({
    labels: ['Masaje Relajante', 'Facial Hidratante', 'Aromaterapia', 'Piedras Calientes', 'Reflexología'],
    datasets: [
        {
            data: [35, 25, 20, 12, 8],
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            borderWidth: 0
        }
    ]
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20
            }
        }
    }
});

// Reservations data
const reservasRecientes = ref([
    {
        id: 1001,
        cliente: 'María García',
        servicio: 'Masaje Relajante',
        trabajador: 'Ana López',
        fecha: new Date('2024-01-15'),
        hora: '10:00',
        estado: 'Completado',
        precio: 80
    },
    {
        id: 1002,
        cliente: 'Carlos Rodríguez',
        servicio: 'Facial Hidratante',
        trabajador: 'Sofia Martín',
        fecha: new Date('2024-01-15'),
        hora: '11:30',
        estado: 'En Curso',
        precio: 65
    },
    {
        id: 1003,
        cliente: 'Laura Fernández',
        servicio: 'Aromaterapia',
        trabajador: 'Carmen Ruiz',
        fecha: new Date('2024-01-15'),
        hora: '14:00',
        estado: 'Confirmado',
        precio: 90
    },
    {
        id: 1004,
        cliente: 'Pedro Sánchez',
        servicio: 'Masaje Piedras Calientes',
        trabajador: 'Ana López',
        fecha: new Date('2024-01-15'),
        hora: '15:30',
        estado: 'Pendiente',
        precio: 95
    },
    {
        id: 1005,
        cliente: 'Isabel Torres',
        servicio: 'Reflexología',
        trabajador: 'Sofia Martín',
        fecha: new Date('2024-01-14'),
        hora: '16:00',
        estado: 'Completado',
        precio: 55
    },
    {
        id: 1006,
        cliente: 'Miguel Herrera',
        servicio: 'Facial Anti-Edad',
        trabajador: 'Carmen Ruiz',
        fecha: new Date('2024-01-14'),
        hora: '17:30',
        estado: 'Completado',
        precio: 120
    },
    {
        id: 1007,
        cliente: 'Ana Jiménez',
        servicio: 'Exfoliación Corporal',
        trabajador: 'Ana López',
        fecha: new Date('2024-01-14'),
        hora: '09:00',
        estado: 'Cancelado',
        precio: 70
    },
    {
        id: 1008,
        cliente: 'Roberto Díaz',
        servicio: 'Masaje Relajante',
        trabajador: 'Sofia Martín',
        fecha: new Date('2024-01-13'),
        hora: '12:00',
        estado: 'Completado',
        precio: 80
    }
]);

// Methods
const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Completado':
            return 'success';
        case 'En Curso':
            return 'info';
        case 'Confirmado':
            return 'warning';
        case 'Pendiente':
            return 'warning';
        case 'Cancelado':
            return 'danger';
        default:
            return 'info';
    }
};

const refreshChart = () => {
    // Simulate data refresh
    console.log('Refreshing chart data...');
};

const refreshReservations = async () => {
    loadingReservations.value = true;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loadingReservations.value = false;
    console.log('Reservations refreshed');
};

const viewReservation = (reservation) => {
    console.log('Viewing reservation:', reservation);
    // Implement view logic
};

const editReservation = (reservation) => {
    console.log('Editing reservation:', reservation);
    // Implement edit logic
};

const deleteReservation = (reservation) => {
    console.log('Deleting reservation:', reservation);
    // Implement delete logic with confirmation
};

// const logout = () => {
//     localStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userEmail');
//     window.location.href = '/login';
// };

// onMounted(() => {
//     // Check authentication
//     const isAuthenticated = localStorage.getItem('isAuthenticated');
//     const userRole = localStorage.getItem('userRole');

//     if (!isAuthenticated || userRole !== 'admin') {
//         window.location.href = '/login';
//     }
// });

onMounted(async () => {
    await dashboardStore.cargarDashboard();
    console.log('DASHBOARD DATA:', dashboardData.value);
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Main Content -->
        <div class="p-6">
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Servicios Vendidos -->
                <Card v-if="dashboardData?.kpis_totales" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <template #content>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-100 text-sm font-medium">Servicios Vendidos</p>
                                <p class="text-3xl font-bold">
                                    {{ dashboardData.kpis_totales.totalServiciosVendido ?? 0 }}
                                </p>
                                <p class="text-blue-100 text-xs mt-1">
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
                <Card v-if="dashboardData?.kpis_totales" class="bg-gradient-to-r from-green-500 to-green-600 text-white">
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
                <Card v-if="dashboardData?.kpis_totales" class="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
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
                <Card v-if="dashboardData?.kpis_totales" class="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
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

            <!-- Charts and Tables Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Servicios Más Vendidos Chart -->
                <Card>
                    <template #title>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-800">Servicios Más Vendidos</h3>
                            <Button icon="pi pi-refresh" text @click="refreshChart" />
                        </div>
                    </template>
                    <template #content>
                        <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full h-80" />
                    </template>
                </Card>

                <!-- Quick Stats -->
                <Card>
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800">Estadísticas Rápidas</h3>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-calendar text-blue-600"></i>
                                    <span class="font-medium text-gray-700">Reservas Hoy</span>
                                </div>
                                <span class="text-xl font-bold text-blue-600">{{ quickStats.reservasHoy }}</span>
                            </div>

                            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-clock text-green-600"></i>
                                    <span class="font-medium text-gray-700">Servicios en Curso</span>
                                </div>
                                <span class="text-xl font-bold text-green-600">{{ quickStats.serviciosEnCurso }}</span>
                            </div>

                            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-exclamation-triangle text-yellow-600"></i>
                                    <span class="font-medium text-gray-700">Pendientes</span>
                                </div>
                                <span class="text-xl font-bold text-yellow-600">{{ quickStats.pendientes }}</span>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Reservas Recientes Table -->
            <Card>
                <template #title>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-800">Reservas Recientes</h3>
                    </div>
                </template>
                <template #content>
                    <DataTable :value="reservasRecientes" :paginator="true" :rows="10" :loading="loadingReservations" responsiveLayout="scroll" class="p-datatable-sm">
                        <Column field="id" header="ID" sortable style="width: 80px">
                            <template #body="slotProps">
                                <span class="font-mono text-sm">#{{ slotProps.data.id }}</span>
                            </template>
                        </Column>

                        <Column field="cliente" header="Cliente" sortable>
                            <template #body="slotProps">
                                <div class="flex items-center space-x-2">
                                    <Avatar :label="slotProps.data.cliente.charAt(0)" class="bg-blue-500 text-white" size="small" shape="circle" />
                                    <span>{{ slotProps.data.cliente }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column field="servicio" header="Servicio" sortable />

                        <Column field="trabajador" header="Trabajador" sortable />

                        <Column field="fecha" header="Fecha" sortable>
                            <template #body="slotProps">
                                <span class="text-sm">{{ formatDate(slotProps.data.fecha) }}</span>
                            </template>
                        </Column>

                        <Column field="hora" header="Hora" sortable>
                            <template #body="slotProps">
                                <span class="text-sm font-mono">{{ slotProps.data.hora }}</span>
                            </template>
                        </Column>

                        <Column field="estado" header="Estado" sortable>
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.estado" :severity="getStatusSeverity(slotProps.data.estado)" class="text-xs" />
                            </template>
                        </Column>

                        <Column field="precio" header="Precio" sortable>
                            <template #body="slotProps">
                                <span class="font-semibold text-green-600">${{ slotProps.data.precio }}</span>
                            </template>
                        </Column>

                        <Column header="Acciones" style="width: 120px">
                            <template #body="slotProps">
                                <div class="flex space-x-1">
                                    <Button icon="pi pi-eye" size="small" text @click="viewReservation(slotProps.data)" />
                                    <Button icon="pi pi-pencil" size="small" text @click="editReservation(slotProps.data)" />
                                    <Button icon="pi pi-trash" size="small" text severity="danger" @click="deleteReservation(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
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
