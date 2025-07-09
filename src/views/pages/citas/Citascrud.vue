<script setup>
import { useCitaStore } from '@/stores/citaStore';
import { storeToRefs } from 'pinia';
import { Toast } from 'primevue';
// import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

// States y Stores

const citaStore = useCitaStore();
const { citas, loading: loadingCitas, errors, trabajadoresDisponibles, loadingTrabajadores } = storeToRefs(citaStore);

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

        <Dialog v-model:visible="showAsignarDialog" modal header="Asignar Trabajador" :style="{ width: '25rem' }">
            <div class="flex flex-col gap-4">
                <!-- Versión corregida del condicional -->
                <div v-if="loadingTrabajadores" class="text-gray-500 text-sm italic">Cargando trabajadores disponibles...</div>
                <template v-else>
                    <div v-if="trabajadoresDisponibles && trabajadoresDisponibles.length > 0">
                        <label for="trabajador" class="font-medium text-gray-700"> Selecciona un trabajador: </label>
                        <Dropdown id="trabajador" v-model="trabajadorSeleccionado" :options="trabajadoresDisponibles" optionLabel="nombre_completo" placeholder="Elige uno disponible" class="w-full" />
                    </div>
                    <div v-else class="text-red-500">No hay trabajadores disponibles para esta fecha y hora.</div>
                </template>

                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="showAsignarDialog = false" />
                    <Button label="Asignar" icon="pi pi-check" :disabled="!trabajadorSeleccionado" @click="asignarTrabajador" />
                </div>
            </div>
        </Dialog>
    </div>
</template>
