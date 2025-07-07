<script setup>
import { useAuthStore } from '@/stores/auth';
import { useCitaStore } from '@/stores/citaStore';
import { useServicioStore } from '@/stores/servicioStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const citaStore = useCitaStore();
const servicioStore = useServicioStore();

const { servicios, loading: loadingServicios, errors } = storeToRefs(servicioStore);
const { user, isAuthenticated } = storeToRefs(authStore);
const { citaTemporal, loading, error, errors: errorsCitas } = storeToRefs(citaStore);

// Client stats
const clientStats = ref({
    totalServicios: 12,
    proximaReserva: 'Mañana 10:00',
    puntosLealtad: 450
});

// Booking dialog
const showBookingDialog = ref(false);
const bookingForm = ref({
    servicio: null,
    fecha: null,
    hora: null
});

// Available services for booking
const availableServices = ref([
    { name: 'Masaje Relajante', price: 80, duration: '60 min' },
    { name: 'Facial Hidratante', price: 65, duration: '45 min' },
    { name: 'Aromaterapia', price: 90, duration: '75 min' },
    { name: 'Masaje Piedras Calientes', price: 95, duration: '90 min' },
    { name: 'Reflexología', price: 55, duration: '45 min' }
]);

const availableHours = ref(['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']);

// Recommended services
const recommendedServices = ref([
    {
        id: 1,
        name: 'Masaje Relajante',
        price: 80,
        duration: '60 min',
        description: 'Perfecto para liberar el estrés acumulado. Basado en tus servicios anteriores.',
        image: '/placeholder.svg?height=200&width=300'
    },
    {
        id: 2,
        name: 'Aromaterapia',
        price: 90,
        duration: '75 min',
        description: 'Recomendado para mejorar tu bienestar emocional y relajación profunda.',
        image: '/placeholder.svg?height=200&width=300'
    },
    {
        id: 3,
        name: 'Facial Anti-Edad',
        price: 120,
        duration: '60 min',
        description: 'Tratamiento premium para el cuidado de tu piel. ¡Oferta especial para ti!',
        image: '/placeholder.svg?height=200&width=300'
    }
]);

// Recent bookings
const recentBookings = ref([
    {
        id: 1,
        servicio: 'Masaje Relajante',
        fecha: new Date('2024-01-10'),
        hora: '10:00',
        trabajador: 'Ana López',
        estado: 'Completado',
        precio: 80
    },
    {
        id: 2,
        servicio: 'Facial Hidratante',
        fecha: new Date('2024-01-16'),
        hora: '14:00',
        trabajador: 'Sofia Martín',
        estado: 'Confirmado',
        precio: 65
    },
    {
        id: 3,
        servicio: 'Aromaterapia',
        fecha: new Date('2024-01-05'),
        hora: '16:00',
        trabajador: 'Carmen Ruiz',
        estado: 'Completado',
        precio: 90
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
        case 'Confirmado':
            return 'info';
        case 'Pendiente':
            return 'warning';
        case 'Cancelado':
            return 'danger';
        default:
            return 'info';
    }
};

const bookService = (service) => {
    bookingForm.value.servicio = service;
    showBookingDialog.value = true;
};

const confirmBooking = async () => {
    const { servicio, fecha, hora } = bookingForm.value;

    // Validación local básica
    if (!servicio || !fecha || !hora) {
        toast.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Por favor completa todos los campos de la reserva',
            life: 3000
        });
        return;
    }

    const payload = {
        servicio_id: servicio.id,
        fecha: fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
        hora
    };

    const success = await citaStore.generarCitaTemporal(payload);

    if (success) {
        // Éxito: Redirigir a MercadoPago
        toast.add({
            severity: 'success',
            summary: 'Redirigiendo al pago',
            detail: 'Serás llevado a MercadoPago para completar la reserva',
            life: 4000
        });

        // Abrir ventana de pago
        window.open(citaTemporal.value.init_point, '_blank');

        // Cerrar diálogo y resetear formulario
        showBookingDialog.value = false;
        bookingForm.value = {
            servicio: null,
            fecha: null,
            hora: null
        };
    } else {
        // Mostrar error devuelto por el store
        toast.add({
            severity: 'error',
            summary: 'Error en la reserva',
            detail: error.value || 'Ocurrió un problema al generar la cita',
            life: 4000
        });
    }
};

