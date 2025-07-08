<script setup>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// PrimeVue
const menu = ref();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const router = useRouter();

// Opciones del menú
const items = [
    {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => router.push({ name: 'perfil' }) // ajusta según tu ruta
    },

    {
        separator: true
    },
    {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: async () => {
            await authStore.handleLogout();
            authStore.$reset();
            router.replace({ name: 'login' });
        }
    }
];

const toggleMenu = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <!-- Header -->
        <header class="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <!-- Logo -->
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

                    <!-- Usuario -->
                    <div class="flex items-center space-x-4">
                        <!-- Dropdown -->
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {{ user.nombre.charAt(0).toUpperCase() }}
                                </div>
                                <div class="hidden sm:block">
                                    <p class="text-sm font-medium text-gray-800">{{ user.nombre }}</p>
                                    <p class="text-xs text-gray-500">Cliente</p>
                                </div>
                            </div>

                            <!-- Dropdown con PrimeVue Menu -->
                            <button @click="toggleMenu" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                                <i class="pi pi-chevron-down text-sm"></i>
                            </button>
                            <Menu ref="menu" :model="items" popup />
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main -->
        <main class="flex-grow">
            <router-view />
        </main>

        <!-- Footer -->
        <footer class="bg-gray-100 p-4 text-center text-sm text-gray-500">© 2025 SerenitySpa. Todos los derechos reservados.</footer>

        <!-- Toast -->
        <Toast />
    </div>
</template>
