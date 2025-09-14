<script setup>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
const auth = useAuthStore();
const { user } = storeToRefs(auth);

// Menú completo
const adminModel = [
    {
        label: 'Inicio',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', to: '/admin/dashboard' }]
    },
    {
        label: 'Usuarios',
        items: [
            { label: 'Administradores', icon: 'pi pi-fw pi-user', to: '/admin/usuarios', permission: 'ver usuarios' },
            { label: 'Estudiantes', icon: 'pi pi-fw pi-user', to: '/admin/estudiantes', permission: 'ver estudiantes' }
        ]
    },
    {
        label: 'Seguridad',
        items: [
            {
                label: 'Roles',
                icon: 'pi pi-fw pi-user-edit',
                to: '/admin/roles',
                permission: 'ver roles'
            }
        ]
    },
    {
        label: 'Administrar',
        items: [
            { label: 'Elecciones', icon: 'pi pi-fw pi-bookmark-fill', to: '/admin/elecciones', permission: 'ver eleccion' },
            { label: 'Listas', icon: 'pi pi-fw pi-flag-fill', to: '/admin/partidos', permission: 'ver partidos' },
            { label: 'Mesas', icon: 'pi pi-fw pi-table', to: '/admin/mesas', permission: 'ver mesas' }
        ]
    },
    {
        label: 'Registro de actividades',
        items: [
            { label: 'Eventos', icon: 'pi pi-fw pi-clock', to: '/admin/eventos', permission: 'ver eventos' },
            { label: 'Eventos Votar', icon: 'pi pi-fw pi-clock', to: '/admin/eventos-votar', permission: 'ver eventos votar' }
        ]
    }
];
// Computed: si es estudiante → no mostrar menú (o menú reducido)
const model = computed(() => {
    if (!user.value) return [];

    if (user.value.rol === 'estudiante') {
        return [
            {
                label: 'Elecciones',
                items: [{ label: 'Votar', icon: 'pi pi-check-square', to: '/estudiante/votar' }]
            }
        ];
    }

    // Para admin/profesor, etc.
    return adminModel
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => {
                // si no requiere permiso -> mostrar siempre
                if (!item.permission) return true;
                // si requiere permiso -> validar
                return auth.can(item.permission);
            })
        }))
        .filter((section) => section.items.length > 0); // no mostrar secciones vacías
});
</script>

<template>
    <div class="text-white">
        <!-- Header con usuario y logo -->
        <div class="flex flex-col items-center px-4 pt-6 pb-4 space-y-3 border-b border-white/10">
            <!-- <img :src="onpeImg" alt="Logo" class="h-20 w-auto shadow-md ring-2 ring-white/20" /> -->
            <div class="text-lg font-extrabold uppercase tracking-wider text-center mt-1 pb-2">Panel {{ user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : '' }}</div>

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
