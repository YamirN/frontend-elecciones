<script setup>
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { onMounted, reactive, ref } from 'vue';

// Reactive state
const authStoreAdmin = useAuthStore();
const showStudentDialog = ref(false);
const showAdminDialog = ref(false);

const adminForm = reactive({
    nombre_usuario: '',
    password: ''
});

const animatedStats = reactive({
    schools: 0,
    students: 0,
    elections: 0,
    votes: 0
});

// Methods
const closeDialogs = () => {
    showAdminDialog.value = false;
    // Reset forms

    adminForm.nombre_usuario = '';
    adminForm.password = '';
};

const handleStudentLogin = () => {
    router.push({ name: 'loginvotante' });
};

const handleLoginAdminstrador = async () => {
    const { nombre_usuario, password } = adminForm;
    const isAuthenticated = await authStoreAdmin.handleLoginAdmin(nombre_usuario, password);

    if (isAuthenticated) {
        router.push({ name: 'dashboard' });
    } else {
        alert('CREDENCIALES INCORRECTAS');
    }
};

// Animate statistics
const animateStats = () => {
    const targets = { schools: 150, students: 25000, elections: 500, votes: 180000 };
    const duration = 2000;
    const steps = 60;

    Object.keys(targets).forEach((key) => {
        const target = targets[key];
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                animatedStats[key] = target;
                clearInterval(timer);
            } else {
                animatedStats[key] = Math.floor(current);
            }
        }, duration / steps);
    });
};

onMounted(() => {
    animateStats();
});
</script>

