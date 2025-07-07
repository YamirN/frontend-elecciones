<script setup>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import Toast from 'primevue/toast';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const router = useRouter();

const logout = async () => {
    await authStore.logout();
    router.push({ name: 'login' });
};
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <!-- Header Navigation -->
        <header class="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <!-- Logo y Nombre -->
                    <div class="flex items-center space-x-3">
                        <div class="relative">
                            <img src="@/assets/img/spa.jpg" alt="DejavuSpa Logo" class="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/20 shadow-md" />
                            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DejavuSpa</h1>
                            <p class="text-xs text-gray-500 -mt-1">Tu oasis de bienestar</p>
                        </div>
                    </div>

                    <!-- Navegación Central (opcional para desktop) -->
                    <nav class="hidden md:flex items-center space-x-6">
                        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"> Inicio </a>
                        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"> Servicios </a>
                        <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"> Mis Reservas </a>
                    </nav>

                    <!-- Usuario y Acciones -->
                    <div class="flex items-center space-x-4">
                        <!-- Notificaciones -->
                        <!-- <button class="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                            <i class="pi pi-bell text-lg"></i>
                            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                        </button> -->

                        <!-- Perfil de Usuario -->
                        <div class="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {{ user.nombre.charAt(0).toUpperCase() }}
                            </div>
                            <div class="hidden sm:block">
                                <p class="text-sm font-medium text-gray-800">{{ user.nombre }}</p>
                                <p class="text-xs text-gray-500">Cliente</p>
                            </div>
                        </div>

                        <!-- Menú Dropdown -->
                        <div class="relative">
                            <button @click="showUserMenu = !showUserMenu" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                                <i class="pi pi-chevron-down text-sm"></i>
                            </button>

                            <!-- Dropdown Menu -->
                            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50" @click.stop>
                                <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                    <i class="pi pi-user mr-3 text-gray-400"></i>
                                    Mi Perfil
                                </a>
                                <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                    <i class="pi pi-cog mr-3 text-gray-400"></i>
                                    Configuración
                                </a>
                                <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                    <i class="pi pi-heart mr-3 text-gray-400"></i>
                                    Favoritos
                                </a>
                                <hr class="my-2 border-gray-100" />
                                <button @click="logout" class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                                    <i class="pi pi-sign-out mr-3"></i>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Contenido -->
        <main class="flex-grow">
            <router-view />
        </main>

        <!-- Footer -->
        <footer class="bg-gray-100 p-4 text-center text-sm text-gray-500">© 2025 SerenitySpa. Todos los derechos reservados.</footer>

        <Toast />
    </div>
</template>
