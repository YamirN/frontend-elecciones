<script setup>
import { useAuthStore } from '@/stores/auth';
import { usePartidoStore } from '@/stores/partidoStore';
import { useVotacionStore } from '@/stores/votarStore';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Estado de la interfaz
const baseLogoUrl = import.meta.env.VITE_STORAGE_URL + '/';

const partidoStore = usePartidoStore();
const votoStore = useVotacionStore();
const authStore = useAuthStore();

const { user, yaVoto } = storeToRefs(authStore);
const { cargando } = storeToRefs(votoStore);
const { loading, eleccion, partidos, electionDetails, electionActive } = storeToRefs(partidoStore);

const router = useRouter();
const loggingOut = ref(false);
const selectedParty = ref(null);
const selectedVoteType = ref(null);
const message = ref('');
const messageType = ref('success');
const showConfirmationDialog = ref(false);
const hasVotedSuccessfully = ref(false);
const showAlreadyVotedDialog = ref(false);

const selectParty = (partido) => {
    selectedParty.value = partido;
    selectedVoteType.value = 'valido';
};

const selectBlankOrNull = (tipo) => {
    selectedVoteType.value = tipo;
    selectedParty.value = null;
};

const confirmVote = () => {
    if (!selectedParty.value && !selectedVoteType.value) {
        message.value = 'Debes seleccionar un partido o una opción de voto.';
        messageType.value = 'error';
        return;
    }
    showConfirmationDialog.value = true;
};

const startLogoutCountdown = () => {
    loggingOut.value = true;
    countdown.value = 3;

    const interval = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
            clearInterval(interval);
            handleLogout();
        }
    }, 1000);
};

const submitVote = async () => {
    try {
        const tipoVoto = selectedVoteType.value || 'valido';
        const partidoId = selectedParty.value?.id || null;

        await votoStore.registrarVoto({
            partido_id: partidoId,
            tipo_voto: tipoVoto
        });

        // Cerrar el diálogo de confirmación
        showConfirmationDialog.value = false;

        // Mostrar mensaje de voto registrado
        hasVotedSuccessfully.value = true;

        // Iniciar logout con contador
        startLogoutCountdown();
    } catch (error) {
        // Si el backend dice que ya votó, mostramos el dialog especial
        if (error.response?.data?.errors?.voto?.[0] === 'Ya has votado en esta elección.') {
            showConfirmationDialog.value = false;
            showAlreadyVotedDialog.value = true;
        } else {
            message.value = 'Ocurrió un error al registrar tu voto.';
            messageType.value = 'error';
        }
    }
};

const countdown = ref(3);
const handleLogout = async () => {
    try {
        await authStore.handleLogout(); // destruye token en la cookie
    } catch (_) {
        /* no importa el error */
    } finally {
        loggingOut.value = false;
        hasVotedSuccessfully.value = false;
        router.push('/estudiantes/login');
    }
};

