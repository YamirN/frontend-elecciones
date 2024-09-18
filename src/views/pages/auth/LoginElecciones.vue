<script setup>
import apiClient from '@/service/axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const dni = ref('');
const error = ref('')
const successMessage = ref('')
const showHelp = ref(false)
const router = useRouter();
const handleLoginVotante = async () => {
    try {
        const response = await apiClient.post('/votante/login', {
            dni: dni.value,

        });

        // Verifica si la respuesta contiene un token
        if (response.data.token) {
            // Si la autenticación es exitosa, guarda el token (por ejemplo, en localStorage)
            sessionStorage.setItem('authToken', response.data.token);

            // Redirige al dashboard
            router.push({ name: 'vote' });
        } else {
            // Muestra un mensaje de error o maneja el caso de autenticación fallida
            alert('Fallo al iniciar sesion. Revisa tus credenciales.');
        }

    } catch (error) {
        console.error('Error en el login:', error);
        // Mostrar un mensaje de error al usuario
        alert('An error occurred during login. Please try again.');
    }
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-red-800 to-white flex items-center justify-center p-6">
        <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-white to-red-500"></div>

            <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Acceso de Votante</h1>

            <div class="mb-6 text-center">
                <img src="\src\assets\img\insignia_cover.png" alt="Urna electoral"
                    class="w-40 h-30 mx-auto mb-8 animate-bounce" loading="lazy">
                <p class="text-sm text-gray-600">Introduce tu DNI para acceder al sistema de votación</p>
            </div>

            <form @submit.prevent="handleLoginVotante" class="space-y-6">
                <div>
                    <label for="dni" class="block text-sm font-medium text-gray-700 mb-1">
                        DNI
                    </label>
                    <div class="relative">
                        <input id="dni" v-model="dni" type="text" required placeholder="Ej: 12345678A"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': error }" />
                        <Transition name="fade">
                            <i class="pi pi-user absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </Transition>
                    </div>
                    <Transition name="fade">
                        <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
                    </Transition>
                </div>

                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 flex items-center justify-center">
                    <span>Acceder</span>

                    <i class="pi pi-arrow-right ml-2 h-3 w-5"></i>
                </button>
            </form>

            <Transition name="fade">
                <div v-if="successMessage"
                    class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                    {{ successMessage }}
                </div>
            </Transition>

            <div class="mt-6 text-center">
                <button @click="showHelp = !showHelp" class="text-blue-600 hover:underline focus:outline-none">
                    ¿Necesitas ayuda?
                </button>
            </div>

            <Transition name="slide-fade">
                <div v-if="showHelp" class="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h2 class="font-semibold mb-2">Información de ayuda:</h2>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>Asegúrate de introducir tu DNI correctamente.</li>
                        <li>El DNI debe tener 8 números seguidos de una letra.</li>
                        <li>Si tienes problemas, contacta con la mesa electoral.</li>
                    </ul>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(-10%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }

    60% {
        transform: translateY(-5px);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}

.animate-bounce {
    animation: bounce 2s infinite;
}
</style>