<template>
    <div class="min-h-screen">
        <!-- Navigation -->
        <div class="surface-0 shadow-2 px-4 py-3 md:px-6 lg:px-8">
            <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center">
                    <i class="pi pi-check-circle text-3xl text-primary mr-3"></i>
                    <span class="text-2xl font-bold text-900">VotoEscolar</span>
                </div>
                <div class="hidden md:flex gap-4">
                    <a href="#como-funciona" class="text-600 hover:text-primary cursor-pointer transition-colors transition-duration-150">¿Cómo funciona?</a>
                    <a href="#seguridad" class="text-600 hover:text-primary cursor-pointer transition-colors transition-duration-150">Seguridad</a>
                    <a href="#contacto" class="text-600 hover:text-primary cursor-pointer transition-colors transition-duration-150">Contacto</a>
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
            <div class="text-center">
                <div class="mb-6">
                    <i class="pi pi-users text-6xl text-primary mb-4"></i>
                    <h1 class="text-6xl font-bold text-900 line-height-2 mb-4">Votaciones <span class="text-primary">Escolares</span></h1>
                    <p class="text-xl text-600 line-height-3 mb-6 max-w-4xl mx-auto">Plataforma segura y transparente para las elecciones estudiantiles de tu institución educativa. Vota de manera digital, segura y confiable.</p>
                </div>

                <!-- Main Action Buttons -->
                <div class="flex flex-column md:flex-row gap-4 justify-content-center align-items-center mb-8">
                    <button
                        @click="handleStudentLogin"
                        class="p-button p-button-lg p-button-primary flex align-items-center gap-2 px-6 py-3 text-lg font-bold border-round shadow-3 hover:shadow-4 transition-all transition-duration-300"
                        style="min-width: 200px"
                    >
                        <i class="pi pi-check-circle"></i>
                        <span>Votar Ahora</span>
                    </button>
                    <button
                        @click="showAdminDialog = true"
                        class="p-button p-button-lg p-button-secondary flex align-items-center gap-2 px-6 py-3 text-lg font-bold border-round shadow-3 hover:shadow-4 transition-all transition-duration-300"
                        style="min-width: 200px"
                    >
                        <i class="pi pi-shield"></i>
                        <span>Acceso Administrador</span>
                    </button>
                </div>

                <!-- Trust Indicators -->
                <div class="flex flex-wrap justify-content-center align-items-center gap-4 text-sm text-600 mb-8">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-lock text-green-500"></i>
                        <span>Votación 100% Segura</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-eye text-blue-500"></i>
                        <span>Transparente</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-mobile text-purple-500"></i>
                        <span>Acceso desde cualquier dispositivo</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Cards -->
        <div class="px-4 py-8 md:px-6 lg:px-8">
            <div class="grid">
                <div class="col-12 md:col-4 p-3">
                    <div class="surface-card p-4 border-round shadow-2 h-full text-center hover:shadow-4 transition-all transition-duration-300">
                        <div class="bg-green-100 inline-flex justify-content-center align-items-center border-circle mb-4" style="width: 80px; height: 80px">
                            <i class="pi pi-lock text-3xl text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-900 mb-3">Máxima Seguridad</h3>
                        <p class="text-600 line-height-3">Sistema de autenticación robusto con encriptación de datos que garantiza la integridad de cada voto emitido.</p>
                    </div>
                </div>
                <div class="col-12 md:col-4 p-3">
                    <div class="surface-card p-4 border-round shadow-2 h-full text-center hover:shadow-4 transition-all transition-duration-300">
                        <div class="bg-blue-100 inline-flex justify-content-center align-items-center border-circle mb-4" style="width: 80px; height: 80px">
                            <i class="pi pi-eye text-3xl text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-900 mb-3">Total Transparencia</h3>
                        <p class="text-600 line-height-3">Resultados en tiempo real con auditoría completa del proceso electoral para garantizar la confianza.</p>
                    </div>
                </div>
                <div class="col-12 md:col-4 p-3">
                    <div class="surface-card p-4 border-round shadow-2 h-full text-center hover:shadow-4 transition-all transition-duration-300">
                        <div class="bg-purple-100 inline-flex justify-content-center align-items-center border-circle mb-4" style="width: 80px; height: 80px">
                            <i class="pi pi-mobile text-3xl text-purple-600"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-900 mb-3">Fácil Acceso</h3>
                        <p class="text-600 line-height-3">Interfaz intuitiva y responsive, accesible desde cualquier dispositivo móvil, tablet o computadora.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- How it Works -->
        <div id="como-funciona" class="surface-section px-4 py-8 md:px-6 lg:px-8">
            <div class="text-center mb-6">
                <h2 class="text-4xl font-bold text-900 mb-3">¿Cómo Funciona?</h2>
                <p class="text-xl text-600">Proceso simple y seguro en 3 pasos</p>
            </div>

            <div class="grid">
                <div class="col-12 md:col-4 text-center p-4">
                    <div class="bg-primary text-0 border-circle inline-flex justify-content-center align-items-center mb-4" style="width: 80px; height: 80px">
                        <span class="text-3xl font-bold">1</span>
                    </div>
                    <h3 class="text-xl font-semibold text-900 mb-3">Autenticación</h3>
                    <p class="text-600 line-height-3">Los estudiantes ingresan con sus credenciales institucionales únicas y seguras.</p>
                </div>
                <div class="col-12 md:col-4 text-center p-4">
                    <div class="bg-green-500 text-0 border-circle inline-flex justify-content-center align-items-center mb-4" style="width: 80px; height: 80px">
                        <span class="text-3xl font-bold">2</span>
                    </div>
                    <h3 class="text-xl font-semibold text-900 mb-3">Votación</h3>
                    <p class="text-600 line-height-3">Selecciona tu candidato favorito de forma intuitiva y confirma tu voto de manera segura.</p>
                </div>
                <div class="col-12 md:col-4 text-center p-4">
                    <div class="bg-purple-500 text-0 border-circle inline-flex justify-content-center align-items-center mb-4" style="width: 80px; height: 80px">
                        <span class="text-3xl font-bold">3</span>
                    </div>
                    <h3 class="text-xl font-semibold text-900 mb-3">Resultados</h3>
                    <p class="text-600 line-height-3">Visualiza los resultados en tiempo real una vez finalizado el período de votación.</p>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="px-4 py-8 md:px-6 lg:px-8">
            <div class="grid text-center">
                <div class="col-6 md:col-3 p-3">
                    <div class="text-4xl font-bold text-primary mb-2">{{ animatedStats.schools }}</div>
                    <div class="text-600 font-medium">Instituciones</div>
                </div>
                <div class="col-6 md:col-3 p-3">
                    <div class="text-4xl font-bold text-green-500 mb-2">{{ animatedStats.students }}</div>
                    <div class="text-600 font-medium">Estudiantes</div>
                </div>
                <div class="col-6 md:col-3 p-3">
                    <div class="text-4xl font-bold text-purple-500 mb-2">{{ animatedStats.elections }}</div>
                    <div class="text-600 font-medium">Elecciones</div>
                </div>
                <div class="col-6 md:col-3 p-3">
                    <div class="text-4xl font-bold text-orange-500 mb-2">{{ animatedStats.votes }}</div>
                    <div class="text-600 font-medium">Votos Emitidos</div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="surface-section px-4 py-8 md:px-6 lg:px-8 text-center">
            <h2 class="text-4xl font-bold text-900 mb-4">¿Listo para Participar?</h2>
            <p class="text-xl text-600 mb-6 max-w-3xl mx-auto">Tu voz es importante. Únete a miles de estudiantes que ya confían en nuestra plataforma para ejercer su derecho al voto de manera segura y transparente.</p>

            <div class="flex flex-column md:flex-row gap-4 justify-content-center">
                <button @click="showStudentDialog = true" class="p-button p-button-lg p-button-primary flex align-items-center gap-2 px-6 py-3 text-lg font-bold border-round shadow-3">
                    <i class="pi pi-check-circle"></i>
                    <span>Comenzar a Votar</span>
                </button>
                <button @click="showAdminDialog = true" class="p-button p-button-lg p-button-outlined flex align-items-center gap-2 px-6 py-3 text-lg font-bold border-round">
                    <i class="pi pi-cog"></i>
                    <span>Panel Administrativo</span>
                </button>
            </div>
        </div>

        <!-- Footer -->
        <footer id="contacto" class="surface-900 text-0 px-4 py-6 md:px-6 lg:px-8">
            <div class="grid">
                <div class="col-12 md:col-4 mb-4">
                    <div class="flex align-items-center mb-3">
                        <i class="pi pi-check-circle text-2xl text-primary mr-2"></i>
                        <span class="text-xl font-bold">VotoEscolar</span>
                    </div>
                    <p class="text-300 line-height-3">Democratizando las elecciones estudiantiles con tecnología segura, transparente y confiable.</p>
                </div>
                <div class="col-12 md:col-4 mb-4">
                    <h3 class="text-lg font-semibold mb-3">Enlaces Útiles</h3>
                    <ul class="list-none p-0 text-300">
                        <li class="mb-2"><a href="#" class="text-300 hover:text-0 transition-colors transition-duration-150">Términos de Servicio</a></li>
                        <li class="mb-2"><a href="#" class="text-300 hover:text-0 transition-colors transition-duration-150">Política de Privacidad</a></li>
                        <li class="mb-2"><a href="#" class="text-300 hover:text-0 transition-colors transition-duration-150">Soporte Técnico</a></li>
                        <li class="mb-2"><a href="#" class="text-300 hover:text-0 transition-colors transition-duration-150">Documentación</a></li>
                    </ul>
                </div>
                <div class="col-12 md:col-4 mb-4">
                    <h3 class="text-lg font-semibold mb-3">Contacto</h3>
                    <div class="text-300">
                        <div class="flex align-items-center mb-2">
                            <i class="pi pi-envelope mr-2"></i>
                            <span>info@votoescolar.com</span>
                        </div>
                        <div class="flex align-items-center mb-2">
                            <i class="pi pi-phone mr-2"></i>
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div class="flex align-items-center">
                            <i class="pi pi-map-marker mr-2"></i>
                            <span>Educación Digital S.A.</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="border-top-1 surface-border pt-4 text-center">
                <p class="text-300">&copy; 2024 VotoEscolar. Todos los derechos reservados.</p>
            </div>
        </footer>

        <!-- Admin Login Dialog -->
        <div v-if="showAdminDialog" class="fixed inset-0 bg-black-alpha-50 flex align-items-center justify-content-center z-5" @click="closeDialogs">
            <div class="surface-card p-6 border-round shadow-5 w-full max-w-md mx-3" @click.stop>
                <div class="text-center mb-5">
                    <div class="bg-orange-100 inline-flex justify-content-center align-items-center border-circle mb-3" style="width: 60px; height: 60px">
                        <i class="pi pi-shield text-2xl text-orange-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-900 mb-2">Login Administrador</h2>
                    <p class="text-600">Acceso para personal autorizado únicamente</p>
                </div>

                <form @submit.prevent="handleLoginAdminstrador" class="flex flex-column gap-4">
                    <div class="field">
                        <label class="block text-900 font-medium mb-2">Usuario Administrador</label>
                        <div class="p-input-icon-left w-full">
                            <i class="pi pi-user-edit"></i>
                            <input v-model="adminForm.nombre_usuario" type="text" required class="p-inputtext p-component w-full p-3 border-1 surface-border border-round" placeholder="admin@colegio.edu" />
                        </div>
                    </div>

                    <div class="field">
                        <label class="block text-900 font-medium mb-2">Contraseña</label>
                        <div class="p-input-icon-left w-full">
                            <i class="pi pi-key"></i>
                            <input v-model="adminForm.password" type="password" required class="p-inputtext p-component w-full p-3 border-1 surface-border border-round" placeholder="Contraseña de administrador" />
                        </div>
                    </div>

                    <button type="submit" class="p-button p-button-secondary w-full p-3 text-lg font-bold border-round">
                        <i class="pi pi-cog mr-2"></i>
                        Acceder al Panel
                    </button>
                </form>

                <button @click="closeDialogs" class="p-button p-button-text w-full mt-3 text-600">Cancelar</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* PrimeVue-like styles */
