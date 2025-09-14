<script setup>
import echo from '@/service/echo';
import { useEventoStore } from '@/stores/eventoStore';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
const eventosStore = useEventoStore();
// const { eventos } = storeToRefs(eventosStore);
// Array local para la tabla

const filters = ref({ global: { value: '' } });

// Estado reactivo

const logSeleccionado = ref(null);

// Métodos

const mostrarDetalle = (log) => {
    logSeleccionado.value = log;
};

const cerrarDetalle = () => {
    logSeleccionado.value = null;
};

const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const getCategoriaBadge = (categoria) => {
    const badges = {
        AUTENTICACION: 'bg-blue-100 text-blue-800',
        VOTACION: 'bg-green-100 text-green-800',
        SISTEMA: 'bg-purple-100 text-purple-800'
    };
    return badges[categoria] || 'bg-gray-100 text-gray-800';
};

const getNivelBadge = (nivel) => {
    const badges = {
        INFO: 'bg-blue-100 text-blue-800',
        WARNING: 'bg-yellow-100 text-yellow-800',
        ERROR: 'bg-red-100 text-red-800'
    };
    return badges[nivel] || 'bg-gray-100 text-gray-800';
};

const getRolBadge = (rol) => {
    const badges = {
        adminstrador: 'bg-red-100 text-red-800',
        USUARIO: 'bg-blue-100 text-blue-800',
        MODERADOR: 'bg-orange-100 text-orange-800',
        SISTEMA: 'bg-gray-100 text-gray-800'
    };
    return badges[rol] || 'bg-gray-100 text-gray-800';
};

let globalListener = null;
let canal = null;

onMounted(async () => {
    // 1️⃣ Carga inicial
    await eventosStore.obtenerEventos();
    await nextTick();

    // 2️⃣ Listener global para debug
    globalListener = (event, data) => {
        console.log('Evento global recibido:', event, data);

        // Si es el evento que nos interesa, actualizamos store
        if (event === 'new-log') {
            eventosStore.obtenerEventos();
        }
    };
    echo.connector.pusher.bind_global(globalListener);

    // 3️⃣ Listener específico de canal
    canal = echo.channel('system-logs');
    canal.listen('new-log', () => {
        console.log('Evento "new-log" recibido: actualizando eventos de votación...');
        eventosStore.obtenerEventosVotar();
    });

    console.log('Suscripciones listas ✅');
});

onUnmounted(() => {
    // Limpiar listeners
    if (globalListener) {
        echo.connector.pusher.unbind_global(globalListener);
        globalListener = null;
    }
    if (canal) {
        canal.stopListening('new-log');
        canal = null;
    }
});
</script>

