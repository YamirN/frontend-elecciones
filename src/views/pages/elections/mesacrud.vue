<script setup>
import InputError from '@/components/InputError.vue';
import { useEleccionStore } from '@/stores/eleccionesStore';
import { useMesaSufragioStore } from '@/stores/mesaSufragioStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

const mesaStore = useMesaSufragioStore();
const eleccionStore = useEleccionStore();

const { elecciones, loading: loadingElecciones } = storeToRefs(eleccionStore);
const { mesas, loading: loadingMesas, aulasDisponibles, mesaSeleccionada, loadingExport, error, errors } = storeToRefs(mesaStore);

const eleccionSeleccionada = ref('');
const toast = useToast();
const filters = ref({ global: { value: '' } });
const mesaCreateDialog = ref(false);
const deleteMesaDialog = ref(false);
const selectedMesa = ref(null);
// const errors = computed(() => mesaStore.errors);
const historialDialogVisible = ref(false);
const isEditMode = ref(false);
const eleccionesPendientes = computed(() => elecciones.value.filter((e) => e.estado === 'pendiente'));

const skeletonRows = Array.from({ length: 8 }, () => ({}));

const form = ref({
    eleccion_id: null,
    codigo_mesa: '',
    ubicacion: '',
    responsable: ''
});

const openNew = () => {
    isEditMode.value = false;
    form.value = {
        eleccion_id: null,
        codigo_mesa: '',
        ubicacion: '',
        responsable: ''
    };
    errors.value = {};
    mesaCreateDialog.value = true;
    selectedMesa.value = null;
};

const editMesa = (mesa) => {
    isEditMode.value = true;
    form.value = {
        eleccion_id: mesa.eleccion_id,
        codigo_mesa: mesa.codigo_mesa,
        ubicacion: mesa.ubicacion,
        responsable: mesa.responsable
    };
    errors.value = {};
    selectedMesa.value = mesa;
    mesaCreateDialog.value = true;
};
const abrirDialogoHistorial = async (mesa) => {
    mesaActual.value = mesa;
    await mesaStore.fetchHistorialAsignacion(mesa.id); // carga logs desde el store
    historialDialogVisible.value = true;
};

const confirmDeleteMesa = (Mesa) => {
    selectedMesa.value = Mesa;
    deleteMesaDialog.value = true;
};

const deleteMesa = async () => {
    if (selectedMesa.value) {
        const eleccionId = selectedMesa.value.eleccion_id; // ✅ aseguras valor aquí
        const success = await mesaStore.removeMesa(selectedMesa.value.id, eleccionId);

        if (success) {
            toast.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'La mesa ha sido eliminada correctamente',
                life: 3000
            });
        }

        deleteMesaDialog.value = false;
        selectedMesa.value = null;
    }
};

const handleSave = async () => {
    const mesaId = selectedMesa.value?.id; // <- guarda el id primero

    const success = mesaId ? await mesaStore.actualizarMesa(mesaId, form.value) : await mesaStore.addMesa(form.value);

    if (success) {
        eleccionSeleccionada.value = form.value.eleccion_id;

        mesaCreateDialog.value = false;
        selectedMesa.value = null;
        form.value = {
            eleccion_id: null,
            codigo_mesa: '',
            ubicacion: '',
            responsable: ''
        };

        toast.add({
            severity: 'success',
            summary: mesaId ? 'Mesa actualizada' : 'Mesa creada',
            detail: 'La mesa ha sido guardada correctamente',
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: error.value,
            detail: Object.values(errors.value || {})
                .flat()
                .join(' | '),
            life: 5000
        });
    }
};

const descargarZip = (mesaId) => {
    mesaStore.exportarZipDeMesa(mesaId);
};
// logica asignar

const aulasSeleccionadas = ref([]);

const asignarDialogVisible = ref(false);

const mesaActual = ref(null);

const aulasAsignadas = ref({});

const parseNombreAula = (nombre) => {
    const match = nombre.trim().match(/^(\d+)\s*([A-Z])\s*(Primaria|Secundaria)$/i);
    if (!match) return null;

    const [, grado, seccion, nivel] = match;
    return {
        grado,
        seccion,
        nivel: nivel.toLowerCase()
    };
};
const aulasParaMostrar = computed(() => {
    const asignadas = mesaActual.value?.aulas_asignadas || {};
    const disponibles = aulasDisponibles.value || []; // ✅ nunca undefined

    // Añade las asignadas que no estén en disponibles
    Object.keys(asignadas).forEach((nombre) => {
        if (!disponibles.some((a) => a.nombre === nombre)) {
            disponibles.push({
                nombre,
                cantidad_estudiantes: asignadas[nombre],
                asignada_a_esta_mesa: true,
                asignada_a_otra_mesa: false
            });
        }
    });

    return disponibles;
});

