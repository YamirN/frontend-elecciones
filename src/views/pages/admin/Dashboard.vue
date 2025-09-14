<script setup>
import { useEleccionStore } from '@/stores/eleccionesStore';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

const eleccionStore = useEleccionStore();
const { elecciones, metricas } = storeToRefs(eleccionStore);
// Tiempo actual
const currentTime = ref('');

const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// KPIs principales
const kpis = computed(() => [
    {
        title: 'Estudiantes Registrados',
        value: metricas.value?.estudiantes_registrados ?? 0,
        subtitle: 'Total habilitados',
        icon: 'pi-users',
        color: '#3B82F6'
    },
    {
        title: 'Votos Emitidos',
        value: metricas.value?.votos_emitidos ?? 0,
        subtitle: `${metricas.value?.porcentaje_participacion ?? 0}% participación`,
        icon: 'pi-check-circle',
        color: '#10B981'
    },
    {
        title: 'Votos Pendientes',
        value: metricas.value?.votos_pendientes ?? 0,
        subtitle: `${metricas.value?.porcentaje_restante ?? 0}% restante`,
        icon: 'pi-clock',
        color: '#F59E0B'
    },
    {
        title: 'Votos en Blanco',
        value: metricas.value?.votos_blanco ?? 0,
        subtitle: `${metricas.value?.porcentaje_blanco ?? 0}% del total`,
        icon: 'pi-minus-circle',
        color: '#6B7280'
    },
    {
        title: 'Votos Nulos',
        value: metricas.value?.votos_nulos ?? 0,
        subtitle: `${metricas.value?.porcentaje_nulos ?? 0}% del total`,
        icon: 'pi-times-circle',
        color: '#EF4444'
    },
    {
        title: 'Listas Inscritos',
        value: metricas.value?.listas_inscritas ?? 0,
        subtitle: 'Activos en proceso',
        icon: 'pi-user-plus',
        color: '#8B5CF6'
    }
]);

let timeInterval;

onMounted(async () => {
    updateTime();
    timeInterval = setInterval(updateTime, 60000);

    await nextTick();
});

onUnmounted(() => {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
});

// Agrupar datos de la API en formato { nombre: 'Mesa XX', resultados: { ListaA: 10, ListaB: 20 } }
const mesas = computed(() => {
    const agrupado = {};

    metricas.value?.votos_por_mesa?.forEach((item) => {
        const mesaNombre = item.mesa?.codigo_mesa || `Mesa ${item.mesa_id}`;
        if (!agrupado[mesaNombre]) {
            agrupado[mesaNombre] = { nombre: mesaNombre, resultados: {} };
        }
        agrupado[mesaNombre].resultados[item.partido?.nombre_partido || 'Desconocido'] = item.total;
    });

    return Object.values(agrupado);
});

// Sacar dinámicamente las listas (etiquetas del gráfico)
const listaLabels = computed(() => {
    const sets = new Set();
    mesas.value.forEach((mesa) => {
        Object.keys(mesa.resultados).forEach((k) => sets.add(k));
    });
    return Array.from(sets);
});

// Preparar datasets para Chart.js
const chartData = computed(() => {
    return {
        labels: mesas.value.map((m) => m.nombre),
        datasets: listaLabels.value.map((lista, index) => {
            const colors = ['#3b82f6', '#10b981', '#ef4444', '#6b7280', '#f59e0b'];
            return {
                label: lista,
                data: mesas.value.map((m) => m.resultados[lista] || 0),
                backgroundColor: colors[index % colors.length]
            };
        })
    };
});

const chartOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
    },
    scales: {
        x: { stacked: true, beginAtZero: true },
        y: {
            stacked: true,
            ticks: { autoSkip: false, precision: 0 }
        }
    }
};

// Total de votos por mesa
const totalVotos = (mesa) => Object.values(mesa.resultados).reduce((a, b) => a + b, 0);

const eleccionSeleccionada = ref('');

const cargarMetricas = async () => {
    if (eleccionSeleccionada.value) {
        await eleccionStore.obtenerMetricas(eleccionSeleccionada.value);
    }
};
const estadoEleccion = computed(() => {
    const eleccion = elecciones.value.find((e) => e.id === eleccionSeleccionada.value);
    return eleccion ? eleccion.estado : '';
});

const estadoConfig = computed(() => {
    switch (estadoEleccion.value) {
        case 'en_proceso':
            return { label: 'En Proceso', color: '#10b981', textColor: '#059669' };
        case 'pendiente':
            return { label: 'Pendiente', color: '#f59e0b', textColor: '#b45309' };
        case 'finalizada':
            return { label: 'Finalizada', color: '#ef4444', textColor: '#b91c1c' };
        default:
            return { label: 'Sin Estado', color: '#6b7280', textColor: '#374151' };
    }
});

//
const topListas = computed(() => {
    // aseguramos que no sea null
    if (!eleccionStore.metricas?.votos_por_lista) return [];

    // devolvemos ya ordenado por total de votos descendente
    return [...eleccionStore.metricas.votos_por_lista].sort((a, b) => b.total - a.total);
});

// Colores para ranking
const rankColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#6366f1'];

onMounted(async () => {
    await eleccionStore.ListaEleccion();

    const enProceso = elecciones.value.find((e) => e.estado === 'en_proceso');
    if (enProceso) {
        eleccionSeleccionada.value = enProceso.id;
        await eleccionStore.obtenerMetricas(enProceso.id);
    }

    updateTime();
    timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval);
});
</script>