.p-button {
    display: inline-flex;
    cursor: pointer;
    user-select: none;
    align-items: center;
    vertical-align: bottom;
    text-align: center;
    overflow: hidden;
    position: relative;
    color: #ffffff;
    background: #3b82f6;
    border: 1px solid #3b82f6;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    transition:
        background-color 0.2s,
        color 0.2s,
        border-color 0.2s,
        box-shadow 0.2s;
    border-radius: 6px;
}

.p-button:hover {
    background: #2563eb;
    border-color: #2563eb;
}

.p-button-secondary {
    background: #6b7280;
    border-color: #6b7280;
}

.p-button-secondary:hover {
    background: #4b5563;
    border-color: #4b5563;
}

.p-button-outlined {
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
}

.p-button-outlined:hover {
    background: #3b82f6;
    color: #ffffff;
}

.p-button-text {
    background: transparent;
    color: #6b7280;
    border: 1px solid transparent;
}

.p-button-text:hover {
    background: #f3f4f6;
    color: #374151;
}

.p-inputtext {
    font-family: inherit;
    font-feature-settings: inherit;
    font-size: 1rem;
    color: #374151;
    background: #ffffff;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    transition:
        background-color 0.2s,
        color 0.2s,
        border-color 0.2s,
        box-shadow 0.2s;
    appearance: none;
    border-radius: 6px;
}

