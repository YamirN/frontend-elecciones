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
        path: '/registrar',
        name: 'registrar',
        component: () => import('@/views/pages/cliente/Register.vue')
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
                path: 'trabajadores',
                name: 'trabajadores',
                component: () => import('@/views/pages/trabajador/Trabajadorcrud.vue')
            },
            {
                path: 'citas',
                name: 'citas',
                component: () => import('@/views/pages/citas/Citascrud.vue')
            },
            {
                path: 'perfil',
                name: 'perfilAdministrador',
                component: () => import('@/views/pages/admin/Perfil.vue')
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
            },
            {
                path: 'perfil',
                name: 'perfilCliente',
                component: () => import('@/views/pages/cliente/Profile.vue')
            }
        ]
    },
    {
        path: '/trabajador',
        component: () => import('@/layout/AppLayout.vue'),
        meta: { requiresAuth: true, roles: ['trabajador'] },
        children: [
            {
                path: 'dashboard',
                name: 'trabajadorDashboard',
                component: () => import('@/views/pages/trabajador/Dashboard.vue')
            },
            {
                path: 'perfil',
                name: 'perfilTrabajador',
                component: () => import('@/views/pages/trabajador/Perfil.vue')
            },
            {
                path: 'citas',
                name: 'citasTrabajador',
                component: () => import('@/views/pages/trabajador/Citas.vue')
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

    // 👉 Siempre intenta autenticar al usuario si no está definido aún
    if (!authStore.user) {
        try {
            await authStore.fetchUser();
        } catch {
            if (requiresAuth) {
                return next({ name: 'login' });
            }
        }
    }

    const role = authStore.user?.rol;

    // 👉 Si el usuario ya está autenticado e intenta acceder a login o registrar, redirige al dashboard
    if (['login', 'registrar'].includes(to.name) && authStore.user) {
        switch (role) {
            case 'administrador':
                return next({ name: 'dashboard' });
            case 'cliente':
                return next({ name: 'clienteDashboard' });
            case 'trabajador':
                return next({ name: 'trabajadorDashboard' });
            default:
                return next('/');
        }
    }

    // 👉 Si la ruta requiere auth y el usuario no está autenticado
    if (requiresAuth && !authStore.user) {
        return next({ name: 'login' });
    }

    // 👉 Si hay restricciones de rol y el usuario no pertenece al rol permitido
    if (requiresAuth && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return next({ name: 'login' }); // o una ruta de "403"
    }

    // ✅ Todo en orden
    return next();
});

export default router;
