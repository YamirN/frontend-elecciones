import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth'; // Ajusta según tu estructura
import { useAppStore } from '@/stores/useAppStore'; // Ajusta según tu estructura
import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        name: 'Inicio',
        // component: Landing
        component: () => import('@/views/pages/Landing.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/pages/estudiante/Login.vue')
    },
    {
        path: '/servicio',
        name: 'servicio',
        component: () => import('@/views/pages/servicio/Servicio.vue')
    },
    {
        path: '/admin',
        component: AppLayout,
        meta: { requiresAuth: true, roles: ['administrador'] },
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/pages/admin/Dashboard.vue')
            },

            {
                path: 'servicios',
                name: 'servicios',
                component: () => import('@/views/pages/servicio/Serviciocrud.vue')
            },
            {
                path: 'packs',
                name: 'packs',
                component: () => import('@/views/pages/admin/Packscrud.vue')
            },
            {
                path: 'clientes',
                name: 'clientes',
                component: () => import('@/views/pages/cliente/ClienteCrud.vue')
            },
            {
                path: 'citas',
                name: 'citas',
                component: () => import('@/views/pages/citas/Citascrud.vue')
            }
        ]
    },
    {
        path: '/cliente',
        component: () => import('@/layout/AppLayoutCliente.vue'),
        meta: { requiresAuth: true, roles: ['cliente'] },
        children: [
            {
                path: 'home',
                name: 'clienteDashboard',
                component: () => import('@/views/pages/cliente/HomeCliente.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const app = useAppStore();
    app.startLoading();

    const requiresAuth = to.meta.requiresAuth;
    const allowedRoles = to.meta.roles || [];

    // Si la ruta no requiere autenticación, continuar
    if (!requiresAuth) return next();

    // Si no tenemos el usuario aún, intenta cargarlo desde /me
    if (!authStore.user) {
        try {
            await authStore.fetchUser();
        } catch {
            return next({ name: 'login' });
        }
    }

    const role = authStore.user?.rol;

    // Verificar si el rol del usuario está permitido en la ruta
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return next({ name: 'login' }); // o podrías redirigir a un "403"
    }

    // Evita acceder a login si ya está autenticado
    if (to.name === 'login') {
        switch (role) {
            case 'administrador':
                return next({ name: 'adminDashboard' });
            case 'cliente':
                return next({ name: 'clienteDashboard' });
            case 'trabajador':
                return next({ name: 'trabajadorDashboard' });
        }
    }

    return next(); // todo en orden
});

export default router;
