import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/useAppStore';
import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        name: 'Inicio',
        // component: Landing
        component: () => import('@/views/pages/Landing.vue')
    },
    {
        path: '/estudiantes/login',
        name: 'loginvotante',
        component: () => import('@/views/pages/auth/LoginElecciones.vue')
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
                path: 'usuarios',
                name: 'usuarios',
                component: () => import('@/views/pages/user/Usercrud.vue')
            },
            {
                path: 'roles',
                name: 'roles',
                component: () => import('@/views/pages/user/Roles.vue')
            },
            {
                path: 'estudiantes',
                name: 'estudiantes',
                component: () => import('@/views/pages/user/Estudiantecrud.vue')
            },
            {
                path: 'candidatos',
                name: 'candidatos',
                component: () => import('@/views/pages/user/Candidatecrud.vue')
            },
            {
                path: 'mesas',
                name: 'mesas',
                component: () => import('@/views/pages/elections/mesacrud.vue')
            },
            {
                path: 'elecciones',
                name: 'elecciones',
                component: () => import('@/views/pages/admin/Elecciones.vue')
            },
            {
                path: 'partidos',
                name: 'partidos',
                component: () => import('@/views/pages/admin/Partidos.vue')
            }
        ]
    },
    {
        path: '/estudiante',

        meta: { requiresAuth: true, roles: ['estudiante'] },
        children: [
            {
                path: 'home',
                name: 'estudiante',
                component: () => import('@/views/pages/elections/Vote.vue')
            },
            {
                path: 'votar',
                name: 'votar',
                component: () => import('@/views/pages/elections/Vote.vue')
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
            case 'estudiante':
                return next({ name: 'votar' });
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