const isAulaAsignada = (nombre) => {
    // nombre: "6 B Primaria" o "1A Primaria"
    return mesaActual.value.aulas_asignadas ? Object.keys(mesaActual.value.aulas_asignadas).includes(nombre) : false;
};

const toggleAula = (aula, event) => {
    if (!mesaActual.value) return;

    const datos = parseNombreAula(aula.nombre);
    if (!datos) {
        console.error('Formato de aula inválido:', aula.nombre);
        return;
    }

    const { grado, seccion, nivel } = datos;

    const index = aulasSeleccionadas.value.findIndex((a) => a.grado === grado && a.seccion === seccion && a.nivel === nivel);

    if (event.target.checked) {
        if (index === -1) {
            aulasSeleccionadas.value.push({ grado, seccion, nivel });
        }
    } else {
        if (index !== -1) {
            aulasSeleccionadas.value.splice(index, 1);
        }
    }
};

// Función para comparar cambios de aulas con el historial anterior
const esAgregada = (logIndex, aulaIndex) => {
    const historial = mesaStore.historialAsignacion;
    const actual = historial[logIndex]?.detalle?.aulas_asignadas || [];
    const anterior = historial[logIndex + 1]?.detalle?.aulas_asignadas || [];
    return anterior.length > 0 && !anterior.includes(actual[aulaIndex]);
};

const esRemovida = (logIndex, aulaIndex) => {
    const historial = mesaStore.historialAsignacion;
    const actual = historial[logIndex]?.detalle?.aulas_asignadas || [];
    const anterior = historial[logIndex + 1]?.detalle?.aulas_asignadas || [];
    return anterior.length > 0 && !actual.includes(anterior[aulaIndex]);
};

const abrirDialogoAsignar = async (mesa) => {
    await mesaStore.cargarMesaParaAsignacion(mesa.id);

    const mesaCargada = mesaSeleccionada.value;

    if (!mesaCargada) {
        console.error('La mesa no se cargó correctamente:', mesaCargada);
        return;
    }

    mesaActual.value = mesaCargada;
    aulasAsignadas.value = mesaCargada.aulas_asignadas || {};
    aulasDisponibles.value = mesaStore.aulasDisponibles; // O accede desde otro ref si lo separas

    asignarDialogVisible.value = true;

    aulasSeleccionadas.value = Object.keys(mesaCargada.aulas_asignadas || {})
        .map((nombre) => {
            // Este regex permite separar números, letras y nivel
            const match = nombre.trim().match(/^(\d+)\s*([A-Z])\s*(Primaria|Secundaria)$/i);

            if (!match) {
                console.warn('Formato inválido de aula:', nombre);
                return null;
            }

            const [, grado, seccion, nivel] = match;

            return {
                nivel: nivel.toLowerCase(),
                grado,
                seccion
            };
        })
        .filter(Boolean);
};
const guardarAsignacion = async () => {
    if (!mesaActual.value) return;

    const aulasFormateadas = aulasSeleccionadas.value.map(({ grado, seccion, nivel }) => ({
        grado,
        seccion,
        nivel
    }));

    const ok = await mesaStore.asignarAulasAMesa(mesaActual.value.id, aulasFormateadas);

    if (ok) {
        // ✅ Recargar mesas para la elección actual
        if (eleccionSeleccionada.value) {
            await mesaStore.ListarMesas(eleccionSeleccionada.value);
        }

        asignarDialogVisible.value = false;
        toast.add({ severity: 'success', summary: 'Asignación actualizada', life: 3000 });
    } else {
        toast.add({ severity: 'error', summary: 'Hubo un error al asignar aulas', life: 3000 });
    }
};

onMounted(async () => {
    mesaStore.reset();
    await eleccionStore.ListaEleccion();

    if (elecciones.value.length > 0) {
        eleccionSeleccionada.value = elecciones.value[0].id; // 👈 asegura que no sea undefined
    }
});

watch(eleccionSeleccionada, async (id) => {
    if (id) {
        mesaStore.eleccionId = id;
        await mesaStore.ListarMesas(id);
    } else {
        mesaStore.reset();
    }
});