.p-inputtext:focus {
    outline: 0 none;
    outline-offset: 0;
    box-shadow: 0 0 0 0.2rem #bfdbfe;
    border-color: #3b82f6;
}

.p-input-icon-left > i:first-of-type {
    position: absolute;
    top: 50%;
    margin-top: -0.5rem;
    left: 0.75rem;
    color: #6b7280;
}

.p-input-icon-left > .p-inputtext {
    padding-left: 2.5rem;
}

/* PrimeVue Grid System */
.grid {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.5rem;
    margin-left: -0.5rem;
    margin-top: -0.5rem;
}

.col-12 {
    flex: 0 0 auto;
    padding: 0.5rem;
    width: 100%;
}
.col-6 {
    flex: 0 0 auto;
    padding: 0.5rem;
    width: 50%;
}
.col-4 {
    flex: 0 0 auto;
    padding: 0.5rem;
    width: 33.3333%;
}
.col-3 {
    flex: 0 0 auto;
    padding: 0.5rem;
    width: 25%;
}

@media screen and (min-width: 768px) {
    .md\:col-4 {
        width: 33.3333%;
    }
    .md\:col-3 {
        width: 25%;
    }
}

/* PrimeVue Colors and Surfaces */
.surface-0 {
    background-color: #ffffff;
}
.surface-card {
    background-color: #ffffff;
}
.surface-ground {
    background-color: #f8fafc;
}
.surface-section {
    background-color: #f1f5f9;
}
.surface-900 {
    background-color: #0f172a;
}
.surface-border {
    border-color: #e2e8f0;
}

