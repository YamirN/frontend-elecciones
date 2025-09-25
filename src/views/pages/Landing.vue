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
    <div class="min-h-screen w-full">
        <!-- Navigation -->
        <div class="bg-white shadow-lg w-full px-4 py-3 md:px-6 lg:px-8">
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                    <svg class="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-2xl font-bold text-gray-900">VotoEscolar</span>
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <div class="bg-gray-50 w-full px-4 py-16 md:px-6 lg:px-8">
            <div class="text-center w-full">
                <div class="mb-8">
                    <svg class="w-24 h-24 text-blue-600 mx-auto mb-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">Votaciones <span class="text-blue-600">Escolares</span></h1>
                    <p class="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">Plataforma segura y transparente para las elecciones estudiantiles de tu institución educativa. Vota de manera digital, segura y confiable.</p>
                </div>

                <!-- Main Action Buttons -->
                <div class="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
                    <button @click="handleStudentLogin" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-lg min-w-[200px]">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <span>Votar Ahora</span>
                    </button>
                    <button @click="showAdminDialog = true" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-lg min-w-[200px]">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span>Acceso Administrador</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Features Cards -->
        <div class="w-full px-4 py-16 md:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                    <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Máxima Seguridad</h3>
                    <p class="text-gray-600 leading-relaxed">Sistema de autenticación robusto con encriptación de datos que garantiza la integridad de cada voto emitido.</p>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                    <div class="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Total Transparencia</h3>
                    <p class="text-gray-600 leading-relaxed">Resultados en tiempo real con auditoría completa del proceso electoral para garantizar la confianza.</p>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                    <div class="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Fácil Acceso</h3>
                    <p class="text-gray-600 leading-relaxed">Interfaz intuitiva y responsive, accesible desde cualquier dispositivo móvil, tablet o computadora.</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer id="contacto" class="bg-gray-900 text-white w-full px-4 py-12 md:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <div class="mb-8 md:mb-0">
                    <div class="flex items-center mb-4">
                        <svg class="w-8 h-8 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-xl font-bold">VotoEscolar</span>
                    </div>
                    <p class="text-gray-300 leading-relaxed">Democratizando las elecciones estudiantiles con tecnología segura, transparente y confiable.</p>
                </div>

                <div class="mb-8 md:mb-0">
                    <h3 class="text-lg font-semibold mb-4">Enlaces Útiles</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li><a href="#" class="hover:text-white transition-colors duration-150">Términos de Servicio</a></li>
                        <li><a href="#" class="hover:text-white transition-colors duration-150">Política de Privacidad</a></li>
                        <li><a href="#" class="hover:text-white transition-colors duration-150">Soporte Técnico</a></li>
                        <li><a href="#" class="hover:text-white transition-colors duration-150">Documentación</a></li>
                    </ul>
                </div>

                <div>
                    <h3 class="text-lg font-semibold mb-4">Contacto</h3>
                    <div class="text-gray-300 space-y-2">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span>info@votoescolar.com</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                            </svg>
                            <span>Educación Digital S.A.</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 pt-8 mt-8 text-center">
                <p class="text-gray-300">&copy; 2024 VotoEscolar. Todos los derechos reservados.</p>
            </div>
        </footer>

        <!-- Admin Login Dialog -->
        <div v-if="showAdminDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeDialogs">
            <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4" @click.stop>
                <div class="text-center mb-6">
                    <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Login Administrador</h2>
                    <p class="text-gray-600">Acceso para personal autorizado únicamente</p>
                </div>

                <form @submit.prevent="handleLoginAdminstrador" class="space-y-6">
                    <div>
                        <label class="block text-gray-900 font-medium mb-2">Usuario Administrador</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <input v-model="adminForm.nombre_usuario" type="text" required class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="admin@colegio.edu" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-gray-900 font-medium mb-2">Contraseña</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <input
                                v-model="adminForm.password"
                                type="password"
                                required
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Contraseña de administrador"
                            />
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        Acceder al Panel
                    </button>
                </form>

                <button @click="closeDialogs" class="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200">Cancelar</button>
            </div>
        </div>
    </div>
</template>