// Al montar el componente, iniciar el flujo
onMounted(async () => {
    await partidoStore.fetchEleccionConPartidos();

    // Preprocesar partidos para agregar logoUrl
    partidos.value = partidos.value.map((p) => ({
        ...p,
        logoUrl: p.logo ? `${import.meta.env.VITE_STORAGE_URL}/${p.logo}` : '/default-logo.png' // ruta a tu logo por defecto
    }));
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex align-items-center justify-content-center p-4">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-4xl">
            <!-- Pantalla de Carga -->
            <div v-if="loading" class="text-center py-8">
                <i class="pi pi-spin pi-spinner text-5xl text-primary mb-4"></i>
                <p class="text-xl text-900 font-medium">Cargando información de la elección...</p>
            </div>

            <!-- Si NO hay elección activa -->
            <div v-else-if="!electionActive" class="text-center py-8">
                <i class="pi pi-exclamation-circle text-5xl text-orange-500 mb-4"></i>
                <h2 class="text-3xl font-bold text-900 mb-3">No hay elecciones activas en este momento.</h2>
                <p class="text-lg text-600 mb-5">Por favor, regresa más tarde o contacta a tu administrador.</p>
                <button @click="handleLogout" class="p-button p-button-primary p-button-lg">
                    <i class="pi pi-sign-out mr-2"></i>
                    Regresar al Login
                </button>
            </div>

            <!-- Si hay elección activa y no se ha votado -->
            <div v-else-if="!hasVotedSuccessfully">
                <div class="text-center mb-8">
                    <div class="flex items-center justify-center mb-3">
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eq1MCALZQpgHRV098Izl0xMwlwYilU.png?crop=0.0,0.0,0.15,0.1&height=60&width=60" alt="Logo Institucional Izquierdo" class="h-16 w-16 object-contain mr-4" />
                        <h2 class="text-4xl font-extrabold text-gray-900 m-0">{{ electionDetails.name }}</h2>
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eq1MCALZQpgHRV098Izl0xMwlwYilU.png?crop=0.85,0.0,0.15,0.1&height=60&width=60" alt="Logo Institucional Derecho" class="h-16 w-16 object-contain ml-4" />
                    </div>
                    <p class="text-lg text-gray-600 mb-4">
                        Periodo de votación:
                        <span class="font-semibold text-gray-700">{{ electionDetails.startDate }}</span>
                    </p>
                    <p class="text-xl font-semibold mb-6">
                        <span class="text-blue-700">Hola, </span>
                        <span class="text-gray-900">{{ user.nombre }} {{ user.apellido }}</span>
                    </p>

                    <p class="text-xl text-blue-700 font-semibold mb-6">Por favor, elige una lista para votar o selecciona la opción de voto nulo/blanco.</p>
                    <p v-if="message" :class="messageType === 'error' ? 'text-red-500' : 'text-green-500'" class="mt-4 text-lg font-medium">
                        {{ message }}
                    </p>
                </div>

                <!-- Partidos -->
                <!-- Partidos -->
                <div
                    v-for="(partido, index) in partidos"
                    :key="partido.id"
                    class="bg-white rounded-lg shadow-sm border-2 p-4 flex items-center justify-between transition-all duration-200 cursor-pointer"
                    :class="{
                        'border-blue-500 ring-4 ring-blue-100': selectedParty && selectedParty.id === partido.id,
                        'border-gray-200 hover:border-gray-300': !selectedParty || selectedParty.id !== partido.id
                    }"
                    @click="selectParty(partido)"
                >
                    <div class="flex items-center flex-grow">
                        <span class="text-3xl font-bold text-gray-900 mr-6 w-12 text-center">{{ index + 1 }}</span>

                        <!-- Logo del partido actual -->
                        <img :src="partido.logo ? baseLogoUrl + partido.logo : '/default-logo.png'" alt="Logo del partido" class="h-16 w-16 object-contain mr-4" />
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 m-0">{{ partido.nombre_partido }}</h3>
                        </div>
                    </div>

                    <div class="flex-shrink-0">
                        <button
                            @click.stop="selectParty(partido)"
                            :class="{
                                'bg-blue-600 text-white hover:bg-blue-700': selectedParty && selectedParty.id === partido.id,
                                'bg-blue-50 text-blue-700 hover:bg-blue-100': !selectedParty || selectedParty.id !== partido.id
                            }"
                            class="py-2 px-5 rounded-lg font-semibold transition-colors duration-200"
                        >
                            {{ selectedParty && selectedParty.id === partido.id ? 'Seleccionado' : 'Seleccionar' }}
                        </button>
                    </div>
                </div>

                <!-- Voto Blanco / Nulo -->
                <div class="flex flex-col md:flex-row justify-center gap-4 my-8">
                    <button
                        @click="selectBlankOrNull('en blanco')"
                        :class="{
                            'bg-white border-2 border-green-500 ring-4 ring-green-100 text-green-600': selectedVoteType === 'en blanco',
                            'bg-gray-100 text-gray-700 hover:bg-gray-200': selectedVoteType !== 'en blanco'
                        }"
                        class="py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center text-lg"
                    >
                        <i class="pi pi-circle-off mr-2"></i> Voto en Blanco
                    </button>

                    <button
                        @click="selectBlankOrNull('nulo')"
                        :class="{
                            'bg-white border-2 border-red-500 ring-4 ring-red-100 text-red-600': selectedVoteType === 'nulo',
                            'bg-gray-100 text-gray-700 hover:bg-gray-200': selectedVoteType !== 'nulo'
                        }"
                        class="py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center text-lg"
                    >
                        <i class="pi pi-ban mr-2"></i> Voto Nulo
                    </button>
                </div>

                <!-- Botón Confirmar -->
                <div class="text-center">
                    <button
                        @click="confirmVote"
                        :disabled="!selectedParty && !selectedVoteType"
                        class="bg-emerald-500 text-white py-4 px-8 rounded-xl text-xl font-bold shadow-lg hover:bg-emerald-600 transition-colors duration-300 flex items-center justify-center mx-auto"
                    >
                        <i class="pi pi-check-circle mr-2"></i>
                        Confirmar Voto
                    </button>
                </div>
            </div>

            <!-- Mensaje de voto registrado -->
            <div v-if="hasVotedSuccessfully" class="text-center py-8 fade-in-up">
                <!-- Mensaje de voto registrado -->
                <i class="pi pi-star-fill text-5xl text-yellow-500 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-900 mb-3">¡Voto Registrado con Éxito!</h2>
                <p class="text-lg text-600 mb-5">Gracias por participar en las elecciones estudiantiles.</p>

                <!-- Animación de cerrando sesión -->
                <div v-if="loggingOut" class="mt-6">
                    <i class="pi pi-spin pi-power-off text-5xl text-red-500 mb-4 animate-spin"></i>
                    <h2 class="text-3xl font-bold text-900 mb-3">Cerrando sesión...</h2>
                    <p class="text-lg text-600 mb-5">Espere un momento mientras se cierra su sesión.</p>
                    <p class="text-xl font-semibold">Redirigiendo en {{ countdown }}s</p>
                </div>
            </div>
        </div>

        <!-- Diálogo de Confirmación -->
        <div v-if="showConfirmationDialog" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" @click="showConfirmationDialog = false">
            <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4" @click.stop>
                <div class="text-center mb-5">
                    <i class="pi pi-question-circle text-5xl text-blue-500 mb-3"></i>
                    <h2 class="text-2xl font-bold text-900 mb-2">Confirmar tu Voto</h2>

                    <p class="text-600" v-if="selectedParty">Estás a punto de votar por la siguiente lista:</p>
                    <p class="text-600" v-else-if="selectedVoteType === 'nulo'">Estás a punto de emitir un <strong class="text-red-600">voto nulo</strong>. Este tipo de voto no será contado para ninguna lista.</p>
                    <p class="text-600" v-else-if="selectedVoteType === 'en blanco'">Estás a punto de emitir un <strong class="text-green-600">voto en blanco</strong>. Este voto indica neutralidad y no favorece a ningún candidato.</p>
                </div>

                <!-- Solo si hay un partido seleccionado -->
                <div v-if="selectedParty" class="border p-4 mb-5 text-center rounded-lg border-gray-200">
                    <img :src="selectedParty.logo ? baseLogoUrl + selectedParty.logo : '/default-logo.png'" :alt="`Logo de ${selectedParty.nombre_partido}`" class="w-24 h-24 object-contain mx-auto mb-3" />
                    <h3 class="text-2xl font-bold text-gray-900 mb-1">
                        {{ selectedParty.nombre_partido }}
                    </h3>
                </div>

                <!-- Mostrar un resumen genérico para nulo o blanco -->
                <div v-else-if="selectedVoteType" class="border p-4 mb-5 text-center rounded-lg border-gray-200">
                    <i class="pi pi-ban text-4xl mb-3 text-gray-500" v-if="selectedVoteType === 'nulo'"></i>
                    <i class="pi pi-circle-off text-4xl mb-3 text-gray-500" v-else-if="selectedVoteType === 'en blanco'"></i>
                    <h3 class="text-2xl font-bold text-gray-800 capitalize">{{ selectedVoteType }}</h3>
                </div>

                <div class="flex flex-col gap-4">
                    <button @click="submitVote" class="bg-emerald-500 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:bg-emerald-600 transition-colors duration-300 flex items-center justify-center">
                        <i class="pi pi-check-circle mr-3"></i>
                        Confirmar y Emitir Voto
                    </button>
                    <button @click="showConfirmationDialog = false" class="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center">
                        <i class="pi pi-times-circle mr-3"></i>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
        <!-- Diálogo cuando ya votó -->
    </div>
    <div v-if="showAlreadyVotedDialog" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4 text-center">
            <i class="pi pi-check-circle text-5xl text-green-600 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Ya has votado</h2>
            <p class="text-gray-700 mb-6">Tu voto ya fue registrado en esta elección. Gracias por participar.</p>
            <button @click="handleLogout" class="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center mx-auto">
                <i class="pi pi-sign-out mr-2"></i>
                Regresar al Login
            </button>
        </div>
    </div>
