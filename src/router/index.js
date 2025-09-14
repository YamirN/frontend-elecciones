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
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },

    {
        path: '/admin',
        component: AppLayout,
        meta: { requiresAuth: true, roles: ['!estudiante'] },
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/pages/admin/Dashboard.vue')
            },
            {
                path: 'usuarios',
                name: 'usuarios',
                component: () => import('@/views/pages/user/Usercrud.vue'),
                meta: { requiresAuth: true, section: 'admin', permission: 'ver usuarios' }
            },
            {
                path: 'roles',
                name: 'roles',
                component: () => import('@/views/pages/user/Roles.vue'),
                meta: { requiresAuth: true, permission: 'ver roles' }
            },
            {
                path: 'estudiantes',
                name: 'estudiantes',
                component: () => import('@/views/pages/user/Estudiantecrud.vue'),
                meta: { requiresAuth: true, permission: 'ver estudiantes' }
            },
            {
                path: 'candidatos',
                name: 'candidatos',
                component: () => import('@/views/pages/user/Candidatecrud.vue'),
                meta: { requiresAuth: true, permission: 'ver candidatos' }
            },
            {
                path: 'mesas',
                name: 'mesas',
                component: () => import('@/views/pages/elections/mesacrud.vue'),
                meta: { requiresAuth: true, permission: 'ver mesas' }
            },
            {
                path: 'elecciones',
                name: 'elecciones',
                component: () => import('@/views/pages/admin/Elecciones.vue'),
                meta: { requiresAuth: true, permission: 'ver eleccion' }
            },
            {
                path: 'partidos',
                name: 'partidos',
                component: () => import('@/views/pages/admin/Partidos.vue'),
                meta: { requiresAuth: true, permission: 'ver partidos' }
            },
            {
                path: 'eventos',
                name: 'eventos',
                component: () => import('@/views/pages/admin/Eventos.vue'),
                meta: { requiresAuth: true, permission: 'ver eventos' }
            },
            {
                path: 'eventos-votar',
                name: 'eventos-votar',
                component: () => import('@/views/pages/admin/EventosVotar.vue'),
                meta: { requiresAuth: true, permission: 'ver eventos votar' }
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

    // 👉 Si la ruta requiere autenticación y aún no hay user, intenta cargarlo
    if (to.meta.requiresAuth && !authStore.user) {
        try {
            await authStore.fetchUser();
        } catch {
            return next({ name: 'login' });
        }
    }

    const role = authStore.user?.rol;

    // 👉 Si ya está autenticado e intenta ir a login o registrar
    if (['login', 'registrar'].includes(to.name) && authStore.user) {
        if (role === 'estudiante') {
            return next({ name: 'votar' });
        }
        return next({ name: 'dashboard' });
    }

    // 👉 Si la ruta requiere auth y no está autenticado
    if (to.meta.requiresAuth && !authStore.user) {
        return next({ name: 'login' });
    }

    // 👉 Reglas de secciones (según tu lógica de negocio)
    if (role === 'estudiante' && to.meta.section === 'admin') {
        return next({ name: 'loginvotante' });
    }

    if (role !== 'estudiante' && to.meta.section === 'votante') {
        return next({ name: 'login' });
    }

    // 👉 Validación de permisos con Spatie
    if (to.meta.permission && !authStore.can(to.meta.permission)) {
        return next({ name: 'accessDenied' }); // o 403.vue
    }

    return next();
});

export default router;
