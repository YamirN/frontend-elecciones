<script setup>
import { useCitaStore } from '@/stores/citaStore';
import { storeToRefs } from 'pinia';
import { Toast } from 'primevue';
// import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

// States y Stores

const citaStore = useCitaStore();
const { citas, loading: loadingCitas, trabajadoresDisponibles, loadingTrabajadores } = storeToRefs(citaStore);

// const selectedServicio = ref(null);
const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));

const showAsignarDialog = ref(false);
const citaSeleccionada = ref(null);
const trabajadorSeleccionado = ref('');

// Método para abrir el diálogo y cargar trabajadores
const abrirDialogoAsignar = async (cita) => {
    citaSeleccionada.value = cita;
    showAsignarDialog.value = true;
    trabajadorSeleccionado.value = null;

    try {
        await citaStore.cargarTrabajadoresDisponibles(cita.fecha, cita.hora);
    } catch (error) {
        console.error('Error al cargar trabajadores:', error);
    }
};

const asignarTrabajador = async () => {
    try {
        await citaStore.asignarTrabajador({
            citaId: citaSeleccionada.value.id,
            trabajadorId: trabajadorSeleccionado.value
        });

        showAsignarDialog.value = false;
        Toast.add({
            severity: 'success',
            summary: 'Trabajador asignado',
            detail: 'El trabajador fue asignado exitosamente',
            life: 3000
        });

        await citaStore.ListaCita(); // refresca la lista
    } catch (error) {
        Toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo asignar el trabajador',
            life: 4000
        });
    }
};

const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h ? `${h}h ` : ''}${m} min`;
};

onMounted(async () => {
    await citaStore.ListaCita();
});
watch(trabajadoresDisponibles, (nuevo) => {
    console.log('Cambio trabajadoresDisponibles:', nuevo);
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->

            <!-- Tabla de citas -->
            <DataTable :value="loadingCitas ? skeletonRows : citas" :paginator="true" :rows="8" :filters="filters" :globalFilterFields="['servicio.nombre', 'estado', 'cliente.nombre', 'cliente.apellido']" tableStyle="min-width: 40rem">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Citas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="fecha" header="Fecha" />
                <Column field="hora" header="Hora" />
                <Column field="estado" header="Estado" />
                <Column field="metodo_pago" header="Método de Pago" />

                <Column header="Servicio">
                    <template #body="slotProps">
                        {{ slotProps.data.servicio?.nombre || 'Sin servicio' }}
                    </template>
                </Column>

                <Column header="Duración">
                    <template #body="slotProps"> {{ formatDuration(slotProps.data.servicio?.duracion) }} min </template>
                </Column>

                <Column header="Cliente">
                    <template #body="slotProps"> {{ slotProps.data.cliente?.nombre }} {{ slotProps.data.cliente?.apellido }} </template>
                </Column>

                <Column header="Trabajador">
                    <template #body="slotProps">
                        <span v-if="slotProps.data.trabajador"> {{ slotProps.data.trabajador.nombre }} {{ slotProps.data.trabajador.apellido }} </span>
                        <span v-else class="text-gray-400 italic">Sin asignar</span>
                    </template>
                </Column>

                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-user-plus" label="Asignar" outlined rounded class="mr-2" @click="abrirDialogoAsignar(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showAsignarDialog" modal header="👨‍💼 Asignar Trabajador" :style="{ width: '450px' }" class="assign-worker-dialog">
            <div class="space-y-6 p-2">
                <!-- Lista de trabajadores disponibles -->
                <div v-if="trabajadoresDisponibles && trabajadoresDisponibles.length > 0" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <label for="trabajador" class="flex items-center text-lg font-semibold text-gray-800 mb-4">
                        <i class="pi pi-users mr-2 text-blue-600"></i>
                        Selecciona un trabajador:
                    </label>
                    <select id="trabajador" v-model="trabajadorSeleccionado" class="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-700 font-medium">
                        <option disabled value="" class="text-gray-500">🔍 Elige un profesional disponible</option>
                        <option v-for="trabajador in trabajadoresDisponibles" :key="trabajador.id" :value="trabajador.id" class="py-2">👤 {{ trabajador.nombre_completo }}</option>
                    </select>

                    <!-- Información del trabajador seleccionado -->
                    <div v-if="trabajadorSeleccionado" class="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                        <div class="flex items-center">
                            <i class="pi pi-check-circle text-green-500 mr-2"></i>
                            <span class="text-sm font-medium text-gray-700">Profesional seleccionado:</span>
                            <span class="text-sm font-semibold text-gray-800 ml-1">
                                {{ trabajadoresDisponibles.find((t) => t.id === trabajadorSeleccionado)?.nombre_completo }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Si terminó de cargar pero no hay trabajadores -->
                <div v-else-if="!loadingTrabajadores" class="text-center py-8">
                    <div class="mb-4">
                        <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay trabajadores disponibles</h3>
                    <p class="text-gray-600 mb-4">No hay trabajadores disponibles para esta fecha y hora.</p>
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p class="text-sm text-orange-700">
                            <i class="pi pi-lightbulb mr-1"></i>
                            Intenta cambiar la fecha o hora de la reserva
                        </p>
                    </div>
                </div>

                <!-- Si está cargando -->
                <div v-if="loadingTrabajadores" class="flex items-center justify-center py-8">
                    <div class="text-center">
                        <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-3"></i>
                        <p class="text-gray-600 font-medium">Cargando trabajadores disponibles...</p>
                        <p class="text-sm text-gray-500 mt-1">Esto puede tomar unos segundos</p>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <Button label="Cancelar" icon="pi pi-times" text class="text-gray-500 hover:text-gray-700" @click="showAsignarDialog = false" />
                    <Button
                        :label="trabajadorSeleccionado ? '✅ Asignar Trabajador' : 'Selecciona un trabajador'"
                        icon="pi pi-check"
                        :disabled="!trabajadorSeleccionado"
                        class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                        @click="asignarTrabajador"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>
