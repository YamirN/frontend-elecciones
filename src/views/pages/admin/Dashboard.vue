<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

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

// Referencias para los canvas
const barChart = ref(null);
const lineChart = ref(null);
const doughnutChart = ref(null);
const stackedChart = ref(null);

// KPIs principales
const kpis = ref([
    {
        title: 'Estudiantes Registrados',
        value: '1,247',
        subtitle: 'Total habilitados',
        icon: 'pi-users',
        color: '#3B82F6'
    },
    {
        title: 'Votos Emitidos',
        value: '892',
        subtitle: '71.5% participación',
        icon: 'pi-check-circle',
        color: '#10B981'
    },
    {
        title: 'Votos Pendientes',
        value: '355',
        subtitle: '28.5% restante',
        icon: 'pi-clock',
        color: '#F59E0B'
    },
    {
        title: 'Votos en Blanco',
        value: '23',
        subtitle: '2.6% del total',
        icon: 'pi-minus-circle',
        color: '#6B7280'
    },
    {
        title: 'Votos Nulos',
        value: '8',
        subtitle: '0.9% del total',
        icon: 'pi-times-circle',
        color: '#EF4444'
    },
    {
        title: 'Candidatos Inscritos',
        value: '5',
        subtitle: 'Activos en proceso',
        icon: 'pi-user-plus',
        color: '#8B5CF6'
    }
]);

// Top candidatos
const topCandidatos = ref([
    { nombre: 'María González', partido: 'Lista Verde', votos: 234 },
    { nombre: 'Carlos Rodríguez', partido: 'Lista Azul', votos: 198 },
    { nombre: 'Ana Martínez', partido: 'Lista Roja', votos: 156 }
]);

// Participación por grados
const participacionGrados = ref([
    { nombre: '10mo Grado', porcentaje: 78, votaron: 156, total: 200, pendientes: 44 },
    { nombre: '11vo Grado', porcentaje: 82, votaron: 164, total: 200, pendientes: 36 },
    { nombre: '12vo Grado', porcentaje: 85, votaron: 170, total: 200, pendientes: 30 }
]);

// Resumen por aulas
const resumenAulas = ref([
    {
        nombre: '10mo A',
        participacion: 85,
        total: 35,
        votaron: 30,
        pendientes: 5,
        votosPorCandidato: [
            { candidato: 'María G.', votos: 12, color: '#10B981' },
            { candidato: 'Carlos R.', votos: 10, color: '#3B82F6' },
            { candidato: 'Ana M.', votos: 8, color: '#F59E0B' }
        ]
    },
    {
        nombre: '10mo B',
        participacion: 72,
        total: 32,
        votaron: 23,
        pendientes: 9,
        votosPorCandidato: [
            { candidato: 'María G.', votos: 9, color: '#10B981' },
            { candidato: 'Carlos R.', votos: 8, color: '#3B82F6' },
            { candidato: 'Ana M.', votos: 6, color: '#F59E0B' }
        ]
    },
    {
        nombre: '11vo A',
        participacion: 91,
        total: 33,
        votaron: 30,
        pendientes: 3,
        votosPorCandidato: [
            { candidato: 'María G.', votos: 13, color: '#10B981' },
            { candidato: 'Carlos R.', votos: 11, color: '#3B82F6' },
            { candidato: 'Ana M.', votos: 6, color: '#F59E0B' }
        ]
    }
]);

// Función para crear gráficas simples con canvas
const createSimpleChart = (canvas, type, data) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (type === 'bar') {
        // Gráfica de barras simple
        const barWidth = width / data.length - 10;
        const maxValue = Math.max(...data.map((d) => d.value));

        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            const x = index * (barWidth + 10) + 5;
            const y = height - barHeight - 30;

            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, height - 10);
            ctx.fillText(item.value + '%', x + barWidth / 2, y - 5);
        });
    }
};

let timeInterval;

onMounted(async () => {
    updateTime();
    timeInterval = setInterval(updateTime, 60000);

    await nextTick();

    // Crear gráficas simples
    if (barChart.value) {
        createSimpleChart(barChart.value, 'bar', [
            { label: '10mo A', value: 85 },
            { label: '10mo B', value: 72 },
            { label: '11vo A', value: 91 },
            { label: '11vo B', value: 68 },
            { label: '12vo A', value: 79 },
            { label: '12vo B', value: 88 }
        ]);
    }
});

