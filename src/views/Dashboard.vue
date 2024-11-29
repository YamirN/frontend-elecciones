<script setup>
import { useLayout } from '@/layout/composables/layout';
import echo from '@/service/echo';
import { obtenerResultados } from '@/service/voterService';
import { onMounted, ref, watch } from 'vue';
const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartOptions = ref(null);
const totalVotantes = ref(0);
const votantesQueVotaron = ref(0);
const votantesPendientes = ref(0);
const resultados = ref({});
const estadisticas = ref({});
const chartData = ref({});



const fetchResultados = async () => {
    try {
        const data = await obtenerResultados(); // Llama a la API
        resultados.value = data.resultados;     // Asigna solo los resultados de los candidatos
        totalVotantes.value = data.estadisticas.totalVotantes;
        votantesQueVotaron.value = data.estadisticas.votantesQueVotaron;
        votantesPendientes.value = data.estadisticas.votantesPendientes; // Asigna solo las estadísticas de votantes
        setChartData(data.resultados);
    } catch (error) {
        console.error('Error al actualizar los resultados:', error);
    }
};



const setChartData = (resultados) => {


    const documentStyle = getComputedStyle(document.documentElement);

    if (!resultados || typeof resultados !== 'object' || Object.keys(resultados).length === 0) {
        console.warn('No se encontraron resultados válidos.');
        chartData.value = {
            labels: [],
            datasets: [
                {
                    type: 'bar',
                    label: 'Votos',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    data: [],
                    barThickness: 32,
                },
            ],
        };
        return;
    }

    // Mapea los datos de la respuesta
    const candidateFullNames = Object.values(resultados).map(c => c.nombre || 'Nombre no disponible');
    const cantidadVotos = Object.values(resultados).map(c => c.votos || 0);

    chartData.value = {
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
};



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
    if (!foto) {
        return '/path/to/default/image.png';
    }
    return `${import.meta.env.VITE_APP_API_URL}/storage/${foto}`;
};

onMounted(() => {
    echo.channel('votos')
        .listen('NuevoVoto', (event) => {

            setChartData(event.resultados.resultados);
            resultados.value = event.resultados.resultados;

            totalVotantes.value = event.resultados.estadisticas.totalVotantes;
            votantesQueVotaron.value = event.resultados.estadisticas.votantesQueVotaron;
            votantesPendientes.value = event.resultados.estadisticas.votantesPendientes;
        });

    fetchResultados();
    getImageUrl();
});

watch([getPrimary, getSurface, isDarkTheme], () => {
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
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{
                            totalVotantes }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 !text-xl"></i>
                    </div>
                </div>

            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Numero total de votos emitidos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{
                            votantesQueVotaron }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-orange-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user text-green-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Faltan votar</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{
                            votantesPendientes }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-cyan-400/10 rounded-border"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user-minus text-red-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>



        <div class="col-span-12 xl:col-span-5">



            <div class="card">
                <h2 class="text-xl font-semibold mb-4">Ranking de Candidatos</h2>
                <div class="space-y-4">

                    <div class="bg-gray-100 dark:bg-gray-400/10 rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:shadow-md"
                        v-for="(candidato) in resultados" :key="candidato.id">


                        <div class="md:flex-shrink-0">

                            <img class="h-40 w-full object-cover md:w-40" :src="getImageUrl(candidato.foto)"
                                loading="lazy" />
                        </div>
                        <div class="w-full p-8 flex flex-col justify-center">
                            <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                Candidato
                            </div>
                            <h2 class="block mt-1 text-lg leading-tight font-medium text-gray-500">
                                {{ candidato.nombre }}
                            </h2>

                            <div class="mt-4">
                                <div class="flex items-center">
                                    <div class="text-3xl font-bold text-indigo-500 mr-2">
                                        {{ candidato.porcentaje }}%
                                    </div>
                                    <div class="w-full bg-gray-300 rounded-full h-2.5">
                                        <div class="bg-indigo-600 h-2.5 rounded-full"
                                            :style="{ width: `${(candidato.porcentaje)}%` }">
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

        <div class="card">
            <div class="col-span-12 xl:col-span-7">

                <div class="font-semibold text-xl mb-4">Cantidad de votos por candidato</div>
                <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
            </div>

        </div>
    </div>
</template>
