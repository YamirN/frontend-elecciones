<script setup>
import { formatFechaBackend } from '@/service/utils/formatFechaBackend';
import { useCitaStore } from '@/stores/citaStore';
import { useClienteStore } from '@/stores/clienteStore';
import { useServicioStore } from '@/stores/servicioStore';
import { isToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue';
import { computed, onMounted, reactive, ref, watch } from 'vue';

// States y Stores

const citaStore = useCitaStore();
const clienteStore = useClienteStore();
const servicioStore = useServicioStore();

const { clientes } = storeToRefs(clienteStore);
const { servicios } = storeToRefs(servicioStore);
const { citas, loading: loadingCitas, trabajadoresDisponibles, loadingTrabajadores, errors } = storeToRefs(citaStore);

// const selectedServicio = ref(null);
const hoy = ref(new Date());

const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));
const toast = useToast();
const showFormDialog = ref(false);
const showAsignarDialog = ref(false);
const citaSeleccionada = ref(null);
const trabajadorSeleccionado = ref('');
const showEstadoDialog = ref(false);
const citaParaCambioEstado = ref(null);
const nuevoEstado = ref(null);

const filteredHours = computed(() => {
    const fecha = initialValues.fecha;
    if (!fecha) return citaStore.availableHours;

    const fechaSeleccionada = new Date(fecha);
    if (!isToday(fechaSeleccionada)) {
        return citaStore.availableHours;
    }

    const ahora = new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

    return citaStore.availableHours.filter((horaStr) => {
        const [h, m] = horaStr.split(':').map(Number);
        const minutosHora = h * 60 + m;
        return minutosHora > minutosActuales;
    });
});

const initialValues = reactive({
    cliente_id: '',
    servicio_id: '',
    fecha: '',
    hora: '',
    metodo_pago: ''
});

const resetForm = () => {
    initialValues.cliente_id = '';
    initialValues.servicio_id = '';
    initialValues.fecha = '';
    initialValues.hora = '';
    initialValues.metodo_pago = '';
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pendiente':
            return 'bg-yellow-400';
        case 'atendida':
            return 'bg-green-400';
        case 'cancelada':
            return 'bg-red-400';
        case 'cliente_ausente':
            return 'bg-orange-400';
        default:
            return 'bg-gray-400';
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'atendida':
            return 'success';
        case 'pendiente':
            return 'warning';
        case 'cancelada':
            return 'danger';
        case 'cliente_ausente':
            return 'warn';
        default:
            return 'info';
    }
};

const clientesConNombre = computed(() =>
    clientes.value.map((cliente) => ({
        ...cliente,
        nombre_completo: cliente.user ? `${cliente.user.nombre} ${cliente.user.apellido}` : 'Usuario sin nombre'
    }))
);

// Metodo para verificar si la cita es del pasado
const noPuedeAsignarse = (cita) => {
    const fechaISO = formatFechaBackend(cita.fecha); // Asegura el formato correcto
    const [anio, mes, dia] = fechaISO.split('-').map(Number);
    const [horaStr, minutoStr] = cita.hora.split(':').map(Number);

    const fechaCita = new Date(anio, mes - 1, dia, horaStr, minutoStr);
    const ahora = new Date();

    const citaPasada = fechaCita < ahora;
    const estadoNoPermitido = ['atendida', 'cliente_ausente'].includes(cita.estado);

    return citaPasada || estadoNoPermitido;
};

// Metodo para abrir el diálogo y cargar trabajadores
const abrirDialogoAsignar = async (cita) => {
    citaSeleccionada.value = cita;
    showAsignarDialog.value = true;
    trabajadorSeleccionado.value = null;

    try {
        await citaStore.cargarTrabajadoresDisponibles(cita.fecha, cita.hora, cita.id, cita.servicio.id);
    } catch (error) {
        console.error('Error al cargar trabajadores:', error);
    }
};

