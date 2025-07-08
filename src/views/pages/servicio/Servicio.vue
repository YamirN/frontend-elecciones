<script setup>
import { useServicioStore } from '@/stores/servicioStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Reactive data
const router = useRouter();
const searchQuery = ref('');
const showBookingDialog = ref(false);
const selectedService = ref(null);

const servicioStore = useServicioStore();
const { servicios } = storeToRefs(servicioStore);

// Computed properties
const filteredServices = computed(() => {
    let filtered = servicios.value || [];

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((service) => service.nombre.toLowerCase().includes(query) || service.descripcion.toLowerCase().includes(query));
    }

    return filtered;
});

const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h ? `${h}h ` : ''}${m}min`;
};

// Methods

const bookService = (service) => {
    selectedService.value = service;
    showBookingDialog.value = true;
};

const goToHome = () => {
    window.location.href = '/';
};

const goToLogin = () => {
    router.push('/login');
};

const goToRegister = () => {
    window.location.href = '/registrar';
};

const goToLoginFromDialog = () => {
    showBookingDialog.value = false;
    // Store selected service in localStorage for after login
    localStorage.setItem('selectedService', JSON.stringify(selectedService.value));
    window.location.href = '/login';
};

const goToRegisterFromDialog = () => {
    showBookingDialog.value = false;
    // Store selected service in localStorage for after registration
    localStorage.setItem('selectedService', JSON.stringify(selectedService.value));
    window.location.href = '/registrar';
};

const openWhatsApp = () => {
    const phoneNumber = '1234567890';
    const message = 'Hola, me gustaría obtener más información sobre sus servicios de spa.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

const callNow = () => {
    window.location.href = 'tel:+1234567890';
};

onMounted(() => {
    // Check if there's a selected service from localStorage (after login/register)
    const storedService = localStorage.getItem('selectedService');
    if (storedService) {
        selectedService.value = JSON.parse(storedService);
        localStorage.removeItem('selectedService');
        // Could automatically open booking form here if user is authenticated
    }
});

onMounted(async () => {
    await Promise.all([servicioStore.ListaServicio()]);
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <!-- Header Navigation -->
        <header class="bg-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <img src="@/assets/img/spa.jpg" alt="Logo" class="h-10 w-auto ring-2 ring-white/20" />
                        <h1 class="text-2xl font-bold text-gray-800">DejavuSpa</h1>
                    </div>

                    <nav class="hidden md:flex space-x-6">
                        <Button label="Inicio" text class="text-gray-700 hover:text-blue-600" @click="goToHome" />
                        <Button label="Servicios" text class="text-blue-600 font-semibold" />
                        <Button label="Galería" text class="text-gray-700 hover:text-blue-600" />
                        <Button label="Contacto" text class="text-gray-700 hover:text-blue-600" />
                    </nav>

                    <div class="flex space-x-2">
                        <Button label="Iniciar Sesión" outlined size="small" @click="goToLogin" />
                        <Button label="Registrarse" size="small" @click="goToRegister" />
                    </div>
                </div>
            </div>
        </header>

        <!-- Page Header -->
        <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
            <div class="container mx-auto px-4 text-center">
                <h1 class="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h1>
                <p class="text-xl md:text-2xl mb-8">Descubre la experiencia perfecta para tu bienestar</p>
                <div class="max-w-md mx-auto">
                    <div class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Buscar servicios..." class="w-full" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Services Grid -->
        <section class="py-12">
            <div class="container mx-auto px-4">
                <div v-if="filteredServices.length === 0" class="text-center py-12">
                    <i class="pi pi-search text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-2xl font-semibold text-gray-600 mb-2">No se encontraron servicios</h3>
                    <p class="text-gray-500">Intenta con otros términos de búsqueda</p>
                </div>

                <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card v-for="service in filteredServices" :key="service.id" class="service-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <template #header>
                            <div class="relative overflow-hidden">
                                <img :src="service.imagen" :alt="service.nombre" class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" />
                            </div>
                        </template>

                        <template #title>
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-bold text-gray-800">{{ service.nombre }}</h3>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-blue-600">S/. {{ service.precio }}</div>
                                    <div class="text-sm text-gray-500">{{ formatDuration(service.duracion) }}</div>
                                </div>
                            </div>
                        </template>

                        <template #content>
                            <div class="space-y-4">
                                <p class="text-gray-600 leading-relaxed">{{ service.descripcion }}</p>

                                <div class="flex items-center justify-between pt-4 border-t">
                                    <div class="flex items-center space-x-2">
                                        <Button label="Reservar" icon="pi pi-calendar" class="p-button-sm" @click="bookService(service)" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
                <p class="text-xl mb-8">Contáctanos y te ayudaremos a encontrar el tratamiento perfecto para ti</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button label="Contactar por WhatsApp" icon="pi pi-whatsapp" severity="success" size="large" @click="openWhatsApp" />
                    <Button label="Llamar Ahora" icon="pi pi-phone" outlined size="large" @click="callNow" />
                </div>
            </div>
        </section>

        <!-- Booking Confirmation Dialog -->
        <Dialog v-model:visible="showBookingDialog" modal header="Confirmar Reserva" :style="{ width: '450px' }">
            <div v-if="selectedService" class="space-y-4">
                <div class="text-center">
                    <img :src="selectedService.imagen" :alt="selectedService.nombre" class="w-24 h-24 object-cover rounded-lg mx-auto mb-4" />
                    <h3 class="text-xl font-bold">{{ selectedService.nombre }}</h3>
                    <p class="text-gray-600">{{ formatDuration(selectedService.duracion) }} - S/. {{ selectedService.precio }}</p>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-center text-blue-800">
                        <i class="pi pi-info-circle mr-2"></i>
                        Para realizar una reserva necesitas iniciar sesión o crear una cuenta
                    </p>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2">
                    <Button label="Cancelar" text @click="showBookingDialog = false" />
                    <Button label="Iniciar Sesión" @click="goToLoginFromDialog" />
                    <Button label="Registrarse" outlined @click="goToRegisterFromDialog" />
                </div>
            </template>
        </Dialog>

        <!-- WhatsApp Floating Button -->
        <Button icon="pi pi-whatsapp" rounded severity="success" class="fixed bottom-6 right-6 z-40 shadow-lg" size="large" @click="openWhatsApp" aria-label="Contactar por WhatsApp" />
    </div>
</template>

<style scoped>
.service-card {
    border-radius: 12px;
    overflow: hidden;
}

.service-card:hover {
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.p-input-icon-left > i {
    color: #6b7280;
}

.p-input-icon-left > .p-inputtext {
    padding-left: 2.5rem;
}

/* Custom animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.service-card {
    animation: fadeInUp 0.6s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .container {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .service-card {
        margin-bottom: 1rem;
    }
}
</style>
