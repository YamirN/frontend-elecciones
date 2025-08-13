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
const { mesas, loading: loadingMesas, aulasDisponibles, mesaSeleccionada, aulasSinAsignarTotal } = storeToRefs(mesaStore);

const eleccionSeleccionada = ref('');
const toast = useToast();
const filters = ref({ global: { value: '' } });
const mesaCreateDialog = ref(false);
const deleteMesaDialog = ref(false);
const selectedMesa = ref(null);
const errors = computed(() => mesaStore.errors);

const skeletonRows = Array.from({ length: 8 }, () => ({}));

const form = ref({
    eleccion_id: null,
    codigo_mesa: '',
    ubicacion: '',
    responsable: ''
});

const openNew = () => {
    form.value = {
        eleccion_id: null,
        codigo_mesa: '',
        ubicacion: '',
        responsable: ''
    };
    mesaCreateDialog.value = true;
    selectedMesa.value = null;
};

const editMesa = (mesa) => {
    form.value = {
        eleccion_id: mesa.eleccion_id,
        codigo_mesa: mesa.codigo_mesa,
        ubicacion: mesa.ubicacion,
        responsable: mesa.responsable
    };
    selectedMesa.value = mesa;
    mesaCreateDialog.value = true;
};

const confirmDeleteMesa = (Mesa) => {
    selectedMesa.value = Mesa;
    deleteMesaDialog.value = true;
};

const deleteMesa = async () => {
    if (selectedMesa.value) {
        const success = await mesaStore.removeMesa(selectedMesa.value.id);
        if (!success) {
            toast.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'La mesa ha sido eliminado correctamente',
                life: 3000
            });
        }
        // Ocultar modal después de eliminar
        deleteMesaDialog.value = false;
        selectedMesa.value = null;
    }
};

const handleSave = async () => {
    const success = selectedMesa.value ? await mesaStore.updateMesa(selectedMesa.value.id, form.value) : await mesaStore.addMesa(form.value);

    if (success) {
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
            summary: selectedMesa.value ? 'Mesa actualizada' : 'Mesa creada',
            detail: 'La mesa ha sido guardada correctamente',
            life: 3000
        });
    }
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

const isAulaAsignada = (nombre) => {
    const [grado, seccion, nivel] = nombre.trim().split(' ');

    return aulasSeleccionadas.value.some((a) => a.nivel === nivel.toLowerCase() && a.grado === grado && a.seccion === seccion);
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

    await Promise.all([eleccionStore.ListaEleccion()]);
});

watch(eleccionSeleccionada, async (id) => {
    if (id) {
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
                        <span v-else>{{ slotProps.data.estudiantes_count }}</span>
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
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editMesa(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteMesa(slotProps.data)" />
                            <Button icon="pi pi-users" label="Asignar aulas" @click="abrirDialogoAsignar(slotProps.data)" />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Diálogo Crear / Editar Mesa -->
        <Dialog v-model:visible="mesaCreateDialog" modal header="Mesa Electoral" :style="{ width: '500px' }">
            <div class="mb-4">
                <label for="eleccion" class="block font-medium mb-1">Elección</label>
                <select id="eleccion" v-model="form.eleccion_id" class="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="" disabled>Selecciona una elección</option>
                    <option v-for="e in elecciones" :key="e.id" :value="e.id">
                        {{ e.nombre }}
                    </option>
                </select>
                <InputError :message="errors?.eleccion_id" />
            </div>

            <div class="mb-4">
                <label for="codigo_mesa" class="block font-medium mb-1">Código de Mesa</label>
                <input id="codigo_mesa" type="text" v-model="form.codigo_mesa" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.codigo_mesa" />
            </div>

            <div class="mb-4">
                <label for="ubicacion" class="block font-medium mb-1">Ubicación</label>
                <input id="ubicacion" type="text" v-model="form.ubicacion" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.ubicacion" />
            </div>

            <div class="mb-4">
                <label for="responsable" class="block font-medium mb-1">Responsable</label>
                <input id="responsable" type="text" v-model="form.responsable" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.responsable" />
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

        <Dialog v-model:visible="asignarDialogVisible" header="Asignar aulas" modal>
            <template #default>
                <div v-if="aulasDisponibles.length">
                    <div v-for="aula in aulasDisponibles" :key="aula.nombre">
                        <input type="checkbox" :checked="isAulaAsignada(aula.nombre)" @change="toggleAula(aula, $event)" />
                        {{ aula.nombre }}
                    </div>

                    <Button label="Guardar" icon="pi pi-check" @click="guardarAsignacion" />
                </div>
                <div v-else>
                    <p>No hay aulas disponibles para asignar.</p>
                </div>
            </template>
        </Dialog>
    </div>
</template>