watch(mesaSeleccionada, (nueva) => {
    aulasAsignadas.value = nueva?.aulas_asignadas || {};
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar Mesa" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <div class="space-y-4">
                <div>
                    <label class="block font-medium mb-1">Selecciona una elección:</label>
                    <Skeleton v-if="loadingElecciones" height="2.5rem" class="w-full rounded" />
                    <select v-else v-model="eleccionSeleccionada" class="border rounded px-3 py-2 w-full">
                        <option disabled value="">-- Selecciona --</option>
                        <option v-for="eleccion in elecciones" :key="eleccion.id" :value="eleccion.id">
                            {{ eleccion.nombre }}
                        </option>
                    </select>
                </div>
            </div>

            <DataTable
                :value="loadingMesas ? skeletonRows : mesas"
                :paginator="true"
                :rows="8"
                :filters="filters"
                :globalFilterFields="['codigo_mesa', 'ubicacion', 'responsable', 'estudiantes_count']"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} mesas"
            >
                <!-- Encabezado -->
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Mesas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <!-- Columna: Código de Mesa -->
                <Column header="Código" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingMesas" height="1rem" width="70%" />
                        <span v-else>{{ slotProps.data.codigo_mesa }}</span>
                    </template>
                </Column>

                <!-- Columna: Ubicación -->
                <Column header="Ubicación" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingMesas" height="1rem" width="70%" />
                        <span v-else>{{ slotProps.data.ubicacion }}</span>
                    </template>
                </Column>

                <!-- Columna: Responsable -->
                <Column header="Responsable" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingMesas" height="1rem" width="70%" />
                        <span v-else>{{ slotProps.data.responsable }}</span>
                    </template>
                </Column>

                <!-- Columna: Cantidad de Estudiantes -->
                <Column header="Estudiantes" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingMesas" height="1rem" width="60%" />
                        <span v-else>
                            {{ slotProps.data.eleccion?.estado === 'finalizada' ? '---' : slotProps.data.estudiantes_count }}
                        </span>
                    </template>
                </Column>

                <!-- Columna: Acciones -->
                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <template v-if="loadingMesas">
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" />
                        </template>

                        <template v-else>
                            <!-- 🔀 Mostrar botón según estado de la elección -->
                            <Button
                                v-if="!['en_proceso', 'finalizada'].includes(slotProps.data.eleccion?.estado)"
                                icon="pi pi-book"
                                outlined
                                rounded
                                class="mr-2"
                                severity="info"
                                @click="abrirDialogoAsignar(slotProps.data)"
                                v-tooltip.top="'Asignar aulas'"
                            />

                            <Button v-else icon="pi pi-history" outlined rounded class="mr-2" severity="secondary" @click="abrirDialogoHistorial(slotProps.data)" v-tooltip.top="'Ver historial'" />

                            <!-- Exportar -->
                            <Button
                                icon="pi pi-download"
                                :loading="mesaStore.loadingExportByMesa[slotProps.data.id]"
                                outlined
                                rounded
                                severity="success"
                                class="mr-2"
                                :disabled="!slotProps.data.estudiantes_count || slotProps.data.estudiantes_count === 0 || mesaStore.loadingExportByMesa[slotProps.data.id]"
                                @click="descargarZip(Number(slotProps.data.id))"
                                v-tooltip.top="'Descargar padrón por mesas'"
                            />

                            <!-- Editar -->
                            <Button
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                class="mr-2"
                                :disabled="['en_proceso', 'finalizada'].includes(slotProps.data.eleccion?.estado)"
                                @click="editMesa(slotProps.data)"
                                v-tooltip.top="['en_proceso', 'finalizada'].includes(slotProps.data.eleccion?.estado) ? 'No se pueden editar mesas de una elección en proceso o finalizada' : 'Editar mesa'"
                            />

                            <!-- Eliminar -->
                            <Button
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                class="mr-2"
                                :disabled="['en_proceso', 'finalizada'].includes(slotProps.data.eleccion?.estado)"
                                @click="confirmDeleteMesa(slotProps.data)"
                                v-tooltip.top="['en_proceso', 'finalizada'].includes(slotProps.data.eleccion?.estado) ? 'No se pueden eliminar mesas de una elección en proceso o finalizada' : 'Eliminar mesa'"
                            />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Diálogo Crear / Editar Mesa -->
        <Dialog v-model:visible="mesaCreateDialog" modal header="Mesa Electoral" :style="{ width: '500px' }">
            <!-- Solo mostrar si se está creando una nueva mesa -->
            <div class="mb-4" v-if="!isEditMode">
                <label for="eleccion" class="block font-medium mb-1">Elección</label>
                <select id="eleccion" v-model="form.eleccion_id" class="w-full p-2 border border-gray-300 rounded">
                    <option value="">Seleccione una elección</option>
                    <option v-for="e in eleccionesPendientes" :key="e.id" :value="e.id">
                        {{ e.nombre }}
                    </option>
                </select>
                <InputError :message="errors?.eleccion_id ? errors.eleccion_id[0] : ''" />
            </div>

            <div class="mb-4">
                <label for="codigo_mesa" class="block font-medium mb-1">Código de Mesa</label>
                <input id="codigo_mesa" type="text" v-model="form.codigo_mesa" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.codigo_mesa ? errors.codigo_mesa[0] : ''" />
            </div>

            <div class="mb-4">
                <label for="ubicacion" class="block font-medium mb-1">Ubicación</label>
                <input id="ubicacion" type="text" v-model="form.ubicacion" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.ubicacion ? errors.ubicacion[0] : ''" />
            </div>

            <div class="mb-4">
                <label for="responsable" class="block font-medium mb-1">Responsable</label>
                <input id="responsable" type="text" v-model="form.responsable" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.responsable ? errors.responsable[0] : ''" />
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200" @click="mesaCreateDialog = false">Cancelar</button>
                <button type="button" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700" @click="handleSave">Guardar</button>
            </div>
        </Dialog>

        <Dialog v-model:visible="deleteMesaDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl text-red-600" />
                <span class="text-red-600" v-if="selectedMesa">
                    ¿Estás seguro que deseas eliminar la mesa <b>#{{ selectedMesa.codigo_mesa }}</b> ubicada en <b>{{ selectedMesa.ubicacion }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="deleteMesaDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteMesa" severity="danger" />
            </template>
        </Dialog>

        <Dialog v-model:visible="asignarDialogVisible" header="Asignar aulas" modal class="p-4 rounded-lg shadow-lg max-w-3xl w-full">
            <template #default>
                <div v-if="aulasParaMostrar.length > 0">
                    <!-- Mostrar todas las aulas (disponibles + asignadas) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div v-for="aula in aulasParaMostrar" :key="aula.nombre" class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 transition">
                            <input type="checkbox" :checked="isAulaAsignada(aula.nombre)" @change="toggleAula(aula, $event)" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span class="text-gray-700 font-medium" v-tooltip.top="`Estudiantes: ${aula.cantidad_estudiantes}`">
                                {{ aula.nombre }}
                            </span>
                        </div>
                    </div>

                    <!-- Botón Guardar -->
                    <div class="flex justify-end mt-4" v-if="aulasParaMostrar.length > 0">
                        <Button label="Guardar" icon="pi pi-check" class="bg-blue-600 hover:bg-blue-700 text-white" @click="guardarAsignacion" />
                    </div>
                </div>

                <div v-else class="text-center py-6 text-gray-500">
                    <p>No hay aulas disponibles para asignar.</p>
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="historialDialogVisible" header="Histórico de asignaciones" modal class="p-4 rounded-lg shadow-lg max-w-3xl w-full">
            <template #default>
                <div v-if="mesaStore.loadingHistorial" class="text-center py-4 text-gray-500">Cargando historial...</div>

                <div v-else-if="mesaStore.historialAsignacion.length">
                    <ul class="space-y-3">
                        <li v-for="(log, idx) in mesaStore.historialAsignacion" :key="log.id" class="p-3 border rounded bg-gray-50">
                            <div class="flex justify-between items-center">
                                <p class="font-semibold">{{ log.accion }}</p>
                                <span class="text-sm text-gray-500">
                                    {{ new Date(log.created_at).toLocaleString() }}
                                </span>
                            </div>

                            <p v-if="log.detalle?.aulas_asignadas?.length" class="text-sm mt-1">
                                Aulas:
                                <template v-for="(aulaStr, i) in log.detalle.aulas_asignadas" :key="i">
                                    <span
                                        :class="{
                                            'text-green-600 font-semibold': esAgregada(idx, i),
                                            'text-red-600 line-through': esRemovida(idx, i)
                                        }"
                                    >
                                        {{
                                            (() => {
                                                const match = aulaStr.match(/^(Primaria|Secundaria)\s+(\d+)([A-Z])$/);
                                                if (!match) return aulaStr;
                                                const [, nivel, grado, seccion] = match;
                                                return `${nivel} ${grado}${seccion}`;
                                            })()
                                        }}
                                    </span>
                                    <span v-if="i < log.detalle.aulas_asignadas.length - 1">, </span>
                                </template>
                            </p>

                            <p v-if="log.detalle?.total_asignados !== undefined" class="text-sm text-gray-600 mt-1">Total asignados: {{ log.detalle.total_asignados }}</p>
                        </li>
                    </ul>
                </div>

                <div v-else class="text-center py-6 text-gray-500">No hay historial de asignaciones para esta mesa.</div>
            </template>
        </Dialog>
    </div>
</template>
