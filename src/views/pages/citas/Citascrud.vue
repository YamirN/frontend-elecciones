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
const trabajadorSeleccionado = ref(null);

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
            trabajadorId: trabajadorSeleccionado.value.id
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

const getSelectedWorkerName = () => {
    if (!trabajadorSeleccionado.value) return '';
    const worker = trabajadoresDisponibles.value?.find((t) => t.id === trabajadorSeleccionado.value);
    return worker?.nombre_completo || '';
};

const getSelectedWorkerInitials = () => {
    if (!trabajadorSeleccionado.value) return '';
    const worker = trabajadoresDisponibles.value?.find((t) => t.id === trabajadorSeleccionado.value);
    if (!worker) return '';
    return `${worker.nombre?.charAt(0)?.toUpperCase() || ''}${worker.apellido?.charAt(0)?.toUpperCase() || ''}`;
};

const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
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

        <Dialog v-model:visible="showAsignarDialog" modal header="👨‍💼 Asignar Trabajador Especializado" :style="{ width: '500px' }" class="assign-worker-dialog" :draggable="false">
            <div class="space-y-6 p-2">
                <!-- Header con información de la reserva -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div class="flex items-center mb-3">
                        <i class="pi pi-calendar-plus text-blue-600 text-lg mr-2"></i>
                        <h3 class="font-semibold text-gray-800">Detalles de la Reserva</h3>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="flex items-center">
                            <i class="pi pi-tag mr-2 text-gray-500"></i>
                            <span class="text-gray-600">Servicio:</span>
                            <span class="font-medium text-gray-800 ml-1">{{ selectedReserva?.servicio?.nombre }}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-clock mr-2 text-gray-500"></i>
                            <span class="text-gray-600">Duración:</span>
                            <span class="font-medium text-gray-800 ml-1">{{ selectedReserva?.servicio?.duracion }} min</span>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-calendar mr-2 text-gray-500"></i>
                            <span class="text-gray-600">Fecha:</span>
                            <span class="font-medium text-gray-800 ml-1">{{ formatDate(selectedReserva?.fecha) }}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="pi pi-clock mr-2 text-gray-500"></i>
                            <span class="text-gray-600">Hora:</span>
                            <span class="font-medium text-gray-800 ml-1">{{ selectedReserva?.hora }}</span>
                        </div>
                    </div>
                </div>

                <!-- Selección de trabajador -->
                <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                    <label class="flex items-center text-lg font-semibold text-gray-800 mb-4">
                        <i class="pi pi-users mr-2 text-green-600"></i>
                        Seleccionar Profesional
                    </label>

                    <!-- Loading state -->
                    <div v-if="loadingTrabajadores" class="flex items-center justify-center py-8">
                        <div class="text-center">
                            <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-3"></i>
                            <p class="text-gray-600 font-medium">Buscando profesionales disponibles...</p>
                            <p class="text-sm text-gray-500 mt-1">Esto puede tomar unos segundos</p>
                        </div>
                    </div>

                    <!-- Trabajadores disponibles -->
                    <div v-else-if="trabajadoresDisponibles && trabajadoresDisponibles.length > 0">
                        <Dropdown
                            id="trabajador"
                            v-model="trabajadorSeleccionado"
                            :options="trabajadoresDisponibles"
                            optionLabel="nombre_completo"
                            optionValue="id"
                            placeholder="🔍 Busca y selecciona un profesional"
                            class="w-full"
                            :pt="{
                                root: { class: 'border-2 border-green-200 hover:border-green-400 focus:border-green-500 transition-colors rounded-lg' },
                                input: { class: 'text-gray-700 font-medium' }
                            }"
                            filter
                            filterPlaceholder="Buscar por nombre..."
                        >
                            <template #option="slotProps">
                                <div class="flex items-center justify-between p-3 hover:bg-green-50 rounded transition-colors">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                            {{ slotProps.option.nombre?.charAt(0)?.toUpperCase() }}{{ slotProps.option.apellido?.charAt(0)?.toUpperCase() }}
                                        </div>
                                        <div>
                                            <div class="font-semibold text-gray-800">{{ slotProps.option.nombre_completo }}</div>
                                            <div class="text-sm text-gray-600">{{ slotProps.option.especialidad || 'Especialista en Spa' }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            <i class="pi pi-check-circle mr-1"></i>
                                            Disponible
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template #value="slotProps">
                                <div v-if="slotProps.value" class="flex items-center">
                                    <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-2 text-sm">
                                        {{ getSelectedWorkerInitials() }}
                                    </div>
                                    <span class="font-medium">{{ getSelectedWorkerName() }}</span>
                                </div>
                                <span v-else class="text-gray-500">🔍 Busca y selecciona un profesional</span>
                            </template>
                        </Dropdown>

                        <!-- Información del trabajador seleccionado -->
                        <div v-if="trabajadorSeleccionado" class="mt-4 p-3 bg-white rounded-lg border border-green-200">
                            <div class="flex items-center">
                                <i class="pi pi-info-circle text-blue-500 mr-2"></i>
                                <span class="text-sm font-medium text-gray-700">Profesional seleccionado:</span>
                                <span class="text-sm font-semibold text-gray-800 ml-1">{{ getSelectedWorkerName() }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- No hay trabajadores disponibles -->
                    <div v-else class="text-center py-8">
                        <div class="mb-4">
                            <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay profesionales disponibles</h3>
                        <p class="text-gray-600 mb-4">No encontramos profesionales disponibles para esta fecha y hora específica.</p>
                        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p class="text-sm text-orange-700">
                                <i class="pi pi-lightbulb mr-1"></i>
                                Sugerencia: Intenta cambiar la fecha o hora de la reserva
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <Button label="Cancelar" icon="pi pi-times" text class="text-gray-500 hover:text-gray-700" @click="showAsignarDialog = false" />

                    <Button
                        :label="trabajadorSeleccionado ? '✅ Confirmar Asignación' : 'Selecciona un profesional'"
                        icon="pi pi-check"
                        :disabled="!trabajadorSeleccionado"
                        class="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        @click="asignarTrabajador"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>
