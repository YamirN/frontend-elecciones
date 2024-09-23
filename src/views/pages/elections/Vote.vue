<script setup>

import { fetchCandidate } from '@/service/candidateService';
import { emitirVoto, fetchVoterData } from '@/service/voterService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const showNotification = ref(false)
const toast = useToast();
const user = ref([]);
const candidatos = ref([]);
const selectedCandidate = ref(null)
const message = ref('');
const errors = ref('');

// Función para obtener los datos del usuario
const getUserData = async () => {
    try {
        const response = await fetchVoterData(); // Llama a la función del servicio
        user.value = response; // Asigna los datos del usuario
    } catch (error) {
        error.value = 'Ocurrió un error al obtener los datos del usuario.';
    }
};

// Funcion para obtener los candidatos
const loadCandidatos = async () => {
    try {
        const response = await fetchCandidate();
        candidatos.value = response.candidato;
    } catch (error) {
        console.error('Error loading candidatos:', error);
    }
};

const vote = async () => {
    try {
        const dni = user.value.userable.dni;
        const now = new Date();
        const fechaVoto = now.toISOString().slice(0, 19).replace('T', ' '); // Formato correcto para MySQL

        const response = await emitirVoto(dni, selectedCandidate.value, fechaVoto);
        if (response.success) {
            showNotification.value = true
            // Si es exitoso
            sessionStorage.removeItem('authToken');
            showNotification.value = true;

            setTimeout(() => {
                showNotification.value = false;
                selectedCandidate.value = null;
                window.location.href = '/auth/loginelecciones';
            }, 2000);
        }

    } catch (error) {
        console.error('Error al registrar el voto:', error);
        sessionStorage.removeItem('authToken');
        window.location.href = '/auth/loginelecciones';
        toast.add({ severity: 'error', summary: 'Error', detail: 'Ya has votado.', life: 3000 });
    }
};

const getImageUrl = (foto) => {
    // Devuelve la URL completa de la imagen
    return `${import.meta.env.VITE_APP_API_URL}/storage/${foto}`;

};

const selectCandidate = (id) => {
    selectedCandidate.value = id
}
onMounted(getImageUrl);
onMounted(getUserData);
onMounted(loadCandidatos);
</script>

<template>

    <div class="min-h-screen bg-gradient-to-br from-red-800 to-white flex items-center justify-center p-6">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
            <div v-if="user" class="text-2xl font-bold text-center mb-4 text-gray-800">
                <p>Hola, {{ user.name }} {{ user.last_name }}</p>
            </div>
            <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">Elije tu Candidato</h1>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="candidato in candidatos" :key="candidato.id" @click="selectCandidate(candidato.id)"
                    class="relative cursor-pointer group">
                    <div :class="[
                        'bg-gray-50 rounded-xl p-4 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg',
                        { 'ring-4 ring-red-500 shadow-lg scale-105': selectedCandidate === candidato.id }
                    ]">
                        <div class="relative mb-4">
                            <img :src="getImageUrl(candidato.foto)" :alt="candidato.name"
                                class="w-full h-48 object-cover rounded-lg shadow-md" />
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span class="text-white text-lg font-semibold">{{ candidato.users[0]?.name }} {{
                                    candidato.users[0]?.last_name }} </span>
                            </div>
                        </div>

                    </div>
                    <div v-if="selectedCandidate === candidato.id"
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full flex items-center justify-center"
                        style="width: 2rem; height: 2rem;">
                        <i class="pi pi-check" style="font-size: 1rem"></i>
                    </div>
                </div>
            </div>

            <button @click="vote" :disabled="!selectedCandidate"
                className="mt-8 w-full bg-gradient-to-r from-red-600 to-red-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-300 ease-in-out hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                Votar
            </button>

            <Transition name="fade">
                <p v-if="message" class="mt-4 text-center text-green-600 font-medium">{{ message }}</p>
            </Transition>
        </div>
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="showNotification"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 ease-out"
                        :class="{ 'scale-100 opacity-100': showNotification, 'scale-95 opacity-0': !showNotification }">
                        <div class="text-center">
                            <i class="pi pi-check-circle mx-auto text-green-500 mb-4" style="font-size: 5rem"></i>

                            <h2 class=" text-2xl font-bold mb-2 text-gray-800">¡Gracias por votar!</h2>
                            <p class="text-lg text-gray-600 mb-4">Tu voto ha sido registrado con éxito.</p>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
                                <div class="bg-green-500 h-full rounded-full countdown-progress"></div>
                            </div>
                            <p class="text-sm text-gray-500">Su sesion se cerrará en breve</p>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
        <Toast />
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
