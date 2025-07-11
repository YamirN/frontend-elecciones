<script setup>
import pazImg from '@/assets/img/paz.jpg';
import renuevateImg from '@/assets/img/renuevate.jpg';
import spaImage from '@/assets/img/spa.jpg';
import tratamientoImg from '@/assets/img/tratamientoexclusivo.jpg';
import { useReporteStore } from '@/stores/reportesStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Carousel from 'primevue/carousel';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const reporteStore = useReporteStore();
const { topServicios, loading } = storeToRefs(reporteStore);
const dialogVisible = ref(false);
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

const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h ? `${h}h ` : ''}${m}min`;
};

// Featured services data

// Navigation methods
const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToToHome = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToToterminos = () => {
    document.getElementById('terminos')?.scrollIntoView({ behavior: 'smooth' });
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

const openSocial = (platform) => {
    const urls = {
        facebook: 'https://www.facebook.com/DEJAVUSPA.CHIM',
        instagram: 'https://www.instagram.com/dejavu.spa.chimbote'
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
    await reporteStore.cargarTopServicios();
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <!-- Header Navigation -->
        <header class="bg-white/95 backdrop-blur shadow-md sticky top-0 z-50">
            <div class="container mx-auto px-6 py-4">
                <div class="flex justify-between items-center">
                    <!-- Logo + Nombre -->
                    <div class="flex items-center space-x-3">
                        <img :src="spaImage" alt="Logo" class="h-10 w-auto rounded-full ring-2 ring-blue-100 shadow-sm" />
                        <h1 class="text-2xl font-extrabold text-gray-800 tracking-tight">Dejavu<span class="text-blue-600">Spa</span></h1>
                    </div>

                    <!-- Navegación -->
                    <nav class="hidden md:flex space-x-6">
                        <button @click="scrollToToHome" class="text-blue-600 font-semibold hover:text-blue-700 transition duration-200">Inicio</button>
                        <button @click="scrollToServices" class="text-blue-600 font-semibold hover:text-blue-700 transition duration-200">Servicios</button>
                        <button @click="scrollToToterminos" class="text-blue-600 font-semibold hover:text-blue-700 transition duration-200">Términos</button>

                        <button @click="scrollToContact" class="text-blue-600 font-semibold hover:text-blue-700 transition duration-200">Contacto</button>
                    </nav>

                    <!-- Botones de acción -->
                    <div class="flex space-x-2">
                        <Button label="Iniciar Sesión" outlined size="small" @click="goToLogin" class="!border-blue-600 !text-blue-600 hover:!bg-blue-50 transition duration-200" />
                        <Button label="Registrarse" size="small" @click="goToRegister" class="!bg-blue-600 !border-blue-600 hover:!bg-blue-700 transition duration-200" />
                    </div>
                </div>
            </div>
        </header>

        <!-- Hero Section with Carousel -->
        <section id="home" class="relative">
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
                                <Button label="Hacer Reserva" severity="success" class="w-full" @click="goToLogin" />
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
        <section id="services" class="py-16 px-4">
            <div class="container mx-auto">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Nuestros Servicios Destacados</h2>

                <!-- Grid de servicios -->
                <div class="grid md:grid-cols-3 gap-6">
                    <section v-for="service in reporteStore.topServicios" :key="service.id" class="bg-white rounded-lg hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                        <!-- Imagen -->
                        <img :src="service.imagen" :alt="service.nombre" class="w-full h-48 object-cover" />

                        <!-- Contenido -->
                        <div class="p-4 space-y-2">
                            <h3 class="text-lg font-semibold text-gray-800">
                                {{ service.nombre }}
                            </h3>
                            <p class="text-sm text-gray-600 font-medium">S/. {{ service.precio }}</p>
                            <p class="text-gray-600 text-sm mb-4">
                                {{ service.descripcion }}
                            </p>

                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">{{ formatDuration(service.duracion) }}</span>
                                <Button label="Reservar" size="small" @click="goToLogin(service.id)" />
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Botón inferior -->
                <div class="text-center mt-8">
                    <Button label="Ver Todos los Servicios" outlined @click="goToServices" />
                </div>
            </div>
        </section>

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

        <!-- Términos y Condiciones - al final del landing -->
        <section id="terminos" class="py-16 px-4 bg-white border-t border-gray-200">
            <div class="container mx-auto max-w-4xl text-center">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Términos y Condiciones</h2>
                <p class="text-gray-600 text-sm leading-relaxed mb-6">
                    Al confirmar una cita en DejavuSpa, aceptas que no será posible cancelarla ni reprogramarla bajo ninguna circunstancia. Recomendamos revisar cuidadosamente los detalles antes de confirmar.
                    <br />
                    Asimismo, no se realizarán reembolsos por citas reservadas, conforme a nuestra política de no reembolso.
                </p>
                <Button label="Leer términos completos" @click="dialogVisible = true" outlined class="text-sm" />
            </div>
        </section>

        <!-- WhatsApp Floating Button -->
    </div>

    <Dialog v-model:visible="dialogVisible" modal header="Términos y Condiciones" class="max-w-3xl">
        <div class="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p>Al utilizar nuestros servicios, usted acepta los siguientes términos y condiciones establecidos por <strong>DejavuSpa</strong>:</p>
            <ul class="list-disc pl-5 space-y-2">
                <li>No se permiten cancelaciones ni reprogramaciones de citas una vez confirmadas.</li>
                <li>El pago realizado no será reembolsado en ningún caso.</li>
                <li>El cliente debe presentarse con puntualidad; la inasistencia se considera como servicio recibido.</li>
                <li>Los servicios están sujetos a disponibilidad, y nos reservamos el derecho de modificar horarios según necesidad.</li>
                <li>Las promociones o descuentos no son acumulables, salvo indicación expresa.</li>
                <li>El cliente declara estar en condiciones físicas aptas para recibir los tratamientos.</li>
            </ul>
            <p>Para cualquier duda o reclamo, puedes contactarnos a <a href="mailto:info@dejavuspa.com" class="text-blue-600 underline">info@dejavuspa.com</a>.</p>
        </div>
    </Dialog>
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
