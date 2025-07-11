<script setup>
import { useAuthStore } from '@/stores/auth';
import { useCitaStore } from '@/stores/citaStore';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const citaStore = useCitaStore();

const { resumenHoy } = storeToRefs(citaStore);
const { user } = storeToRefs(authStore);

// Métodos
const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Que tengas un excelente día de trabajo';
    if (hour < 18) return 'Esperamos que tu tarde sea productiva';
    if (hour < 23) return 'Que tengas una buena noche de descanso';
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

const formatTime = (hora) => {
    return hora?.slice(0, 5) || '—';
};

const getStatusSeverity = (status) => {
    const severities = {
        pendiente: 'warning',
        atendida: 'success',
        ausente: 'danger'
    };
    return severities[status] || 'info';
};

const goToAllAppointments = () => {
    router.push('/trabajador/citas');
};

// Lifecycle
onMounted(async () => {
    await citaStore.fetchResumenDelDia();
});
</script>

<template>
    <div class="trabajador-dashboard">
        <!-- Contenido del dashboard -->
        <div class="dashboard-content">
            <div class="container">
                <!-- Bienvenida personalizada -->
                <div class="welcome-section">
                    <Card class="welcome-card">
                        <template #content>
                            <div class="welcome-content">
                                <div v-if="user" class="welcome-text">
                                    <h1 class="welcome-title">¡Bienvenido, {{ user.nombre }}!</h1>
                                    <p class="welcome-subtitle">
                                        {{ getGreetingMessage() }}
                                    </p>
                                    <p class="current-date">
                                        <i class="pi pi-calendar mr-2"></i>
                                        {{ formatDate(new Date()) }}
                                    </p>
                                </div>
                                <div class="welcome-icon">
                                    <i class="pi pi-sun text-6xl text-yellow-400"></i>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Estadísticas del día -->
                <div v-if="resumenHoy.estadisticas" class="stats-section">
                    <div class="stats-grid">
                        <!-- Citas atendidas hoy -->
                        <Card class="stat-card">
                            <template #content>
                                <div class="stat-content">
                                    <div class="stat-icon completed">
                                        <i class="pi pi-check-circle"></i>
                                    </div>
                                    <div class="stat-info">
                                        <h3 class="stat-number">{{ resumenHoy.estadisticas.atendidas_hoy ?? 0 }}</h3>
                                        <p class="stat-label">Citas atendidas hoy</p>
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <!-- Citas pendientes hoy -->
                        <Card class="stat-card">
                            <template #content>
                                <div class="stat-content">
                                    <div class="stat-icon pending">
                                        <i class="pi pi-clock"></i>
                                    </div>
                                    <div class="stat-info">
                                        <h3 class="stat-number">{{ resumenHoy.estadisticas.pendientes_hoy ?? 0 }}</h3>
                                        <p class="stat-label">Citas pendientes hoy</p>
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <!-- Total de citas hoy -->
                        <Card class="stat-card">
                            <template #content>
                                <div class="stat-content">
                                    <div class="stat-icon total">
                                        <i class="pi pi-calendar-plus"></i>
                                    </div>
                                    <div class="stat-info">
                                        <h3 class="stat-number">{{ resumenHoy.estadisticas.total_hoy ?? 0 }}</h3>
                                        <p class="stat-label">Total citas hoy</p>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>

                <!-- Próximas citas del día -->
                <div class="appointments-section">
                    <Card class="appointments-card">
                        <template #title>
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="pi pi-calendar mr-2"></i>
                                    Próximas citas de hoy
                                </h2>
                                <Button label="Ver todas" icon="pi pi-external-link" class="p-button-text" @click="goToAllAppointments" />
                            </div>
                        </template>

                        <template #content>
                            <div v-if="resumenHoy.proximas_citas.length > 0" class="appointments-list">
                                <div v-for="cita in resumenHoy.proximas_citas" :key="cita.id" class="appointment-item">
                                    <div class="appointment-time">
                                        <div class="time-display">
                                            {{ formatTime(cita.hora) }}
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

                                    <div class="appointment-details">
                                        <h4 class="client-name">{{ cita.cliente }}</h4>
                                        <p class="service-name">
                                            <i class="pi pi-tag mr-1"></i>
                                            {{ cita.servicio }}
                                        </p>
                                        <p class="service-type">
                                            <i class="pi pi-info-circle mr-1"></i>
                                            {{ cita.es_de_pack ? 'Pack de servicios' : 'Servicio individual' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="no-appointments">
                                <i class="pi pi-calendar-times text-4xl text-gray-400 mb-3"></i>
                                <p class="no-appointments-text">No tienes citas programadas para hoy</p>
                                <p class="no-appointments-subtitle">¡Disfruta tu día libre!</p>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Toast para notificaciones -->
        <Toast />
    </div>
</template>

<style scoped>
.trabajador-dashboard {
    min-height: 100vh;
    background-color: #f8fafc;
}

/* Barra de navegación */
.navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: white;
}

.brand-text {
    font-size: 1.25rem;
    font-weight: 600;
}

.nav-menu {
    display: flex;
    gap: 2rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 500;
}

.nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
}

.nav-item.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
}

.nav-user {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
}

.user-name {
    font-weight: 500;
}

/* Contenido del dashboard */
.dashboard-content {
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Sección de bienvenida */
.welcome-section {
    margin-bottom: 2rem;
}

.welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.welcome-title {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
    opacity: 0.9;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-date {
    display: flex;
    align-items: center;
    font-size: 1rem;
    opacity: 0.8;
    margin: 0;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-icon {
    display: flex;
    align-items: center;
}

/* Sección de estadísticas */
.stats-section {
    margin-bottom: 2rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-icon.completed {
    background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.pending {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.total {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #1f2937;
}

.stat-label {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
}

/* Sección de citas */
.appointments-section {
    margin-bottom: 2rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    display: flex;
    align-items: center;
    margin: 0;
    color: #1f2937;
}

.appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.appointment-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
}

.appointment-item:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointment-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 80px;
}

.time-display {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
}

.appointment-details {
    flex: 1;
}

.client-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: #1f2937;
}

.service-name,
.service-type {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0.25rem 0;
}

.no-appointments {
    text-align: center;
    padding: 3rem 1rem;
}

.no-appointments-text {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
}

.no-appointments-subtitle {
    font-size: 0.9rem;
    color: #9ca3af;
    margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        height: auto;
        padding: 1rem;
        gap: 1rem;
    }

    .nav-menu {
        gap: 1rem;
    }

    .nav-item span {
        display: none;
    }

    .welcome-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .welcome-icon {
        order: -1;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .appointment-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .appointment-time {
        flex-direction: row;
        min-width: auto;
    }
}
</style>