</template>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
/* Estilos PrimeVue-like reutilizados y adaptados */
.min-h-screen {
    min-height: 100vh;
}
.surface-ground {
    background-color: #f8fafc;
}
.surface-card {
    background-color: #ffffff;
}
.shadow-5 {
    box-shadow:
        0 19px 38px rgba(0, 0, 0, 0.3),
        0 15px 12px rgba(0, 0, 0, 0.22);
}
.border-round {
    border-radius: 6px;
}
.border-2 {
    border-width: 2px;
}
.border-primary {
    border-color: #3b82f6;
}
.border-1 {
    border-width: 1px;
}
.surface-border {
    border-color: #e2e8f0;
}

.p-5 {
    padding: 1.25rem;
}
.p-4 {
    padding: 1rem;
}
.p-6 {
    padding: 1.5rem;
}
.py-8 {
    padding-top: 2rem;
    padding-bottom: 2rem;
}

.w-full {
    width: 100%;
}
.max-w-3xl {
    max-width: 48rem;
}
.max-w-4xl {
    max-width: 64rem;
}
.max-w-md {
    max-width: 28rem;
}
.max-w-lg {
    max-width: 36rem;
}

.flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
}
.flex-grow-1 {
    flex-grow: 1;
}
.align-items-center {
    align-items: center;
}
.justify-content-center {
    justify-content: center;
}
.justify-content-between {
    justify-content: space-between;
}
.text-center {
    text-align: center;
}

