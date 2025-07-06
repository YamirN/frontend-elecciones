<script setup>
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

// User data
const userEmail = ref('');
const userName = ref('');
const userInitials = computed(() => {
    return userName.value
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
});

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

const confirmBooking = () => {
    if (bookingForm.value.servicio && bookingForm.value.fecha && bookingForm.value.hora) {
        // Simulate booking confirmation
        alert(`Reserva confirmada para ${bookingForm.value.servicio.name} el ${formatDate(bookingForm.value.fecha)} a las ${bookingForm.value.hora}`);
        showBookingDialog.value = false;
        // Reset form
        bookingForm.value = { servicio: null, fecha: null, hora: null };
    }
};

const rescheduleBooking = (booking) => {
    console.log('Reagendando reserva:', booking);
    // Implement reschedule logic
};

const rateService = (booking) => {
    console.log('Calificando servicio:', booking);
    // Implement rating logic
};

const useOffer = (type) => {
    console.log('Usando oferta:', type);
    // Implement offer usage
};

const viewVipPackage = () => {
    console.log('Viendo paquete VIP');
    // Implement VIP package view
};

// Navigation methods
const goToServices = () => {
    window.location.href = '/services';
};

const goToMyBookings = () => {
    window.location.href = '/cliente/reservas';
};

const goToProfile = () => {
    window.location.href = '/cliente/perfil';
};

const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
};

