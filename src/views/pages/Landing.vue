<script setup>
import pazImg from '@/assets/img/paz.jpg';
import renuevateImg from '@/assets/img/renuevate.jpg';
import spaImage from '@/assets/img/spa.jpg';
import tratamientoImg from '@/assets/img/tratamientoexclusivo.jpg';
import { useCitaStore } from '@/stores/citaStore';
import { useServicioStore } from '@/stores/servicioStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Carousel from 'primevue/carousel';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const citaStore = useCitaStore();
const servicioStore = useServicioStore();

const { listaServicios, servicios } = storeToRefs(servicioStore);
const { citas } = storeToRefs(citaStore);

// Hero slides data
const heroSlides = ref([
    {
        title: 'Relájate y Renuévate',
        subtitle: 'Experimenta la tranquilidad que mereces',
        image: renuevateImg
    },
    {
        title: 'Tratamientos Exclusivos',
        subtitle: 'Cuidado personalizado para tu bienestar',
        image: tratamientoImg
    },
    {
        title: 'Tu Oasis de Paz',
        subtitle: 'Donde el estrés desaparece',
        image: pazImg
    }
]);

// Featured services data

const featuredServices = computed(() => {
    const conteo = new Map();

    // Contar repeticiones
    citas.forEach((cita) => {
        const servicio = cita.servicio;
        if (!servicio || servicio.estado !== 'activo') return;

        const id = servicio.id;
        if (conteo.has(id)) {
            conteo.get(id).total += 1;
        } else {
            conteo.set(id, {
                ...servicio,
                total: 1
            });
        }
    });

    // Convertir a array y ordenar por popularidad
    const ordenados = Array.from(conteo.values()).sort((a, b) => b.total - a.total);

    return ordenados.slice(0, 6); // Top 6
});

// Navigation methods
const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
};

const goToLogin = () => {
    // Redirect to login page
    router.push('/login');
};

const goToRegister = () => {
    // Redirect to register page
    window.location.href = '/registrar';
};

const goToServices = () => {
    // Redirect to services page
    router.push('/servicio');
};

const goToBooking = () => {
    // Check if user is logged in, if not redirect to login
    // For now, just redirect to login
    window.location.href = '/login';
};

const openSocial = (platform) => {
    const urls = {
        facebook: 'https://facebook.com/dejavuspa',
        instagram: 'https://instagram.com/dejavuspa',
        twitter: 'https://twitter.com/dejavuspa'
    };
    window.open(urls[platform], '_blank');
};

