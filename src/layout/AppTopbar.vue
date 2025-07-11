<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const { onMenuToggle } = useLayout();
const router = useRouter();
const authStore = useAuthStore();

const isMenuOpen = ref(false);
const { user } = storeToRefs(authStore);

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const goToPerfil = () => {
    if (!user.value?.rol) return;

    switch (user.value.rol) {
        case 'administrador':
            router.push('/admin/perfil');
            break;
        case 'trabajador':
            router.push('/trabajador/perfil');
            break;
        default:
            router.push('/');
    }
};

const logout = async () => {
    await authStore.handleLogout();
    authStore.$reset();
    router.replace({ name: 'login' });
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>

            <span class="text-gray-700 text-lg font-semibold tracking-wide ml-2 hidden md:inline-block"> DejavuSpa </span>
        </div>
        <div class="layout-topbar-actions">
            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <div class="relative">
                        <button @click="toggleMenu" class="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-2">
                            <i class="pi pi-user"></i>
                            <span v-if="user">{{ user.nombre }}</span>
                            <svg :class="{ 'rotate-180': isMenuOpen }" class="h-4 w-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>

                        <transition
                            enter-active-class="transition ease-out duration-200"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-150"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95"
                        >
                            <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-52 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                <!-- Aumenté el ancho del menú a w-64 y los bordes a rounded-lg -->
                                <div class="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <!-- Opción de Configurar perfil -->
                                    <a @click.prevent="goToPerfil" href="#" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100" role="menuitem">
                                        <span class="pi pi-cog mr-2"></span>
                                        Configurar perfil
                                    </a>
                                    <!-- Opción de Cerrar sesión -->
                                    <a @click="logout" href="#" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100" role="menuitem">
                                        <span class="pi pi-sign-out mr-2"></span>
                                        Cerrar sesión
                                    </a>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
