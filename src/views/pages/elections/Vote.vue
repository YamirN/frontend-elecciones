<script setup>

import { useAuthStore } from '@/stores/auth';
import { useCandidatoStore } from '@/stores/candidatos';
import { useVoteStore } from '@/stores/vote';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter(); // Accede al router
const voteStore = useVoteStore();
const showNotification = ref(false)
const toast = useToast();
const candidatos = ref([]);
const selectedCandidate = ref(null)
const message = ref('');
const errors = ref('');

const authStore = useAuthStore();

const candidatoStore = useCandidatoStore();

const selectCandidate = (id) => {
    selectedCandidate.value = id
}

const vote = async () => {
    try {
        const dni = authStore.user.dni;
        const isVoteSuccessful = await voteStore.submitVote({ dni: dni, candidateId: selectedCandidate.value });
        if (isVoteSuccessful) {
            showNotification.value = true;
            authStore.logout();
            setTimeout(() => {
                showNotification.value = false;
                selectedCandidate.value = null;
                router.push({ name: 'loginelecciones' });
            }, 2000);
        }
    } catch (error) {
        console.error('Error al registrar el voto:', error);
        authStore.logout(); // Redirige si hay un error
        router.push({ name: 'loginelecciones' });
    }
};

const getImageUrl = (foto) => {
    if (!foto) {
        return '/path/to/default/image.png'; // Ruta a una imagen por defecto si no hay foto
    }
    // Remover el prefijo 'api' de la URL
    return `${import.meta.env.VITE_APP_API_URL.replace('/api', '')}/storage/${foto}`;
};


onMounted(getImageUrl);
onMounted(() => {
    candidatoStore.ObtenerCandidatos();
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-red-800 to-white flex items-center justify-center p-4">
        <div class="bg-white bg-opacity-95 border-2 border-gray-200 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <header class="text-center mb-6">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">CÉDULA DE VOTACIÓN</h1>
                <h2 class="text-xl text-black-600">Elecciones para Presidente del Consejo Estudiantil</h2>
            </header>

            <div class="mb-6">
                <p class="text-sm text-gray-600 text-center font-medium">Haga clic en la imagen del candidato de su
                    preferencia para marcar con una X</p>
            </div>

            <div class="space-y-3">
                <div v-for="candidato in candidatoStore.candidatos" :key="candidato.id"
                    class="flex items-center border-2 rounded-lg p-3 transition-all duration-300 ease-in-out" :class="[selectedCandidate === candidato.id
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100']">
                    <div class="flex-grow">
                        <p class="font-semibold text-gray-800">{{ candidato.nombre }}</p>
                        <p class="text-sm text-gray-600">{{ candidato.name }}</p>
                    </div>
                    <div class="relative w-16 h-16">
                        <img :src="getImageUrl(candidato.foto)" :alt="candidato.name"
                            class="w-full h-full object-cover rounded-lg cursor-pointer shadow-md"
                            @click="selectCandidate(candidato.id)">
                        <div v-if="selectedCandidate === candidato.id"
                            class="absolute inset-0 flex items-center justify-center">
                            <div class="absolute inset-0 bg-white opacity-70 rounded-lg"></div>
                            <svg class="absolute inset-0 w-full h-full text-black" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-center mt-8">
                <button @click="vote"
                    class="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                    :disabled="!selectedCandidate">
                    Emitir Voto
                </button>
            </div>

            <Transition name="fade">
                <p v-if="message" class="mt-4 text-center text-green-600 font-medium">{{ message }}</p>
            </Transition>

            <Teleport to="body">
                <Transition name="fade">
                    <div v-if="showNotification"
                        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 ease-out"
                            :class="{ 'scale-100 opacity-100': showNotification, 'scale-95 opacity-0': !showNotification }">
                            <div class="text-center">
                                <i class="pi pi-check-circle mx-auto text-green-500 mb-4" style="font-size: 5rem"></i>
                                <h2 class="text-2xl font-bold mb-2 text-gray-800">¡Gracias por votar!</h2>
                                <p class="text-lg text-gray-600 mb-4">Tu voto ha sido registrado con éxito.</p>
                                <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                                    <div class="bg-green-500 h-full rounded-full countdown-progress"></div>
                                </div>
                                <p class="text-sm text-gray-500">Su sesión se cerrará en breve</p>
                            </div>
                        </div>
                    </div>
                </Transition>
            </Teleport>
            <Toast />
        </div>
    </div>
</template>



<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes countdown {
    from {
        width: 100%;
    }

    to {
        width: 0%;
    }
}

.countdown-progress {
    animation: countdown 2s linear forwards;
}
</style>
