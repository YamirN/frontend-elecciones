<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';
const { getPrimary, getSurface, isDarkTheme } = useLayout();
const chartOptions = ref(null);
const totalVotantes = ref(0);
const votantesQueVotaron = ref(0);
const votantesPendientes = ref(0);
// const resultados = ref({});
// const estadisticas = ref({});
// const chartData = ref({});

// const estats = [
//     {
//         titulo: 'Número total de votantes',
//         valor: totalVotantes,
//         icono: 'pi pi-users',
//         bg: 'bg-blue-100 dark:bg-blue-400/10',
//         color: '#3B82F6'
//     },
//     {
//         titulo: 'Votos emitidos',
//         valor: votantesQueVotaron,
//         icono: 'pi pi-check-circle',
//         bg: 'bg-green-100 dark:bg-green-400/10',
//         color: '#10B981'
//     },
//     {
//         titulo: 'Faltan votar',
//         valor: votantesPendientes,
//         icono: 'pi pi-user-minus',
//         bg: 'bg-red-100 dark:bg-red-400/10',
//         color: '#EF4444'
//     }
// ];

// const fetchResultados = async () => {
//     try {
//         const data = await obtenerResultados(); // Llama a la API
//         resultados.value = data.resultados; // Asigna solo los resultados de los candidatos
//         totalVotantes.value = data.estadisticas.totalVotantes;
//         votantesQueVotaron.value = data.estadisticas.votantesQueVotaron;
//         votantesPendientes.value = data.estadisticas.votantesPendientes; // Asigna solo las estadísticas de votantes
//         setChartData(data.resultados);
//     } catch (error) {
//         console.error('Error al actualizar los resultados:', error);
//     }
// };

// const setChartData = (resultados) => {
//     const documentStyle = getComputedStyle(document.documentElement);

//     if (!resultados || typeof resultados !== 'object' || Object.keys(resultados).length === 0) {
//         console.warn('No se encontraron resultados válidos.');
//         chartData.value = {
//             labels: [],
//             datasets: [
//                 {
//                     type: 'bar',
//                     label: 'Votos',
//                     backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
//                     data: [],
//                     barThickness: 32
//                 }
//             ]
//         };
//         return;
//     }

//     // Mapea los datos de la respuesta
//     const candidateFullNames = Object.values(resultados).map((c) => c.nombre || 'Nombre no disponible');
//     const cantidadVotos = Object.values(resultados).map((c) => c.votos || 0);

//     chartData.value = {
//         labels: candidateFullNames,
//         datasets: [
//             {
//                 type: 'bar',
//                 label: 'Votos',
//                 backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
//                 data: cantidadVotos,
//                 barThickness: 32
//             }
//         ]
//     };
// };

// function setChartOptions() {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const borderColor = documentStyle.getPropertyValue('--surface-border');
//     const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

//     return {
//         maintainAspectRatio: false,
//         aspectRatio: 0.8,
//         scales: {
//             x: {
//                 stacked: true,
//                 ticks: {
//                     color: textMutedColor
//                 },
//                 grid: {
//                     color: 'transparent',
//                     borderColor: 'transparent'
//                 }
//             },
//             y: {
//                 stacked: true,
//                 ticks: {
//                     color: textMutedColor
//                 },
//                 grid: {
//                     color: borderColor,
//                     borderColor: 'transparent',
//                     drawTicks: false
//                 }
//             }
//         }
//     };
// }

// const getImageUrl = (foto) => {
//     if (!foto) {
//         return '/path/to/default/image.png';
//     }
//     return `${import.meta.env.VITE_APP_API_URL}/storage/${foto}`;
// };

// onMounted(() => {
//     echo.channel('votos').listen('NuevoVoto', (event) => {
//         setChartData(event.resultados.resultados);
//         resultados.value = event.resultados.resultados;

//         totalVotantes.value = event.resultados.estadisticas.totalVotantes;
//         votantesQueVotaron.value = event.resultados.estadisticas.votantesQueVotaron;
//         votantesPendientes.value = event.resultados.estadisticas.votantesPendientes;
//     });

//     fetchResultados();
//     getImageUrl();
// });

// watch([getPrimary, getSurface, isDarkTheme], () => {
//     chartOptions.value = setChartOptions();
// });
</script>

<template>
    <div class="grid grid-cols-12 gap-6 xl:gap-8">
        <!-- Estadísticas -->
        <div v-for="card in estats" :key="card.titulo" class="col-span-12 sm:col-span-6 xl:col-span-4">
            <div class="bg-white dark:bg-gray-800 shadow rounded-xl p-5 flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">
                        {{ card.titulo }}
                    </p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">
                        {{ card.valor }}
                    </p>
                </div>
                <div class="flex items-center justify-center w-12 h-12 rounded-full" :class="card.bg">
                    <i :class="card.icono" class="text-xl" :style="{ color: card.color }"></i>
                </div>
            </div>
        </div>

        <!-- Candidatos -->
        <div class="col-span-12 xl:col-span-5">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Candidatos - Porcentajes</h2>
                <div class="space-y-5">
                    <div v-for="candidato in resultados" :key="candidato.id" class="flex items-center space-x-5 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow transition">
                        <img :src="getImageUrl(candidato.foto)" class="w-20 h-20 rounded-full object-cover" />
                        <div class="flex-1">
                            <p class="text-sm text-indigo-500 font-semibold uppercase">Candidato</p>
                            <h3 class="text-lg font-medium text-gray-700 dark:text-white">{{ candidato.nombre }}</h3>
                            <div class="mt-2">
                                <div class="flex items-center gap-3">
                                    <span class="text-indigo-600 font-bold text-xl">{{ candidato.porcentaje }}%</span>
                                    <div class="w-full h-2.5 bg-gray-300 rounded-full overflow-hidden">
                                        <div class="h-full bg-indigo-600" :style="{ width: `${candidato.porcentaje}%` }"></div>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Porcentaje de votos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráfico -->
        <div class="col-span-12 xl:col-span-7">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Cantidad de votos por candidato</h2>
                <Chart type="bar" :data="chartData" :options="chartOptions" class="h-100" />
            </div>
        </div>
    </div>
</template>