.text-0 {
    color: #ffffff;
}
.text-300 {
    color: #cbd5e1;
}
.text-600 {
    color: #475569;
}
.text-900 {
    color: #0f172a;
}
.text-primary {
    color: #3b82f6;
}

.bg-primary {
    background-color: #3b82f6;
}
.bg-primary-100 {
    background-color: #dbeafe;
}

.shadow-2 {
    box-shadow:
        0 3px 6px rgba(0, 0, 0, 0.16),
        0 3px 6px rgba(0, 0, 0, 0.23);
}
.shadow-3 {
    box-shadow:
        0 10px 20px rgba(0, 0, 0, 0.19),
        0 6px 6px rgba(0, 0, 0, 0.23);
}
.shadow-4 {
    box-shadow:
        0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
}
.shadow-5 {
    box-shadow:
        0 19px 38px rgba(0, 0, 0, 0.3),
        0 15px 12px rgba(0, 0, 0, 0.22);
}

.border-round {
    border-radius: 6px;
}
.border-circle {
    border-radius: 50%;
}

/* Utility Classes */
.flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
}
.flex-row {
    flex-direction: row;
}
.align-items-center {
    align-items: center;
}
.justify-content-center {
    justify-content: center;
}
.justify-content-between {
    justify-content: space-between;
}
.text-center {
    text-align: center;
}
.font-bold {
    font-weight: 700;
}
.font-semibold {
    font-weight: 600;
}
.font-medium {
    font-weight: 500;
}
.line-height-2 {
    line-height: 1.5;
}
.line-height-3 {
    line-height: 1.75;
}
.w-full {
    width: 100%;
}
.h-full {
    height: 100%;
}
.gap-2 {
    gap: 0.5rem;
}
.gap-3 {
    gap: 0.75rem;
}
.gap-4 {
    gap: 1rem;
}
.mb-2 {
    margin-bottom: 0.5rem;
}
.mb-3 {
    margin-bottom: 0.75rem;
}
.mb-4 {
    margin-bottom: 1rem;
}
.mb-5 {
    margin-bottom: 1.25rem;
}
.mb-6 {
    margin-bottom: 1.5rem;
}
.mb-8 {
    margin-bottom: 2rem;
}
.mr-2 {
    margin-right: 0.5rem;
}
.mr-3 {
    margin-right: 0.75rem;
}
.mt-3 {
    margin-top: 0.75rem;
}
.p-3 {
    padding: 0.75rem;
}
.p-4 {
    padding: 1rem;
}
.p-6 {
    padding: 1.5rem;
}
.px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
}
.px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
}
.px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}
.py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
}
.py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
}
.py-6 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}
.py-8 {
    padding-top: 2rem;
    padding-bottom: 2rem;
}

