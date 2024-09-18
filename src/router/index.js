import AppLayout from '@/layout/AppLayout.vue';
import { isAuthenticatedAdmin, isAuthenticatedVoter } from '@/service/auth';
import Landing from '@/views/pages/Landing.vue';
import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        component: Landing
    },
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue')
    },
    {
        path: '/auth/loginelecciones',
        name: 'loginelecciones',
        component: () => import('@/views/pages/auth/LoginElecciones.vue')
    },
    {
        path: '/elections/vote',
        name: 'vote',
        meta: { requiresAuthVoter: true },
        component: () => import('@/views/pages/elections/Vote.vue')
    },
    {
        path: '/app',
        component: AppLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue')
            },


            {
                path: '/uikit/message',
                name: 'message',
                component: () => import('@/views/uikit/MessagesDoc.vue')
            },
            {
                path: '/uikit/file',
                name: 'file',
                component: () => import('@/views/uikit/FileDoc.vue')
            },

            {
                path: '/uikit/charts',
                name: 'charts',
                component: () => import('@/views/uikit/ChartDoc.vue')
            },

            {
                path: '/pages/empty',
                name: 'empty',
                component: () => import('@/views/pages/Empty.vue')
            },
            {
                path: '/pages/crud',
                name: 'crud',
                component: () => import('@/views/pages/Crud.vue')
            },
            {
                path: '/user/usercrud',
                name: 'usercrud',
                component: () => import('@/views/pages/user/Usercrud.vue')
            },
            {
                path: '/documentation',
                name: 'documentation',
                component: () => import('@/views/pages/Documentation.vue')
            }
        ]
    },
    {
        path: '/pages/notfound',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    },

    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/pages/auth/Error.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation Guard for Authentication
router.beforeEach((to, from, next) => {
    const isLoggedIn = isAuthenticatedAdmin(); // Suponiendo que tienes una función para verificar la autenticación
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (to.name === 'login' && isLoggedIn) {
        // Si el usuario está autenticado y trata de ir al login, redirige al dashboard
        next({ name: 'dashboard' });
    } else if (to.matched.some((record) => record.meta.requiresAuth)) {
        // Si la ruta requiere autenticación y no está autenticado, redirige al login
        if (requiresAuth & !isLoggedIn) {
            next({ name: 'login' });
        } else {
            next();
        }
    } else {
        next(); // Para rutas que no requieren autenticación
    }
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = isAuthenticatedVoter();

    if (to.meta.requiresAuthVoter && !isLoggedIn) {
      // Redirige al login si se requiere autenticación y el usuario no está autenticado
      next({ name: 'loginelecciones' });
    } else if (to.name === 'loginelecciones' && isLoggedIn) {
      // Redirige al dashboard si el usuario está autenticado y trata de acceder al login
      next({ name: 'vote' });
    } else {
      next(); // Permite el acceso a la ruta
    }
  });

export default router;