onMounted(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated || userRole !== 'cliente') {
        window.location.href = '/login';
        return;
    }

    // Load user data
    userEmail.value = localStorage.getItem('userEmail') || 'cliente@demo.com';
    userName.value = 'María García'; // In real app, fetch from API
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <!-- Header Navigation for Authenticated Client -->
        <header class="bg-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <i class="pi pi-heart text-2xl text-blue-600"></i>
                        <h1 class="text-2xl font-bold text-gray-800">SerenitySpа</h1>
                    </div>

                    <nav class="hidden md:flex space-x-6">
                        <Button label="Inicio" text class="text-blue-600 font-semibold" />
                        <Button label="Servicios" text class="text-gray-700 hover:text-blue-600" @click="goToServices" />
                        <Button label="Mis Reservas" text class="text-gray-700 hover:text-blue-600" @click="goToMyBookings" />
                        <Button label="Mi Perfil" text class="text-gray-700 hover:text-blue-600" @click="goToProfile" />
                    </nav>

                    <div class="flex items-center space-x-3">
                        <Button icon="pi pi-bell" rounded text />
                        <div class="flex items-center space-x-2">
                            <Avatar :label="userInitials" class="bg-blue-500 text-white" shape="circle" />
                            <div class="hidden md:block">
                                <p class="text-sm font-medium text-gray-700">{{ userName }}</p>
                                <p class="text-xs text-gray-500">Cliente</p>
                            </div>
                        </div>
                        <Button label="Cerrar Sesión" icon="pi pi-sign-out" text size="small" @click="logout" />
                    </div>
                </div>
            </div>
        </header>

        <!-- Welcome Banner -->
        <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">¡Bienvenido de vuelta, {{ userName }}!</h2>
                <p class="text-xl mb-6">Tu bienestar es nuestra prioridad</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button label="Reservar Ahora" icon="pi pi-calendar-plus" size="large" class="bg-white text-blue-600 hover:bg-gray-100" @click="showBookingDialog = true" />
                    <Button label="Ver Mis Reservas" icon="pi pi-list" outlined size="large" @click="goToMyBookings" />
                </div>
            </div>
        </section>

        <!-- Quick Stats for Client -->
        <section class="py-8 bg-white">
            <div class="container mx-auto px-4">
                <div class="grid md:grid-cols-3 gap-6">
                    <Card class="text-center bg-gradient-to-r from-green-50 to-green-100">
                        <template #content>
                            <div class="p-4">
                                <i class="pi pi-check-circle text-3xl text-green-600 mb-3"></i>
                                <h3 class="text-xl font-bold text-gray-800">{{ clientStats.totalServicios }}</h3>
                                <p class="text-gray-600">Servicios Completados</p>
                            </div>
                        </template>
                    </Card>

                    <Card class="text-center bg-gradient-to-r from-blue-50 to-blue-100">
                        <template #content>
                            <div class="p-4">
                                <i class="pi pi-calendar text-3xl text-blue-600 mb-3"></i>
                                <h3 class="text-xl font-bold text-gray-800">{{ clientStats.proximaReserva }}</h3>
                                <p class="text-gray-600">Próxima Reserva</p>
                            </div>
                        </template>
                    </Card>

                    <Card class="text-center bg-gradient-to-r from-purple-50 to-purple-100">
                        <template #content>
                            <div class="p-4">
                                <i class="pi pi-star text-3xl text-purple-600 mb-3"></i>
                                <h3 class="text-xl font-bold text-gray-800">{{ clientStats.puntosLealtad }}</h3>
                                <p class="text-gray-600">Puntos de Lealtad</p>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Recommended Services -->
        <section class="py-12 px-4">
            <div class="container mx-auto">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Servicios Recomendados para Ti</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <Card v-for="service in recommendedServices" :key="service.id" class="hover:shadow-lg transition-shadow duration-300">
                        <template #header>
                            <div class="relative">
                                <img :src="service.image" :alt="service.name" class="w-full h-48 object-cover" />
                                <div class="absolute top-4 right-4">
                                    <Tag value="Recomendado" severity="success" class="text-xs" />
                                </div>
                            </div>
                        </template>
                        <template #title>{{ service.name }}</template>
                        <template #subtitle>${{ service.price }}</template>
                        <template #content>
                            <p class="text-gray-600 mb-4">{{ service.description }}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">{{ service.duration }}</span>
                                <Button label="Reservar" size="small" @click="bookService(service)" />
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Recent Bookings -->
        <section class="py-12 bg-gray-50">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">Mis Reservas Recientes</h2>
                    <Button label="Ver Todas" outlined @click="goToMyBookings" />
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card v-for="booking in recentBookings" :key="booking.id" class="hover:shadow-lg transition-shadow duration-300">
                        <template #content>
                            <div class="p-4">
                                <div class="flex justify-between items-start mb-3">
                                    <h3 class="font-semibold text-gray-800">{{ booking.servicio }}</h3>
                                    <Tag :value="booking.estado" :severity="getStatusSeverity(booking.estado)" class="text-xs" />
                                </div>

                                <div class="space-y-2 text-sm text-gray-600">
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

                                <div class="flex justify-between items-center mt-4 pt-3 border-t">
                                    <span class="font-semibold text-green-600">${{ booking.precio }}</span>
                                    <div class="flex space-x-2">
                                        <Button v-if="booking.estado === 'Confirmado'" label="Reagendar" size="small" outlined @click="rescheduleBooking(booking)" />
                                        <Button v-if="booking.estado === 'Completado'" label="Calificar" size="small" @click="rateService(booking)" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Special Offers -->
        <section class="py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4">Ofertas Especiales para Ti</h2>
                <p class="text-xl mb-8">Aprovecha estos descuentos exclusivos</p>
                <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card class="bg-white text-gray-800">
                        <template #content>
                            <div class="p-6 text-center">
                                <i class="pi pi-gift text-4xl text-purple-600 mb-4"></i>
                                <h3 class="text-xl font-bold mb-2">20% OFF</h3>
                                <p class="text-gray-600 mb-4">En tu próximo masaje relajante</p>
                                <Button label="Usar Oferta" class="bg-purple-600 text-white" @click="useOffer('massage')" />
                            </div>
                        </template>
                    </Card>

                    <Card class="bg-white text-gray-800">
                        <template #content>
                            <div class="p-6 text-center">
                                <i class="pi pi-star text-4xl text-yellow-500 mb-4"></i>
                                <h3 class="text-xl font-bold mb-2">Paquete VIP</h3>
                                <p class="text-gray-600 mb-4">3 servicios por el precio de 2</p>
                                <Button label="Ver Paquete" class="bg-yellow-500 text-white" @click="viewVipPackage" />
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Quick Booking Dialog -->
        <Dialog v-model:visible="showBookingDialog" modal header="Reservar Servicio" :style="{ width: '500px' }">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                    <Dropdown v-model="bookingForm.servicio" :options="availableServices" optionLabel="name" placeholder="Selecciona un servicio" class="w-full" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <Calendar v-model="bookingForm.fecha" :minDate="new Date()" placeholder="Selecciona una fecha" class="w-full" />
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

.container {
    max-width: 1200px;
}

@media (max-width: 768px) {
    .container {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .grid {
        grid-template-columns: 1fr;
    }
}
</style>
