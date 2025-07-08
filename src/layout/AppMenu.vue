<script setup>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const auth = useAuthStore();
const { user } = storeToRefs(auth);

const model = ref([
    {
        label: 'Inicio',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', to: '/admin/dashboard' }]
    },
    {
        label: 'USUARIOS DEL SISTEMA',
        items: [
            {
                label: 'Gestionar Usuarios',
                icon: 'pi pi-fw pi-user-edit',
                items: [
                    {
                        label: 'Clientes',
                        icon: 'pi pi-fw pi-user',
                        to: '/admin/clientes'
                    },
                    {
                        label: 'trabajadores',
                        icon: 'pi pi-fw pi-briefcase',
                        to: '/admin/trabajadores'
                    }
                ]
            }
        ]
    },
    {
        label: 'ADMINISTRAR',
        items: [
            {
                label: 'Servicios',
                icon: 'pi pi-fw pi-link',
                to: '/admin/servicios'
            },
            {
                label: 'Paquetes',
                icon: 'pi pi-fw pi-box',
                to: '/admin/packs'
            },
            {
                label: 'Citas',
                icon: 'pi pi-calendar-minus',
                to: '/admin/citas'
            }
        ]
    }
]);
</script>

<template>
    <div class="text-white">
        <!-- Encabezado: Logo + Título + Usuario -->
        <div class="flex flex-col items-center px-4 pt-6 pb-4 space-y-3 border-b border-white/10">
            <!-- Logo -->
            <img src="@/assets/img/spa.jpg" alt="Logo" class="h-20 w-auto shadow-md ring-2 ring-white/20" />

            <!-- Título -->
            <div class="text-lg font-extrabold uppercase tracking-wider text-center mt-1 pb-2">Panel Administrador</div>

            <!-- Usuario -->
            <div class="text-md font-medium text-center text-white/80 pt-3">
                <template v-if="user?.nombre">
                    {{ user.nombre }} {{ user?.apellido }}
                    <p></p>
                    <span>Rol: {{ user.rol }}</span></template
                >

                <template v-else> Cargando usuario... </template>
            </div>
        </div>

        <!-- Menú dinámico -->
        <ul class="layout-menu px-2 pt-2">
            <template v-for="(item, i) in model" :key="i">
                <app-menu-item v-if="!item.separator" :item="item" :index="i" />
                <li v-else class="menu-separator h-px bg-white/10 my-2" />
            </template>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.layout-menu-title {
    font-size: 0.85rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