onUnmounted(() => {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
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
                        <p style="margin: 0.25rem 0 0 0; font-size: 1.1rem; color: #6b7280">Elecciones Consejo Estudiantil 2024</p>
                    </div>
                </div>
                <div style="text-align: right">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                        <i class="pi pi-circle-fill" style="color: #10b981; font-size: 0.75rem"></i>
                        <span style="font-weight: 600; color: #059669">En Proceso</span>
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

        <!-- 3. Gráficas y Top Candidatos -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1.5rem">
            <!-- Participación por sección -->
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                    <i class="pi pi-chart-bar" style="color: #3b82f6"></i>
                    <h3 style="margin: 0; color: #1f2937">Participación por Sección</h3>
                </div>
                <canvas ref="barChart" style="max-height: 300px"></canvas>
            </div>

            <!-- Top Candidatos -->
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                    <i class="pi pi-trophy" style="color: #f59e0b"></i>
                    <h3 style="margin: 0; color: #1f2937">Top Candidatos</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem">
                    <div
                        v-for="(candidato, index) in topCandidatos"
                        :key="candidato.nombre"
                        :style="{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            borderRadius: '6px',
                            backgroundColor: index === 0 ? '#fef3c7' : index === 1 ? '#f3f4f6' : '#fed7aa',
                            border: `1px solid ${index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : '#fb923c'}`
                        }"
                    >
                        <div style="display: flex; align-items: center; gap: 1rem">
                            <div
                                :style="{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : '#ea580c'
                                }"
                            >
                                {{ index + 1 }}
                            </div>
                            <div>
                                <p style="margin: 0; font-weight: 600; color: #1f2937">{{ candidato.nombre }}</p>
                                <small style="color: #6b7280">{{ candidato.partido }}</small>
                            </div>
                        </div>
                        <div style="text-align: right">
                            <p style="margin: 0; font-weight: bold; font-size: 1.125rem; color: #1f2937">{{ candidato.votos }}</p>
                            <small style="color: #6b7280">votos</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. Gráficas adicionales -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem">
            <!-- Votos por hora -->
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                    <i class="pi pi-clock" style="color: #3b82f6"></i>
                    <h3 style="margin: 0; color: #1f2937">Votos por Hora</h3>
                </div>
                <canvas ref="lineChart" style="max-height: 250px"></canvas>
            </div>

            <!-- Participación por género -->
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                    <i class="pi pi-users" style="color: #3b82f6"></i>
                    <h3 style="margin: 0; color: #1f2937">Participación por Género</h3>
                </div>
                <canvas ref="doughnutChart" style="max-height: 250px"></canvas>
            </div>
        </div>

        <!-- 5. Participación por Grado -->
        <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-bottom: 1.5rem">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                <i class="pi pi-graduation-cap" style="color: #3b82f6"></i>
                <h3 style="margin: 0; color: #1f2937">Participación por Grado</h3>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem">
                <div v-for="grado in participacionGrados" :key="grado.nombre" style="padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem">
                        <h4 style="margin: 0; color: #1f2937">{{ grado.nombre }}</h4>
                        <span style="font-weight: bold; color: #3b82f6">{{ grado.porcentaje }}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 0.5rem">
                        <div :style="{ width: grado.porcentaje + '%', height: '100%', backgroundColor: '#3B82F6', borderRadius: '4px' }"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: #6b7280">
                        <span>{{ grado.votaron }} / {{ grado.total }}</span>
                        <span>{{ grado.pendientes }} pendientes</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 6. Resumen por Aula -->
        <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-bottom: 1.5rem">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                <i class="pi pi-home" style="color: #3b82f6"></i>
                <h3 style="margin: 0; color: #1f2937">Resumen por Aula</h3>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem">
                <div v-for="aula in resumenAulas" :key="aula.nombre" style="background: #f9fafb; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
                        <h4 style="margin: 0; color: #1f2937">{{ aula.nombre }}</h4>
                        <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600"> {{ aula.participacion }}% </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 1rem">
                        <span style="color: #6b7280">Total: {{ aula.total }}</span>
                        <span style="color: #059669">Votaron: {{ aula.votaron }}</span>
                        <span style="color: #d97706">Pendientes: {{ aula.pendientes }}</span>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0" />
                    <div style="display: flex; flex-direction: column; gap: 0.5rem">
                        <div v-for="voto in aula.votosPorCandidato" :key="voto.candidato" style="display: flex; justify-content: space-between; align-items: center">
                            <span style="font-size: 0.875rem">{{ voto.candidato }}</span>
                            <div style="display: flex; align-items: center; gap: 0.5rem">
                                <div
                                    :style="{
                                        width: '3rem',
                                        height: '4px',
                                        backgroundColor: voto.color,
                                        borderRadius: '2px',
                                        transform: `scaleX(${voto.votos / aula.votaron})`
                                    }"
                                ></div>
                                <span style="font-size: 0.875rem; font-weight: 600">{{ voto.votos }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 7. Distribución de Votos por Aula -->
        <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
                <i class="pi pi-chart-line" style="color: #3b82f6"></i>
                <h3 style="margin: 0; color: #1f2937">Distribución de Votos por Aula</h3>
            </div>
            <canvas ref="stackedChart" style="max-height: 300px"></canvas>
        </div>
    </div>
</template>