<template>
    <div class="p-6 bg-white rounded-lg shadow-lg">
        <!-- Logs del Sistema -->
        <DataTable
            :value="eventosStore.eventos"
            :paginator="true"
            :rows="10"
            :filters="filters"
            :globalFilterFields="['usuario_nombre', 'usuario_apellido', 'rol', 'categoria', 'nivel', 'fecha']"
            tableStyle="min-width: 40rem"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            stripedRows
            responsiveLayout="scroll"
            class="rounded-2xl shadow-sm border border-gray-200"
        >
            <!-- HEADER con filtros -->
            <template #header>
                <div class="flex flex-col gap-3 p-3 bg-gray-50 rounded-t-2xl">
                    <!-- Título + botón -->
                    <div class="flex flex-wrap items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2"><i class="pi pi-history text-blue-500"></i> Actividades Administrativas del Sistema</h3>

                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </div>
            </template>

            <!-- COLUMNA: Fecha/Hora -->
            <Column header="Fecha / Hora" style="width: 16%">
                <template #body="slotProps">
                    {{ formatearFecha(slotProps.data.fecha) }}
                </template>
            </Column>

            <!-- COLUMNA: Rol -->
            <Column header="Rol" style="width: 20%">
                <template #body="slotProps">
                    <span :class="getRolBadge(slotProps.data.rol)" class="px-2 py-1 text-sm font-semibold rounded-md">
                        {{ slotProps.data.rol }}
                    </span>
                </template>
            </Column>

            <!-- COLUMNA: Categoría -->
            <Column header="Modulo" style="width: 15%">
                <template #body="slotProps">
                    <span :class="getCategoriaBadge(slotProps.data.categoria)" class="px-2 py-1 text-sm font-semibold rounded-md">
                        {{ slotProps.data.categoria }}
                    </span>
                </template>
            </Column>

            <Column header="Acción" style="width: 25%">
                <template #body="slotProps">
                    <span
                        class="px-2 py-1 text-sm font-semibold"
                        :class="{
                            'bg-blue-100 text-blue-700': slotProps.data.accion === 'Creacion',
                            'bg-yellow-100 text-yellow-700': slotProps.data.accion === 'Actualizacion',
                            'bg-red-100 text-red-700': slotProps.data.accion === 'Eliminacion',
                            'bg-gray-100 text-gray-700': !['Creacion', 'Actualizacion', 'Eliminacion'].includes(slotProps.data.accion)
                        }"
                    >
                        {{ slotProps.data.accion }}
                    </span>
                </template>
            </Column>

            <!-- COLUMNA: Detalles -->
            <Column header="Detalles" style="width: 12%">
                <template #body="slotProps">
                    <Button v-if="slotProps.data.detalle" label="Ver detalles" link size="small" @click="mostrarDetalle(slotProps.data)" />
                    <span v-else class="text-gray-400 text-sm">Sin detalles</span>
                </template>
            </Column>
        </DataTable>

        <!-- Modal Detalles Log -->
        <div v-if="logSeleccionado" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="cerrarDetalle">
            <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6 space-y-5" @click.stop>
                <!-- Encabezado -->
                <div class="flex justify-between items-center border-b pb-3">
                    <h2 class="text-xl font-bold text-gray-800">📋 Detalles del Registro</h2>
                    <button @click="cerrarDetalle" class="text-gray-400 hover:text-gray-600">✖</button>
                </div>

                <!-- Cuerpo -->
                <div class="space-y-3 text-gray-700">
                    <p><span class="font-semibold">Usuario:</span> {{ logSeleccionado.usuario_nombre }} {{ logSeleccionado.usuario_apellido }}</p>
                    <p><span class="font-semibold">Rol:</span> {{ logSeleccionado.rol }}</p>
                    <p><span class="font-semibold">Modulo:</span> {{ logSeleccionado.categoria }}</p>
                    <p>
                        <span class="font-semibold">Acción:</span>
                        <span
                            class="ml-2 px-2 py-1 text-sm font-semibold"
                            :class="{
                                'bg-blue-100 text-blue-700': logSeleccionado.accion === 'Creacion',
                                'bg-yellow-100 text-yellow-700': logSeleccionado.accion === 'Actualizacion',
                                'bg-red-100 text-red-700': logSeleccionado.accion === 'Eliminacion',
                                'bg-gray-100 text-gray-700': !['Creacion', 'Actualizacion', 'Eliminacion'].includes(logSeleccionado.accion)
                            }"
                        >
                            {{ logSeleccionado.accion }}
                        </span>
                    </p>

                    <p><span class="font-semibold">Fecha:</span> {{ formatearFecha(logSeleccionado.fecha) }}</p>
                    <p>
                        <span class="font-semibold">Nivel:</span>
                        <span
                            class="ml-2 px-2 py-1 text-sm font-semibold"
                            :class="{
                                'bg-blue-100 text-blue-700': logSeleccionado.nivel === 'INFO',
                                'bg-yellow-100 text-yellow-700': logSeleccionado.nivel === 'WARNING',
                                'bg-red-100 text-red-700': logSeleccionado.nivel === 'ERROR'
                            }"
                        >
                            {{ logSeleccionado.nivel }}
                        </span>
                    </p>

                    <p>
                        <span class="font-semibold">Estado:</span>
                        <span class="ml-2 px-2 py-1 text-sm font-semibold" :class="logSeleccionado.exitoso ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                            {{ logSeleccionado.exitoso ? 'Exitoso' : 'Fallido' }}
                        </span>
                    </p>

                    <!-- JSON estructurado -->
                    <div v-if="logSeleccionado.detalle">
                        <span class="font-semibold">Detalles:</span>
                        <div class="mt-2 bg-gray-50 p-3 rounded text-sm text-gray-600 space-y-2">
                            <div v-for="(valor, clave) in logSeleccionado.detalle" :key="clave" class="flex justify-between border-b last:border-none pb-1">
                                <span class="font-medium text-gray-700">{{ clave }}:</span>
                                <span class="text-gray-600">{{ valor }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pie -->
                <div class="flex justify-end border-t pt-3">
                    <button @click="cerrarDetalle" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>
