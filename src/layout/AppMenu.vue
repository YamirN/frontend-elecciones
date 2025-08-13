<script setup>
import spaImg from '@/assets/img/spa.jpg';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const auth = useAuthStore();
const { user } = storeToRefs(auth);

// Menú completo
const fullModel = {
    administrador: [
        {
            label: 'Inicio',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', to: '/admin/dashboard' }]
        },

        {
            label: 'Usuarios',
            items: [
                {
                    label: 'Gestionar Usuarios',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        { label: 'Administradores', icon: 'pi pi-fw pi-user', to: '/admin/usuarios' },
                        { label: 'Estudiantes', icon: 'pi pi-fw pi-user', to: '/admin/estudiantes' }
                    ]
                },
                {
                    label: 'Roles',
                    icon: 'pi pi-fw pi-user-edit',
                    to: '/admin/roles'
                }
            ]
        },
        {
            label: 'Administrar',
            items: [
                { label: 'Elecciones', icon: 'pi pi-fw pi-bookmark-fill', to: '/admin/elecciones' },
                { label: 'Listas', icon: 'pi pi-fw pi-flag-fill', to: '/admin/partidos' },
                { label: 'Mesas', icon: 'pi pi-fw pi-table', to: '/admin/mesas' }
                // { label: 'Citas', icon: 'pi pi-calendar-minus', to: '/admin/citas' }
            ]
        }
    ],
    trabajador: [
        {
            // label: 'Inicio',
            items: [{ label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/trabajador/dashboard' }]
        },
        {
            label: 'Mi Agenda',
            items: [{ label: 'Citas Asignadas', icon: 'pi pi-fw pi-calendar', to: '/trabajador/citas' }]
        }
    ]
};

// Computed para mostrar solo el menú del rol actual
const model = computed(() => {
    return fullModel[user.value?.rol] || [];
});
</script>

<template>
    <div class="text-white">
        <!-- Header con usuario y logo -->
        <div class="flex flex-col items-center px-4 pt-6 pb-4 space-y-3 border-b border-white/10">
            <img :src="spaImg" alt="Logo" class="h-20 w-auto shadow-md ring-2 ring-white/20" />
            <div class="text-lg font-extrabold uppercase tracking-wider text-center mt-1 pb-2">Panel {{ user?.rol === 'administrador' ? 'Administrador' : 'Trabajador' }}</div>
            <div class="text-md font-medium text-center text-white/80 pt-3">
                <template v-if="user?.nombre">
                    {{ user.nombre }} {{ user?.apellido }}
                    <p class="text-sm text-white/60">Rol: {{ user.rol }}</p>
                </template>
                <template v-else>Cargando usuario...</template>
            </div>
        </div>

        <!-- Render dinámico de ítems -->
        <ul class="layout-menu px-2 pt-2">
            <template v-for="(item, i) in model" :key="i">
                <app-menu-item v-if="!item.separator" :item="item" :index="i" />
                <li v-else class="menu-separator h-px bg-white/10 my-2" />
            </template>
        </ul>
    </div>
</template>
