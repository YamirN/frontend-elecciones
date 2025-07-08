<script setup>
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
    const success = await authStore.handleLogin(email.value, password.value);

    if (success) {
        const rol = authStore.rol;

        // Redirige según el rol del usuario
        switch (rol) {
            case 'administrador':
                router.push({ name: 'dashboard' });
                break;
            case 'cliente':
                router.push({ name: 'clienteDashboard' });
                break;
            case 'trabajador':
                router.push({ name: 'trabajadorDashboard' });
                break;
            default:
                router.push({ name: 'Inicio' });
        }
    } else {
        alert('CREDENCIALES INCORRECTAS');
    }
};
</script>
<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)"></div>
        </div>

        <!-- Main Container -->
        <div class="relative w-full max-w-md">
            <!-- Glassmorphism Card -->
            <div class="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
                <!-- Header Section -->
                <div class="px-8 pt-12 pb-8 text-center">
                    <!-- Logo/Icon -->
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                        <i class="pi pi-shield text-white text-2xl"></i>
                    </div>

                    <!-- Title -->
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">Bienvenido Administrador</h1>

                    <!-- Subtitle -->
                    <p class="text-gray-600 dark:text-gray-400 font-medium">Inicia sesión para acceder al panel de control</p>
                </div>

                <!-- Form Section -->
                <div class="px-8 pb-12">
                    <form @submit.prevent="handleLogin" class="space-y-6">
                        <!-- Email Field -->
                        <div class="space-y-2">
                            <label for="text" class="block text-sm font-semibold text-gray-700 dark:text-gray-300"> Nombre Usuario </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="pi pi-envelope text-gray-400 text-sm"></i>
                                </div>
                                <input
                                    id="text"
                                    v-model="nombre_usuario"
                                    type="text"
                                    placeholder="admin"
                                    required
                                    class="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <!-- Password Field -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300"> Contraseña </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="pi pi-lock text-gray-400 text-sm"></i>
                                </div>
                                <input
                                    id="password"
                                    v-model="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="••••••••"
                                    required
                                    class="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Additional Options -->
                        <div class="flex items-center justify-between text-sm">
                            <label class="flex items-center space-x-2 cursor-pointer">
                                <input
                                    v-model="rememberMe"
                                    type="checkbox"
                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span class="text-gray-600 dark:text-gray-400">Recordarme</span>
                            </label>
                            <a href="#" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"> ¿Olvidaste tu contraseña? </a>
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                        >
                            <div class="flex items-center justify-center space-x-2">
                                <span v-if="!isLoading">Acceder al Panel</span>
                                <span v-else>Iniciando sesión...</span>
                                <i v-if="!isLoading" class="pi pi-arrow-right text-sm"></i>
                                <i v-else class="pi pi-spin pi-spinner text-sm"></i>
                            </div>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8">
                <p class="text-sm text-gray-500 dark:text-gray-400">© 2024 Tu Empresa. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animaciones personalizadas */
@keyframes float {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

.backdrop-blur-xl {
    backdrop-filter: blur(16px);
}

/* Efectos de hover mejorados */
button:hover {
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Transiciones suaves para inputs */
input:focus {
    transform: translateY(-1px);
}

/* Gradiente animado para el botón */
button[type='submit']:not(:disabled):hover {
    background-size: 200% 200%;
    animation: gradient 2s ease infinite;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
</style>