.text-900 {
    color: #0f172a;
}
.text-600 {
    color: #475569;
}
.text-500 {
    color: #64748b;
}
.text-primary {
    color: #3b82f6;
}
.text-orange-500 {
    color: #f97316;
}
.text-red-500 {
    color: #ef4444;
}
.text-green-500 {
    color: #22c55e;
}
.text-yellow-500 {
    color: #facc15;
}
.text-gray-900 {
    color: #111827;
}
.text-gray-800 {
    color: #1f2937;
}
.text-gray-700 {
    color: #374151;
}
.text-gray-600 {
    color: #4b5563;
}
.text-blue-600 {
    color: #2563eb;
}
.text-blue-700 {
    color: #1d4ed8;
}

.font-bold {
    font-weight: 700;
}
.font-medium {
    font-weight: 500;
}
.font-semibold {
    font-weight: 600;
}
.font-extrabold {
    font-weight: 800;
}

.text-sm {
    font-size: 0.875rem;
}
.text-lg {
    font-size: 1.125rem;
}
.text-xl {
    font-size: 1.25rem;
}
.text-2xl {
    font-size: 1.5rem;
}
.text-3xl {
    font-size: 1.875rem;
}
.text-4xl {
    font-size: 2.25rem;
}
.text-5xl {
    font-size: 3rem;
}
.text-base {
    font-size: 1rem;
}

.mb-2 {
    margin-bottom: 0.5rem;
}
.mb-3 {
    margin-bottom: 0.75rem;
}
.mb-4 {
    margin-bottom: 1rem;
}
.mb-5 {
    margin-bottom: 1.25rem;
}
.mb-6 {
    margin-bottom: 1.5rem;
}
.mb-8 {
    margin-bottom: 2rem;
}
.mr-2 {
    margin-right: 0.5rem;
}
.mr-3 {
    margin-right: 0.75rem;
}
.mr-4 {
    margin-right: 1rem;
}
.mt-3 {
    margin-top: 0.75rem;
}
.mt-4 {
    margin-top: 1rem;
}

.gap-3 {
    gap: 0.75rem;
}
.gap-4 {
    gap: 1rem;
}

.list-none {
    list-style: none;
}
.space-y-1 > * + * {
    margin-top: 0.25rem;
}
.space-y-2 > * + * {
    margin-top: 0.5rem;
}

.cursor-pointer {
    cursor: pointer;
}

/* PrimeVue Button Styles */
.p-button {
    display: inline-flex;
    cursor: pointer;
    user-select: none;
    align-items: center;
    vertical-align: bottom;
    text-align: center;
    overflow: hidden;
    position: relative;
    color: #ffffff;
    background: #3b82f6;
    border: 1px solid #3b82f6;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    transition:
        background-color 0.2s,
        color 0.2s,
        border-color 0.2s,
        box-shadow 0.2s;
    border-radius: 6px;
}
.p-button:hover {
    background: #2563eb;
    border-color: #2563eb;
}
.p-button-primary {
    background: #3b82f6;
    border-color: #3b82f6;
}
.p-button-primary:hover {
    background: #2563eb;
    border-color: #2563eb;
}
.p-button-success {
    background: #10b981;
    border-color: #10b981;
}
.p-button-success:hover {
    background: #059669;
    border-color: #059669;
}
.p-button-outlined {
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
}
.p-button-outlined:hover {
    background: #3b82f6;
    color: #ffffff;
}
.p-button-text {
    background: transparent;
    color: #6b7280;
    border: 1px solid transparent;
}
.p-button-text:hover {
    background: #f3f4f6;
    color: #374151;
}
.p-button-sm {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
}
.p-button-lg {
    font-size: 1.125rem;
    padding: 1rem 1.5rem;
}
.p-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* PrimeVue Grid System */
.grid {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.5rem;
    margin-left: -0.5rem;
    margin-top: -0.5rem;
}
.col-12 {
    flex: 0 0 auto;
    padding: 0.5rem;
    width: 100%;
}
@media screen and (min-width: 768px) {
    .md\:col-6 {
        width: 50%;
    }
}
@media screen and (min-width: 1024px) {
    .lg\:col-4 {
        width: 33.3333%;
    }
}