const openNew = async () => {
    if (!clientes.value.length) await clienteStore.ListaCliente();
    resetForm();
    showFormDialog.value = true;
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
const formatTimeHHMM = (value) => {
    if (typeof value === 'string') return value;
    if (value instanceof Date) {
        const h = String(value.getHours()).padStart(2, '0');
        const m = String(value.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
    return '';
};
const onFormSubmit = async () => {
    const payload = {
        cliente_id: initialValues.cliente_id,
        servicio_id: initialValues.servicio_id,
        fecha: formatFechaBackend(initialValues.fecha),
        hora: formatTimeHHMM(initialValues.hora),
        metodo_pago: initialValues.metodo_pago
    };

    const exito = await citaStore.crearCita(payload);

    if (exito) {
        showFormDialog.value = false; // 🔒 Cierra el diálogo
        toast.add({
            severity: 'success',
            summary: 'Cita creada',
            detail: 'Cita registrada correctamente',
            life: 3000
        });
        await citaStore.ListaCita(); // 🔄 Recarga la lista si es necesario
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la cita',
            life: 3000
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
    await servicioStore.ListaServicio();
});

watch(
    () => [initialValues.fecha, initialValues.cliente_id, initialValues.servicio_id],
    async ([fecha, cliente_id, servicio_id]) => {
        if (fecha && cliente_id && servicio_id) {
            const fechaFormateada = formatFechaBackend(fecha);
            await citaStore.cargarHorasDisponibles({ fecha: fechaFormateada, cliente_id, servicio_id });
        }
    }
);
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar Cita" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingCitas" />
                </template>
            </Toolbar>

            <!-- Tabla de citas -->
            <DataTable
                :value="loadingCitas ? skeletonRows : citas"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :globalFilterFields="['servicio.nombre', 'estado', 'cliente.nombre', 'cliente.apellido', 'fecha', 'trabajador.nombre', 'trabajador.apellido']"
                tableStyle="min-width: 40rem"
            >
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
                <Column field="estado" header="Estado">
                    <template #body="slotProps">
                        <span
                            class="px-3 py-1 rounded-full text-sm font-medium text-white"
                            :class="{
                                'bg-blue-500': slotProps.data.estado === 'pendiente',
                                'bg-green-500': slotProps.data.estado === 'atendida',
                                'bg-red-500': slotProps.data.estado === 'cancelada',
                                'bg-red-500': slotProps.data.estado === 'cliente_ausente',
                                'bg-gray-500': !slotProps.data.estado
                            }"
                        >
                            {{ slotProps.data.estado || 'Sin estado' }}
                        </span>
                    </template>
                </Column>
                <Column field="metodo_pago" header="Método de Pago" />

                <Column header="Servicio">
                    <template #body="slotProps">
                        {{ slotProps.data.servicio?.nombre || 'Sin servicio' }}
                    </template>
                </Column>

                <Column header="Duración">
                    <template #body="slotProps"> {{ formatDuration(slotProps.data.servicio?.duracion) }} </template>
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
                        <Button
                            icon="pi pi-user-plus"
                            label="Asignar"
                            outlined
                            rounded
                            class="mr-2"
                            :disabled="noPuedeAsignarse(slotProps.data)"
                            @click="abrirDialogoAsignar(slotProps.data)"
                            :title="noPuedeAsignarse(slotProps.data) ? 'No se puede asignar a una cita pasada o ya atendida' : ''"
                        />
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

        <Dialog v-model:visible="showEstadoDialog" modal header="Cambiar Estado" :style="{ width: '400px' }">
            <div class="space-y-4 p-2">
                <!-- Estado actual -->
                <div v-if="citaSeleccionada?.estado" class="p-3 bg-gray-50 rounded border">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700">Estado actual:</span>
                        <Tag :value="citaSeleccionada.estado" :severity="getStatusSeverity(citaSeleccionada.estado)" />
                    </div>
                </div>

                <!-- Selector de nuevo estado -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nuevo estado</label>
                    <select v-model="nuevoEstado" class="w-full p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none">
                        <option value="" disabled>Seleccione estado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="atendida">Atendida</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="cliente_ausente">Cliente Ausente</option>
                    </select>
                </div>

                <!-- Vista previa del nuevo estado -->
                <div v-if="nuevoEstado" class="p-3 bg-blue-50 rounded border border-blue-200">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700">Nuevo estado:</span>
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full mr-2" :class="getStatusColor(nuevoEstado)"></div>
                            <Tag :value="nuevoEstado" :severity="getStatusSeverity(nuevoEstado)" />
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="showEstadoDialog = false" />
                <Button label="Guardar" icon="pi pi-check" @click="cambiarEstado" :disabled="!nuevoEstado" />
            </template>
        </Dialog>

        <Dialog v-model:visible="showFormDialog" modal header="Crear Cita" :style="{ width: '30rem' }">
            <form @submit.prevent="onFormSubmit" class="flex flex-col gap-5 px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Nueva Cita</h2>

                <!-- Cliente -->
                <div>
                    <InputLabel for="cliente_id" value="Cliente" />

                    <Select id="cliente_id" v-model="initialValues.cliente_id" :options="clientesConNombre" optionLabel="nombre_completo" optionValue="id" filter placeholder="Selecciona un cliente" class="w-full" />
                </div>

                <!-- Servicio -->
                <div>
                    <InputLabel for="servicio_id" value="Servicio" />
                    <Select id="servicio_id" v-model="initialValues.servicio_id" :options="servicios" optionLabel="nombre" optionValue="id" filter placeholder="Selecciona un servicio" class="w-full" />
                </div>

                <!-- Fecha -->
                <div>
                    <InputLabel for="fecha" value="Fecha" />
                    <DatePicker id="fecha" v-model="initialValues.fecha" :minDate="hoy" showIcon dateFormat="yy-mm-dd" placeholder="Selecciona una fecha" class="w-full" />
                </div>

                <!-- Hora -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="pi pi-clock mr-1"></i>
                        Hora disponible
                    </label>
                    <Select
                        v-model="initialValues.hora"
                        :options="filteredHours"
                        placeholder="Selecciona una hora"
                        class="w-full"
                        :pt="{
                            root: { class: 'border-2 border-blue-200 hover:border-blue-400 transition-colors' },
                            input: { class: 'text-gray-700 font-medium' }
                        }"
                    >
                        <!-- Vista de cada opción -->
                        <template #option="slotProps">
                            <div class="flex items-center justify-between p-2 hover:bg-blue-50 rounded">
                                <span class="font-medium">{{ slotProps.option }}</span>
                                <i class="pi pi-clock text-blue-500"></i>
                            </div>
                        </template>

                        <!-- Si no hay horas -->
                        <template #empty>
                            <div class="p-2 text-gray-500 text-center">No hay horarios disponibles</div>
                        </template>
                    </Select>
                </div>

                <!-- Método de Pago -->
                <div>
                    <InputLabel for="metodo_pago" value="Método de Pago" />
                    <select id="metodo_pago" v-model="initialValues.metodo_pago" class="w-full p-2 border rounded">
                        <option disabled value="">Selecciona una opción</option>
                        <option value="yape">Yape</option>
                        <option value="plin">Plin</option>
                        <option value="visa">Visa</option>
                    </select>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-2">
                    <Button label="Cancelar" icon="pi pi-times" text type="button" @click="showFormDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" text type="submit" />
                </div>
            </form>
        </Dialog>
    </div>
</template>