.transition-all {
    transition: all 0.2s;
}
.transition-colors {
    transition:
        color 0.2s,
        background-color 0.2s,
        border-color 0.2s;
}
.transition-duration-150 {
    transition-duration: 150ms;
}
.transition-duration-300 {
    transition-duration: 300ms;
}

.cursor-pointer {
    cursor: pointer;
}
.list-none {
    list-style: none;
}

.bg-black-alpha-50 {
    background-color: rgba(0, 0, 0, 0.5);
}
.fixed {
    position: fixed;
}
.inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
.z-5 {
    z-index: 1050;
}
.max-w-md {
    max-width: 28rem;
}
.max-w-3xl {
    max-width: 48rem;
}
.max-w-4xl {
    max-width: 56rem;
}
.mx-auto {
    margin-left: auto;
    margin-right: auto;
}
.mx-3 {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
}

/* Responsive utilities */
@media screen and (min-width: 768px) {
    .md\:flex-row {
        flex-direction: row;
    }
    .md\:px-6 {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    .md\:py-8 {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
}

@media screen and (min-width: 1024px) {
    .lg\:px-8 {
        padding-left: 2rem;
        padding-right: 2rem;
    }
}

.hidden {
    display: none;
}
@media screen and (min-width: 768px) {
    .md\:flex {
        display: flex;
    }
}

/* PrimeVue Icons simulation */
.pi {
    font-family: 'primeicons';
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    display: inline-block;
}

.pi-check-circle:before {
    content: '✓';
}
.pi-users:before {
    content: '👥';
}
.pi-shield:before {
    content: '🛡';
}
.pi-lock:before {
    content: '🔒';
}
.pi-eye:before {
    content: '👁';
}
.pi-mobile:before {
    content: '📱';
}
.pi-user:before {
    content: '👤';
}
.pi-id-card:before {
    content: '🆔';
}
.pi-sign-in:before {
    content: '➡';
}
.pi-cog:before {
    content: '⚙';
}
.pi-user-edit:before {
    content: '✏';
}
.pi-key:before {
    content: '🔑';
}
.pi-envelope:before {
    content: '✉';
}
.pi-phone:before {
    content: '📞';
}
.pi-map-marker:before {
    content: '📍';
}

.text-lg {
    font-size: 1.125rem;
}
.text-xl {
    font-size: 1.25rem;
}
.text-2xl {
    font-size: 1.5rem;
}
.text-3xl {
    font-size: 1.875rem;
}
.text-4xl {
    font-size: 2.25rem;
}
.text-6xl {
    font-size: 3.75rem;
}

.text-green-500 {
    color: #10b981;
}
.text-green-600 {
    color: #059669;
}
.text-blue-500 {
    color: #3b82f6;
}
.text-blue-600 {
    color: #2563eb;
}
.text-purple-500 {
    color: #8b5cf6;
}
.text-purple-600 {
    color: #7c3aed;
}
.text-orange-500 {
    color: #f59e0b;
}
.text-orange-600 {
    color: #d97706;
}

.bg-green-100 {
    background-color: #dcfce7;
}
.bg-blue-100 {
    background-color: #dbeafe;
}
.bg-purple-100 {
    background-color: #f3e8ff;
}
.bg-orange-100 {
    background-color: #fef3c7;
}

.bg-green-500 {
    background-color: #10b981;
}
.bg-purple-500 {
    background-color: #8b5cf6;
}

.border-1 {
    border-width: 1px;
}
.border-top-1 {
    border-top-width: 1px;
}

.field {
    margin-bottom: 1rem;
}
.block {
    display: block;
}

.hover\:shadow-4:hover {
    box-shadow:
        0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
}
.hover\:text-0:hover {
    color: #ffffff;
}
.hover\:text-primary:hover {
    color: #3b82f6;
}
</style>