/* Backgrounds */
.bg-primary-100 {
    background-color: #dbeafe;
}
.bg-blue-100 {
    background-color: #e0f2fe;
}
.bg-blue-50 {
    background-color: #f0f9ff;
}
.bg-white {
    background-color: #ffffff;
}
.bg-emerald-500 {
    background-color: #10b981;
}
.bg-emerald-600 {
    background-color: #059669;
}
.bg-blue-600 {
    background-color: #2563eb;
}
.bg-blue-700 {
    background-color: #1d4ed8;
}
.bg-gray-100 {
    background-color: #f3f4f6;
}
.bg-gray-200 {
    background-color: #e5e7eb;
}

/* Text Colors */
.text-white {
    color: #ffffff;
}
.text-blue-500 {
    color: #3b82f6;
}
.text-blue-600 {
    color: #2563eb;
}
.text-blue-700 {
    color: #1d4ed8;
}
.text-gray-700 {
    color: #374151;
}
.text-gray-600 {
    color: #4b5563;
}

/* Borders */
.border-blue-500 {
    border-color: #3b82f6;
}
.border-gray-200 {
    border-color: #e5e7eb;
}
.border-t {
    border-top-width: 1px;
}
.border-gray-100 {
    border-color: #f3f4f6;
}

/* Rounded Corners */
.rounded-xl {
    border-radius: 0.75rem;
}
.rounded-2xl {
    border-radius: 1.25rem;
}
.rounded-lg {
    border-radius: 0.5rem;
}
.rounded-full {
    border-radius: 9999px;
}

/* Shadows */
.shadow-md {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.shadow-lg {
    box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-xl {
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Transitions */
.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}
.transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}
.duration-200 {
    transition-duration: 200ms;
}
.duration-300 {
    transition-duration: 300ms;
}

/* Hover Effects */
.hover\:shadow-lg:hover {
    box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.hover\:bg-blue-700:hover {
    background-color: #1d4ed8;
}
.hover\:bg-blue-100:hover {
    background-color: #e0f2fe;
}
.hover\:bg-emerald-600:hover {
    background-color: #059669;
}
.hover\:bg-gray-200:hover {
    background-color: #e5e7eb;
}
.hover\:border-gray-300:hover {
    border-color: #d1d5db;
}

/* Flexbox */
.items-center {
    align-items: center;
}
.justify-center {
    justify-content: center;
}

/* Sizing */
.w-full {
    width: 100%;
}
.py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
}
.py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
}
.px-5 {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
}
.px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}
.px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
}
.mx-auto {
    margin-left: auto;
    margin-right: auto;
}
.w-12 {
    width: 3rem;
}
.w-16 {
    width: 4rem;
}
.h-16 {
    height: 4rem;
}
.flex-shrink-0 {
    flex-shrink: 0;
}

/* Font */
.font-semibold {
    font-weight: 600;
}

/* Text */
.text-xl {
    font-size: 1.25rem;
}
.text-lg {
    font-size: 1.125rem;
}
.text-md {
    font-size: 0.875rem;
}
.text-3xl {
    font-size: 1.875rem;
}
.text-4xl {
    font-size: 2.25rem;
}

/* Gradients */
.bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, #f8fafc, #eff6ff);
}

/* Animations */
.pi-spin {
    animation: pi-spin 2s infinite linear;
}
@keyframes pi-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-bounce {
    animation: bounce 1s infinite;
}
@keyframes bounce {
    0%,
    100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
        transform: none;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}

.fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
}
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Ring */
.ring-4 {
    --tw-ring-offset-shadow: var(--tw-shadow-colored, 0 0 #0000);
    --tw-ring-shadow: var(--tw-shadow-colored, 0 0 #0000);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    ring-width: 4px;
}

.ring-blue-100 {
    --tw-ring-color: #e0f2fe;
    --tw-ring-offset-shadow: var(--tw-shadow-colored, 0 0 #0000);
    --tw-ring-shadow: var(--tw-shadow-colored, 0 0 #0000);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    ring-color: var(--tw-ring-color);
}
</style>