const openWhatsApp = () => {
    const phoneNumber = '1234567890';
    const message = 'Hola, me gustaría obtener más información sobre sus servicios de spa.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

onMounted(async () => {
    await citaStore.ListaCita();
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <!-- Header Navigation -->
        <!-- Header Navigation -->
        <header class="bg-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <img :src="spaImage" alt="Logo" class="h-10 w-auto ring-2 ring-white/20" />
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

        <!-- Hero Section with Carousel -->
        <section class="relative">
            <Carousel :value="heroSlides" :numVisible="1" :numScroll="1" :autoplayInterval="5000" :showNavigators="true" :showIndicators="true" class="hero-carousel">
                <template #item="slotProps">
                    <div class="relative h-96 md:h-[500px] overflow-hidden">
                        <img :src="slotProps.data.image" :alt="slotProps.data.title" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div class="text-center text-white px-4">
                                <h2 class="text-4xl md:text-6xl font-bold mb-4 text-white">{{ slotProps.data.title }}</h2>
                                <p class="text-xl md:text-2xl mb-8 text-white">{{ slotProps.data.subtitle }}</p>
                            </div>
                        </div>
                    </div>
                </template>
            </Carousel>
        </section>

        <!-- Spa Presentation -->
        <section class="py-16 px-4">
            <div class="container mx-auto text-center">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-4xl font-bold text-gray-800 mb-6">Bienvenido a DejavuSpa</h2>
                    <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                        Tu oasis de tranquilidad y bienestar. En DejavuSpa, nos dedicamos a brindarte una experiencia única de relajación y renovación. Nuestros tratamientos especializados y ambiente sereno te ayudarán a encontrar el equilibrio
                        perfecto entre cuerpo y mente.
                    </p>
                    <div class="bg-blue-100 rounded-lg p-6 mb-8">
                        <h3 class="text-2xl font-semibold text-blue-800 mb-2">Nuestro Lema</h3>
                        <p class="text-lg text-blue-700 italic">"Donde el bienestar encuentra su hogar"</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Action Buttons Section -->
        <section class="py-12 bg-gray-50">
            <div class="container mx-auto px-4">
                <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card class="text-center hover:shadow-lg transition-shadow duration-300">
                        <template #content>
                            <div class="p-6">
                                <i class="pi pi-list text-4xl text-blue-600 mb-4"></i>
                                <h3 class="text-xl font-semibold mb-3">Ver Servicios</h3>
                                <p class="text-gray-600 mb-4">Descubre nuestra amplia gama de tratamientos y servicios de spa</p>
                                <Button label="Explorar Servicios" class="w-full" @click="goToServices" />
                            </div>
                        </template>
                    </Card>

                    <Card class="text-center hover:shadow-lg transition-shadow duration-300">
                        <template #content>
                            <div class="p-6">
                                <i class="pi pi-calendar text-4xl text-green-600 mb-4"></i>
                                <h3 class="text-xl font-semibold mb-3">Reservar Ahora</h3>
                                <p class="text-gray-600 mb-4">Agenda tu cita y comienza tu viaje hacia el bienestar</p>
                                <Button label="Hacer Reserva" severity="success" class="w-full" @click="goToBooking" />
                            </div>
                        </template>
                    </Card>

                    <Card class="text-center hover:shadow-lg transition-shadow duration-300">
                        <template #content>
                            <div class="p-6">
                                <i class="pi pi-phone text-4xl text-purple-600 mb-4"></i>
                                <h3 class="text-xl font-semibold mb-3">Contacto</h3>
                                <p class="text-gray-600 mb-4">¿Tienes preguntas? Estamos aquí para ayudarte</p>
                                <Button label="Contáctanos" severity="help" class="w-full" @click="scrollToContact" />
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Services Preview -->
        <Card v-for="service in featuredServices" :key="service.id">
            <!-- Imagen -->
            <template #header>
                <img :src="service.image" :alt="service.nombre" class="w-full h-48 object-cover" />
            </template>

            <template #title>{{ service.nombre }}</template>
            <template #subtitle>${{ service.precio }}</template>

            <template #content>
                <p class="text-gray-600 mb-4">{{ service.descripcion }}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">{{ service.duracion }} min</span>
                    <Button label="Reservar" size="small" @click="goToBooking(service.id)" />
                </div>
            </template>
        </Card>

        <!-- Contact Section -->
        <section id="contact" class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Información de Contacto</h2>
                <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card>
                        <template #content>
                            <div class="p-6">
                                <h3 class="text-xl font-semibold mb-4">Contáctanos</h3>
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-3">
                                        <i class="pi pi-map-marker text-blue-600"></i>
                                        <span>Av. Wellness 123, Ciudad Spa, CP 12345</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <i class="pi pi-phone text-blue-600"></i>
                                        <span>+51 123456789</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <i class="pi pi-envelope text-blue-600"></i>
                                        <span>info@dejavuspa.com</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <i class="pi pi-clock text-blue-600"></i>
                                        <span>Lun - Dom: 9:00 AM - 8:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #content>
                            <div class="p-6">
                                <h3 class="text-xl font-semibold mb-4">Síguenos</h3>
                                <div class="flex space-x-4">
                                    <Button icon="pi pi-facebook" rounded outlined @click="openSocial('facebook')" />
                                    <Button icon="pi pi-instagram" rounded outlined @click="openSocial('instagram')" />
                                    <Button icon="pi pi-twitter" rounded outlined @click="openSocial('twitter')" />
                                    <Button icon="pi pi-whatsapp" rounded outlined severity="success" @click="openWhatsApp" />
                                </div>
                                <div class="mt-6">
                                    <h4 class="font-semibold mb-2">Sitio Web</h4>
                                    <p class="text-blue-600">www.dejavuspa.com</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </section>

        <!-- WhatsApp Floating Button -->
    </div>
</template>

<style scoped>
.hero-carousel :deep(.p-carousel-content) {
    height: 100%;
}

.hero-carousel :deep(.p-carousel-container) {
    height: 100%;
}

.hero-carousel :deep(.p-carousel-items-content) {
    height: 100%;
}

.hero-carousel :deep(.p-carousel-item) {
    height: 100%;
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

.card:hover {
    animation: fadeInUp 0.3s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .hero-carousel {
        height: 300px;
    }

    .container {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
</style>
