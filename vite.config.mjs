import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true,
        include: ['pusher-js', 'tiny-case', 'property-expr'],
        exclude: []
    },
    plugins: [
        vue(),
        vueDevTools(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    test: {
        environment: 'jsdom'
    },
    build: {
        outDir: 'dist', // Asegúrate de que la salida sea 'dist'
        rollupOptions: {
            output: {
                format: 'es'
            }
        }
    },
    server: {
        host: true,
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            'c55f-38-255-111-144.ngrok-free.app' // ✅ Sin https://
        ]
    }
});
