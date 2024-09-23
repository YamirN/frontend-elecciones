<script setup>
import { useLayout } from '@/layout/composables/layout';
import { fetchCandidate } from '@/service/candidateService';
import { ObtenerNoVotantes, ObtenerVotantes, ObtenerVotantesOk } from '@/service/voterService';
import { onMounted, ref, watch } from 'vue';
const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartData = ref(null);
const chartOptions = ref(null);
const cantidadNoVotantes = ref();
const cantidadVotantes = ref();
const cantidadVotantesOk = ref();

const getNoVoters = async () => {
    try {
        const response = await ObtenerNoVotantes();
        cantidadNoVotantes.value = response.cantidad;

    } catch (error) {
        error.value = 'Ocurrió un error al obtener los datos del usuario.';
    }
};

const getVoters = async () => {
    try {
        const response = await ObtenerVotantes();
        cantidadVotantes.value = response.cantidad;

    } catch (error) {
        error.value = 'Ocurrió un error al obtener los datos del usuario.';
    }
};

const getVotersOk = async () => {
    try {
        const response = await ObtenerVotantesOk();
        cantidadVotantesOk.value = response.cantidad;

    } catch (error) {
        error.value = 'Ocurrió un error al obtener los datos del usuario.';
    }
};

const candidatos = ref([]);
const getCandidate = async () => {
    try {
        const response = await fetchCandidate();
        candidatos.value = response.candidato;

    } catch (error) {
        error.value = 'Ocurrió un error al obtener los datos del usuario.';
    }
};

onMounted(async () => {

    await Promise.all([getCandidate(), getVotersOk(), getNoVoters(), getVoters()]);

    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const candidateFullNames = candidatos.value.map(c =>
        `${c.users[0]?.name || 'vacio'} ${c.users[0]?.last_name}`
    );
    const cantidadVotos = candidatos.value.map(c => c.votos_count || '0');
    return {
        labels: candidateFullNames,
        datasets: [
            {
                type: 'bar',
                label: 'Votos',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                data: cantidadVotos,
                barThickness: 32,
            },
        ],

    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textMutedColor,
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }

    };
}


const getImageUrl = (foto) => {
    // Devuelve la URL completa de la imagen
    return `${import.meta.env.VITE_APP_API_URL}/storage/${foto}`;

};
onMounted(getImageUrl);


watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Numero total de votantes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadVotantes }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">X nuevos </span>
                <span class="text-muted-color">votantes recientes registrados</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Numero total de votos emitidos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadVotantesOk }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-orange-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user text-green-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">X </span>
                <span class="text-muted-color">nuevos votos recientes registrados</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">No Votaron</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadNoVotantes }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-cyan-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user-minus text-red-500 !text-xl"></i>
                    </div>
                </div>

                <span class="text-muted-color"> Estudiantes sin voto</span>
            </div>
        </div>



        <div class="col-span-12 xl:col-span-5">

            <div v-if="candidatos.length">

                <div class="card">
                    <h2 class="text-xl font-semibold  mb-4">Ranking de Candidatos</h2>
                    <div class="space-y-4">
                        <div class="bg-gray-100 dark:bg-gray-400/10 rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:shadow-md"
                            v-for="(candidato, index) in candidatos" :key="candidato.id">

                            <div class="text-2xl font-bold text-gray-500 w-8">{{ index + 1 }}</div>
                            <div class="md:flex-shrink-0">

                                <img class="h-40 w-full object-cover md:w-40" :src="getImageUrl(candidato.foto)"
                                    loading="lazy" />
                            </div>
                            <div class="w-full p-8 flex flex-col justify-center">
                                <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                    Candidato
                                </div>
                                <h2 class="block mt-1 text-lg leading-tight font-medium text-gray-500">
                                    {{ candidato.users[0]?.name }} {{ candidato.users[0]?.last_name }}
                                </h2>

                                <div class="mt-4">
                                    <div class="flex items-center">
                                        <div class="text-3xl font-bold text-indigo-500 mr-2">
                                            {{ ((candidato.votos_count / cantidadVotantes) * 100).toFixed(2) }}%
                                        </div>
                                        <div class="w-full bg-gray-300 rounded-full h-2.5">
                                            <div class="bg-indigo-600 h-2.5 rounded-full"
                                                :style="{ width: `${((candidato.votos_count / cantidadVotantes) * 100)}%` }">
                                            </div>

                                        </div>
                                    </div>
                                    <p class="mt-2 text-gray-500">Porcentaje de votos</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div class="col-span-12 xl:col-span-7">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Cantidad de votos por candidato</div>
                <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
            </div>

        </div>
    </div>
</template>