<template>
    <div class="min-h-screen" style="background-color: #f8f9fa; padding: 1rem">
        <!-- 1. Encabezado -->
        <div style="background: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem">
            <div style="display: flex; justify-content: space-between; align-items: center">
                <div style="display: flex; align-items: center; gap: 1rem">
                    <i class="pi pi-chart-bar" style="font-size: 2.5rem; color: #3b82f6"></i>
                    <div>
                        <h1 style="margin: 0; font-size: 2rem; font-weight: bold; color: #1f2937">Dashboard Electoral</h1>
                        <p style="margin: 0.25rem 0 0 0; font-size: 1.1rem; color: #6b7280">
                            <select v-model="eleccionSeleccionada" @change="cargarMetricas" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 0.25rem 0.5rem; font-size: 1rem; color: #374151">
                                <option disabled value="">Seleccione una elección</option>
                                <option v-for="e in elecciones" :key="e.id" :value="e.id">
                                    {{ e.nombre }}
                                </option>
                            </select>
                        </p>
                    </div>
                </div>
                <div style="text-align: right">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                        <i class="pi pi-circle-fill" :style="{ color: estadoConfig.color, fontSize: '0.75rem' }"></i>
                        <span :style="{ fontWeight: 600, color: estadoConfig.textColor }">
                            {{ estadoConfig.label }}
                        </span>
                    </div>
                    <p style="margin: 0; font-size: 0.875rem; color: #6b7280">{{ currentTime }}</p>
                </div>
            </div>
        </div>

        <!-- 2. KPIs Principales -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1.5rem">
            <div v-for="kpi in kpis" :key="kpi.title" style="background: white; border-radius: 8px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
                <i :class="`pi ${kpi.icon}`" :style="{ fontSize: '2.5rem', color: kpi.color, marginBottom: '1rem', display: 'block' }"></i>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: bold; color: #1f2937">{{ kpi.value }}</h3>
                <p style="margin: 0 0 0.25rem 0; color: #6b7280; font-weight: 500">{{ kpi.title }}</p>
                <small style="color: #9ca3af" v-if="kpi.subtitle">{{ kpi.subtitle }}</small>
            </div>
        </div>
        <!-- Aviso si la elección está en proceso -->
        <div v-if="metricas?.estado_eleccion === 'en_proceso'" class="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-700 text-center">
            ⚠️ Los resultados detallados (votos nulos, blancos, por lista y por mesa) estarán disponibles cuando la elección finalice.
        </div>
        <!-- 2.5. Top Listas (después de KPIs) -->
        <!-- Resultados por Lista -->
        <div style="margin-bottom: 1.5rem; background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
            <!-- Título -->
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                <i class="pi pi-trophy" style="color: #f59e0b"></i>
                <h3 style="margin: 0; color: #1f2937">Resultados por Lista</h3>
            </div>

            <!-- Grid de listas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem">
                <div
                    v-for="(lista, index) in topListas"
                    :key="lista.id"
                    style="background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; justify-content: space-between; min-height: 120px"
                >
                    <!-- Ranking Badge -->
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                        <div
                            :style="{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '50%',
                                backgroundColor: rankColors[index % rankColors.length],
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }"
                        >
                            {{ index + 1 }}
                        </div>
                        <p style="margin: 0; font-weight: 600; font-size: 1rem; color: #1f2937">
                            {{ lista.nombre_partido }}
                        </p>
                    </div>

                    <!-- Barra proporcional -->
                    <div style="height: 12px; border-radius: 6px; background: #e5e7eb; overflow: hidden; margin-bottom: 0.5rem">
                        <div
                            :style="{
                                width: topListas.length ? `${(lista.total / topListas[0].total) * 100}%` : '0%',
                                height: '100%',
                                background: `linear-gradient(90deg, ${rankColors[index % rankColors.length]} 0%, ${rankColors[index % rankColors.length]}99 100%)`,
                                transition: 'width 0.5s ease'
                            }"
                        ></div>
                    </div>

                    <!-- Total de votos -->
                    <div style="text-align: right; font-weight: 600; color: #1f2937; font-size: 0.95rem">{{ lista.total }} votos</div>
                </div>
            </div>
        </div>

        <!-- Votos por Mesa con gráfico -->
        <div style="margin-bottom: 1.5rem; background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
            <!-- Título -->
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                <i class="pi pi-table" style="color: #3b82f6"></i>
                <h3 style="margin: 0; color: #1f2937">Votos por Mesa</h3>
            </div>

            <!-- Gráfico con scroll -->
            <div style="height: 400px; overflow-x: auto; padding: 1rem">
                <Chart type="bar" :data="chartData" :options="chartOptions" style="min-width: 1000px; height: 100%" />
            </div>

            <!-- Totales por mesa -->
            <div style="margin-top: 1rem; display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem">
                <div v-for="mesa in mesas" :key="mesa.nombre" class="p-3 rounded-lg shadow-sm bg-gray-100 text-center flex-shrink-0" style="width: 140px; border-left: 4px solid #3b82f6">
                    <p class="font-semibold mb-1">{{ mesa.nombre }}</p>
                    <p class="text-gray-700">
                        Total Votos: <span class="font-bold">{{ totalVotos(mesa) }}</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
