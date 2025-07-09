<script setup>
import { useCitaStore } from '@/stores/citaStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue';
import { onMounted, ref } from 'vue';

// States y Stores

const citaStore = useCitaStore();
const { citas, loading: loadingCitas, trabajadoresDisponibles, loadingTrabajadores } = storeToRefs(citaStore);

// const selectedServicio = ref(null);
const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));
const toast = useToast();

const showAsignarDialog = ref(false);
const citaSeleccionada = ref(null);
const trabajadorSeleccionado = ref('');
const showEstadoDialog = ref(false);
const citaParaCambioEstado = ref(null);
const nuevoEstado = ref(null);

const estadosDisponibles = ref([
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Atendida', value: 'atendida' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'Cliente ausente', value: 'cliente_ausente' }
]);

// Método para abrir el diálogo y cargar trabajadores
const abrirDialogoAsignar = async (cita) => {
    citaSeleccionada.value = cita;
    showAsignarDialog.value = true;
    trabajadorSeleccionado.value = null;

    try {
        await citaStore.cargarTrabajadoresDisponibles(cita.fecha, cita.hora, cita.id);
    } catch (error) {
        console.error('Error al cargar trabajadores:', error);
    }
};

const asignarTrabajador = async () => {
    const exito = await citaStore.asignarTrabajador({
        citaId: citaSeleccionada.value.id,
        trabajadorId: trabajadorSeleccionado.value
    });

    if (exito) {
        showAsignarDialog.value = false;
        citaSeleccionada.value = null;
        await citaStore.ListaCita(); // 🔄 Recarga lista solo si fue exitoso
        toast.add({
            severity: 'success',
            summary: 'Trabajador asignado',
            detail: 'El trabajador fue asignado exitosamente',
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo asignar el trabajador',
            life: 4000
        });
    }
};

const abrirDialogoEstado = (cita) => {
    citaParaCambioEstado.value = cita;
    nuevoEstado.value = cita.estado;
    showEstadoDialog.value = true;
};

const cambiarEstado = async () => {
    try {
        await citaStore.cambiarEstado({
            citaId: citaParaCambioEstado.value.id,
            estado: nuevoEstado.value
        });

        showEstadoDialog.value = false;
        await citaStore.ListaCita(); // refresca tabla

        toast.add({
            severity: 'success',
            summary: 'Estado actualizado',
            detail: 'La cita cambió de estado correctamente',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cambiar el estado',
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
                        <Button v-if="slotProps.data.trabajador" icon="pi pi-refresh" label="Estado" severity="info" outlined rounded @click="abrirDialogoEstado(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showAsignarDialog" modal header="Asignar Especialista" :style="{ width: '500px' }" class="spa-dialog">
            <div class="space-y-6">
                <!-- Lista de trabajadores disponibles -->
                <div v-if="trabajadoresDisponibles && trabajadoresDisponibles.length > 0" class="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                    <div class="flex items-center mb-5">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                            <i class="pi pi-user text-white text-sm"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-slate-800">Seleccionar Especialista</h3>
                            <p class="text-sm text-slate-600">Elige el profesional para este servicio</p>
                        </div>
                    </div>

                    <select
                        id="trabajador"
                        v-model="trabajadorSeleccionado"
                        class="w-full p-4 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white text-slate-700 font-medium shadow-sm"
                    >
                        <option disabled value="" class="text-slate-500">Seleccione un especialista disponible</option>
                        <option v-for="trabajador in trabajadoresDisponibles" :key="trabajador.id" :value="trabajador.id" class="py-2">
                            {{ trabajador.nombre_completo }}
                        </option>
                    </select>

                    <!-- Confirmación del especialista seleccionado -->
                    <div v-if="trabajadorSeleccionado" class="mt-4 p-4 bg-white rounded-lg border border-emerald-200 shadow-sm">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                                <i class="pi pi-check text-emerald-600 text-sm"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-slate-700">Especialista seleccionado</p>
                                <p class="text-emerald-700 font-semibold">
                                    {{ trabajadoresDisponibles.find((t) => t.id === trabajadorSeleccionado)?.nombre_completo }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sin trabajadores disponibles -->
                <div v-else-if="!loadingTrabajadores" class="text-center py-12">
                    <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-calendar-times text-amber-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-slate-800 mb-2">No hay especialistas disponibles</h3>
                    <p class="text-slate-600 mb-6 max-w-sm mx-auto">No encontramos especialistas disponibles para esta fecha y horario específico.</p>
                    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                        <div class="flex items-start">
                            <i class="pi pi-info-circle text-amber-600 mt-0.5 mr-2"></i>
                            <div class="text-left">
                                <p class="text-sm font-medium text-amber-800 mb-1">Sugerencia</p>
                                <p class="text-sm text-amber-700">Considere seleccionar una fecha u horario diferente para encontrar especialistas disponibles.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estado de carga -->
                <div v-if="loadingTrabajadores" class="text-center py-12">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-spin pi-spinner text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-800 mb-2">Buscando especialistas</h3>
                    <p class="text-slate-600">Verificando disponibilidad de nuestros profesionales...</p>
                </div>
            </div>

            <template #footer>
                <div class="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button label="Cancelar" icon="pi pi-times" text class="text-slate-600 hover:text-slate-800 font-medium px-4 py-2" @click="showAsignarDialog = false" />
                    <Button
                        :label="trabajadorSeleccionado ? 'Confirmar Asignación' : 'Seleccione un especialista'"
                        icon="pi pi-check"
                        :disabled="!trabajadorSeleccionado"
                        class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        @click="asignarTrabajador"
                    />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="showEstadoDialog" modal header="Cambiar Estado" style="width: 30vw">
            <div class="mb-3">
                <label class="block mb-2">Nuevo estado</label>
                <Dropdown v-model="nuevoEstado" :options="estadosDisponibles" optionLabel="label" optionValue="value" placeholder="Seleccione estado" class="w-full" />
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="showEstadoDialog = false" />
                <Button label="Guardar" icon="pi pi-check" @click="guardarEstado" :disabled="!nuevoEstado" />
            </template>
        </Dialog>
    </div>
</template>
