<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
// import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const dni = ref('');
const password = ref('');
const errors = computed(() => authStore.errors);
const showHelp = ref(false);
const router = useRouter();
const showPassword = ref(false);
const showAlreadyVotedDialog = ref(false); // para el dialog de ya votó

// Login del votante
const handleLoginVotante = async () => {
    const success = await authStore.handleLoginVotante(dni.value, password.value);

    if (!success) return;

    if (authStore.yaVoto) {
        // Mostrar el dialog directamente, sin tocar token
        showAlreadyVotedDialog.value = true;
    } else {
        // Guardar token y redirigir
        router.push({ name: 'votar' });
    }
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-red-800 to-white flex items-center justify-center p-6">
        <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-white to-red-500"></div>

            <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Acceso de Votante</h1>

            <div class="mb-6 text-center">
                <img src="\src\assets\img\insignia_cover.png" alt="Urna electoral" class="w-40 h-30 mx-auto mb-8 animate-bounce" loading="lazy" />
                <p class="text-sm text-gray-600">Introduce tu DNI y contraseña para acceder al sistema de votación</p>
            </div>

            <form @submit.prevent="handleLoginVotante" class="space-y-6">
                <!-- Campo DNI -->
                <div>
                    <label for="dni" class="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                    <div class="relative">
                        <input
                            id="dni"
                            v-model="dni"
                            type="text"
                            required
                            placeholder="Ej: 32569456"
                            maxlength="8"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors }"
                        />
                        <Transition name="fade">
                            <i class="pi pi-user absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </Transition>
                    </div>
                </div>

                <!-- Campo Contraseña -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <div class="relative">
                        <input
                            id="password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            placeholder="Ingresa tu contraseña"
                            class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors }"
                        />
                        <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none">
                            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <!-- Mensaje de error -->
                <Transition name="fade">
                    <div v-if="errors" class="mt-4 p-4 bg-red-100 border-l-4 border-red-500 rounded-md">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="pi pi-exclamation-circle text-red-400" />
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-red-700">{{ errors }}</p>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Botón de acceso -->
                <button
                    type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 flex items-center justify-center"
                >
                    <span>Acceder</span>
                    <i class="pi pi-arrow-right ml-2 h-3 w-5"></i>
                </button>
            </form>

            <!-- Ayuda -->
            <div class="mt-6 text-center">
                <button @click="showHelp = !showHelp" class="text-blue-600 hover:underline focus:outline-none">¿Necesitas ayuda?</button>
            </div>

            <Transition name="slide-fade">
                <div v-if="showHelp" class="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h2 class="font-semibold mb-2">Información de ayuda:</h2>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>Asegúrate de introducir tu DNI correctamente (8 dígitos).</li>
                        <li>Usa la contraseña proporcionada por la institución.</li>
                        <li>Si tienes problemas, contacta con el administrador.</li>
                    </ul>
                </div>
            </Transition>
        </div>
        <Toast />
    </div>
    <Dialog v-model:visible="showAlreadyVotedDialog" header="Ya has votado" modal closable>
        <p>Tu voto ya fue registrado en esta elección. Gracias por participar.</p>
        <template #footer>
            <Button label="Cerrar" icon="pi pi-times" @click="showAlreadyVotedDialog = false" />
        </template>
    </Dialog>
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