const rescheduleBooking = (booking) => {
    toast.add({
        severity: 'info',
        summary: 'Reagendar',
        detail: `Reagendando ${booking.servicio}`,
        life: 3000
    });
};

const rateService = (booking) => {
    toast.add({
        severity: 'info',
        summary: 'Calificar Servicio',
        detail: `Calificando ${booking.servicio}`,
        life: 3000
    });
};

const useOffer = (type) => {
    toast.add({
        severity: 'success',
        summary: 'Oferta Aplicada',
        detail: '20% de descuento aplicado a tu próxima reserva',
        life: 3000
    });
};

const viewVipPackage = () => {
    toast.add({
        severity: 'info',
        summary: 'Paquete VIP',
        detail: 'Redirigiendo a paquetes especiales...',
        life: 3000
    });
};

// Navigation methods
const goToMyBookings = () => {
    router.push({ name: 'cliente-reservas' });
};

onMounted(() => {
    servicioStore.ListaServicio();
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
        router.push({ name: 'login' });
    }
});
</script>

<template>
    <div class="p-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-6 text-center">
            <h2 class="text-4xl font-bold mb-4 text-white">¡Bienvenido de vuelta, {{ user?.nombre }}!</h2>
            <p class="text-xl mb-6 text-white">Tu bienestar es nuestra prioridad</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <Button label="Reservar Ahora" icon="pi pi-calendar-plus" size="large" class="bg-white text-blue-900 hover:bg-gray-100" @click="showBookingDialog = true" />
                <Button label="Ver Mis Reservas" icon="pi pi-list" class="bg-white text-blue-100 hover:bg-gray-100" outlined size="large" @click="goToMyBookings" />
            </div>
        </div>

        <!-- Quick Stats for Client -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-green-200 rounded-lg p-6 text-center">
                <i class="pi pi-check-circle text-4xl text-green-700 mb-3"></i>
                <h3 class="text-2xl font-bold text-gray-800">{{ clientStats.totalServicios }}</h3>
                <p class="text-gray-600 mt-2">Servicios Completados</p>
            </div>

            <div class="bg-blue-200 rounded-lg p-6 text-center">
                <i class="pi pi-calendar text-4xl text-blue-600 mb-3"></i>
                <h3 class="text-2xl font-bold text-gray-800">{{ clientStats.proximaReserva }}</h3>
                <p class="text-gray-600 mt-2">Próxima Reserva</p>
            </div>

            <div class="bg-purple-200 rounded-lg p-6 text-center">
                <i class="pi pi-star text-4xl text-purple-600 mb-3"></i>
                <h3 class="text-2xl font-bold text-gray-800">{{ clientStats.puntosLealtad }}</h3>
                <p class="text-gray-600 mt-2">Puntos de Lealtad</p>
            </div>
        </div>

        <!-- Recommended Services -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Servicios Recomendados para Ti</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="service in recommendedServices" :key="service.id" class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                    <div class="relative">
                        <img :src="service.image" :alt="service.name" class="w-full h-48 object-cover rounded-t-lg" />
                        <div class="absolute top-4 right-4">
                            <Tag value="Recomendado" severity="success" class="text-xs" />
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="text-xl font-bold text-gray-800">{{ service.name }}</h3>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-blue-600">${{ service.price }}</div>
                                <div class="text-sm text-gray-500">{{ service.duration }}</div>
                            </div>
                        </div>
                        <p class="text-gray-600 mb-4 leading-relaxed">{{ service.description }}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-500">{{ service.duration }}</span>
                            <Button label="Reservar" size="small" @click="bookService(service)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Bookings -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800">Mis Reservas Recientes</h2>
                <Button label="Ver Todas" outlined @click="goToMyBookings" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="booking in recentBookings" :key="booking.id" class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="font-semibold text-gray-800">{{ booking.servicio }}</h3>
                            <Tag :value="booking.estado" :severity="getStatusSeverity(booking.estado)" class="text-xs" />
                        </div>

                        <div class="space-y-2 text-sm text-gray-600 mb-4">
                            <div class="flex items-center">
                                <i class="pi pi-calendar mr-2"></i>
                                <span>{{ formatDate(booking.fecha) }}</span>
                            </div>
                            <div class="flex items-center">
                                <i class="pi pi-clock mr-2"></i>
                                <span>{{ booking.hora }}</span>
                            </div>
                            <div class="flex items-center">
                                <i class="pi pi-user mr-2"></i>
                                <span>{{ booking.trabajador }}</span>
                            </div>
                        </div>

                        <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span class="font-semibold text-green-600">${{ booking.precio }}</span>
                            <div class="flex space-x-2">
                                <Button v-if="booking.estado === 'Confirmado'" label="Reagendar" size="small" outlined @click="rescheduleBooking(booking)" />
                                <Button v-if="booking.estado === 'Completado'" label="Calificar" size="small" @click="rateService(booking)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Special Offers -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Ofertas Especiales para Ti</h2>
            <p class="text-xl mb-8">Aprovecha estos descuentos exclusivos</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div class="bg-white text-gray-800 rounded-lg p-6">
                    <i class="pi pi-gift text-4xl text-purple-600 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">20% OFF</h3>
                    <p class="text-gray-600 mb-4">En tu próximo masaje relajante</p>
                    <Button label="Usar Oferta" class="bg-purple-600 text-white" @click="useOffer('massage')" />
                </div>

                <div class="bg-white text-gray-800 rounded-lg p-6">
                    <i class="pi pi-star text-4xl text-yellow-500 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Paquete VIP</h3>
                    <p class="text-gray-600 mb-4">3 servicios por el precio de 2</p>
                    <Button label="Ver Paquete" class="bg-yellow-500 text-white" @click="viewVipPackage" />
                </div>
            </div>
        </div>

        <!-- Quick Booking Dialog -->
        <Dialog v-model:visible="showBookingDialog" modal header="Reservar Servicio" :style="{ width: '500px' }">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                    <Dropdown v-model="bookingForm.servicio" :options="servicios" optionLabel="nombre" placeholder="Selecciona un servicio" class="w-full" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <Calendar v-model="bookingForm.fecha" :minDate="new Date()" placeholder="Selecciona una fecha" class="w-full" dateFormat="dd/mm/yy" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                    <Dropdown v-model="bookingForm.hora" :options="availableHours" placeholder="Selecciona una hora" class="w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2">
                    <Button label="Cancelar" text @click="showBookingDialog = false" />
                    <Button label="Confirmar Reserva" @click="confirmBooking" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-purple-600 {
    --tw-gradient-to: #9333ea;
}

.from-purple-600 {
    --tw-gradient-from: #9333ea;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0));
}

.to-pink-600 {
    --tw-gradient-to: #db2777;
}

.bg-green-50 {
    background-color: #f0fdf4;
}

.bg-blue-50 {
    background-color: #eff6ff;
}

.bg-purple-50 {
    background-color: #faf5ff;
}

.text-green-600 {
    color: #16a34a;
}

.text-blue-600 {
    color: #2563eb;
}

.text-purple-600 {
    color: #9333ea;
}

.text-yellow-500 {
    color: #eab308;
}

.bg-purple-600 {
    background-color: #9333ea !important;
}

.bg-yellow-500 {
    background-color: #eab308 !important;
}

.leading-relaxed {
    line-height: 1.625;
}
</style>
