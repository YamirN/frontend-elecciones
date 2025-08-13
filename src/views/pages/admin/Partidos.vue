<script setup>
import { useCandidatoStore } from '@/stores/candidatos';
import { useCargoStore } from '@/stores/cargoStore';
import { useEleccionStore } from '@/stores/eleccionesStore';
import { useEstudianteStore } from '@/stores/estudianteStore';
import { usePartidoStore } from '@/stores/partidoStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
const baseLogoUrl = import.meta.env.VITE_STORAGE_URL + '/';

// States y Stores
const eleccionStore = useEleccionStore();
const candidatoStore = useCandidatoStore();
const partidoStore = usePartidoStore();
const cargoStore = useCargoStore();
const estudianteStore = useEstudianteStore();

const { estudiantes, loading: loadingEstudiantes } = storeToRefs(estudianteStore);
const { cargos } = storeToRefs(cargoStore);
const { candidatos } = storeToRefs(candidatoStore);
const { elecciones, loading: loadingElecciones } = storeToRefs(eleccionStore);
const { partidosPorEleccion, loading: loadingPartidos } = storeToRefs(partidoStore);

let timeout = null;
const eleccionSeleccionada = ref('');
const selectedPartido = ref(null);
const selectedEleccion = ref(null);
const asignarModalVisible = ref(false);
const isEditMode = ref(false);
const showFormDialog = ref(false);
const mostrarModalCandidatos = ref(false);
const showDeleteDialog = ref(false);
const toast = useToast();
const asignaciones = ref([]);

const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));

// 🧾 Valores iniciales del formulario
const initialValues = ref({
    eleccion_id: '',
    nombre_partido: '',
    logo: ''
});

const errors = ref({});

// 🧼 Reset del formulario
const resetForm = () => {
    initialValues.value = {
        eleccion_id: eleccionSeleccionada.value || '',
        nombre_partido: '',
        logo: ''
    };
    errors.value = {};
};

const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        initialValues.value.logo = file;
    }
};

const openAsignarCandidatos = async (partido) => {
    try {
        selectedPartido.value = partido;

        selectedEleccion.value = partido.eleccion ?? { id: partido.eleccion_id, nombre_eleccion: '' };

        if (!Array.isArray(cargos.value) || !cargos.value.length) {
            await cargoStore.ListaCargo();
        }

        await candidatoStore.ListaCandidatosPorPartido(partido.id);

        const listaCandidatos = Array.isArray(candidatos.value) ? candidatos.value : [];

        asignaciones.value = (cargos.value || []).map((cargo) => {
            const asignado = listaCandidatos.find((x) => {
                if (x.cargo?.id && cargo.id) return x.cargo.id === cargo.id;
                const a = (x.cargo?.nombre_cargo ?? '').trim().toLowerCase();
                const b = (cargo.nombre_cargo ?? '').trim().toLowerCase();
                return a && b && a === b;
            });

            return {
                cargo_id: cargo.id ?? null,
                cargo_nombre: cargo.nombre_cargo ?? '',
                estudiante: asignado
                    ? {
                          id: asignado.estudiante?.id ?? null,
                          nombre: asignado.estudiante ? `${asignado.estudiante.nombre} ${asignado.estudiante.apellido}`.trim() : ''
                      }
                    : null,

                estudiante_id: asignado ? (asignado.estudiante?.id ?? null) : null
            };
        });

        asignarModalVisible.value = true;
    } catch (err) {
        console.error('Error al abrir modal de asignar:', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información.' });
    }
};

// 🆕 Crear nuevo candidato
const openNew = () => {
    isEditMode.value = false;
    resetForm();

    showFormDialog.value = true;
};
const verCandidatos = async (partido) => {
    await candidatoStore.ListaCandidatosPorPartido(partido.id);
    mostrarModalCandidatos.value = true; // si usas modal
};

// ✏️ Editar candidato
const openEdit = (partido) => {
    isEditMode.value = true;
    selectedPartido.value = partido;
    initialValues.value = {
        id: partido.id,
        eleccion_id: partido.eleccion_id,
        nombre_partido: partido.nombre_partido,
        logo: partido.logo ? baseLogoUrl + partido.logo : null
    };

    showFormDialog.value = true;
};

const onFormSubmit = async () => {
    const formData = new FormData();

    formData.append('eleccion_id', initialValues.value.eleccion_id);
    formData.append('nombre_partido', initialValues.value.nombre_partido);

    if (initialValues.value.logo instanceof File) {
        formData.append('logo', initialValues.value.logo);
    }

    try {
        if (isEditMode.value) {
            await partidoStore.actualizarPartido(selectedPartido.value?.id, formData);
        } else {
            await partidoStore.crearPartido(formData);
        }

        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'Lista actualizada' : 'Lista creada',
            detail: 'La operación fue exitosa.',
            life: 3000
        });

        showFormDialog.value = false;
        selectedPartido.value = null;

        if (eleccionSeleccionada.value) {
            await partidoStore.ObtenerPartidosPorEleccion(eleccionSeleccionada.value);
        }
    } catch (err) {
        console.error('Error al enviar:', err);
        errors.value = partidoStore.errors;
    }
};

// ❌ Confirmar eliminación
const confirmDeletePartido = (partido) => {
    selectedPartido.value = partido;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar candidato
const deletePartido = async () => {
    const success = await partidoStore.eliminarPartido(selectedPartido.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Lista eliminada',
            detail: 'Se eliminó correctamente.',
            life: 3000
        });

        showDeleteDialog.value = false;
        selectedPartido.value = null;

        if (eleccionSeleccionada.value) {
            await partidoStore.ObtenerPartidosPorEleccion(eleccionSeleccionada.value);
        }
    }
};

const onBuscarEstudiante = (query) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const term = query?.trim();
        if (term && term.length >= 3) {
            estudianteStore.buscarPorNombre(term);
        }
    }, 300);
};

const guardarAsignacion = async () => {
    try {
        const payload = asignaciones.value.map((a) => ({
            cargo_id: a.cargo_id,
            estudiante_id: a.estudiante_id // puede ser null o un id válido
        }));

        await candidatoStore.asignarCandidatos(selectedPartido.value.id, selectedEleccion.value.id, payload);

        toast.add({ severity: 'success', summary: 'Correcto', detail: 'Candidatos asignados.' });
        asignarModalVisible.value = false;

        await candidatoStore.ListaCandidatosPorPartido(selectedPartido.value.id);
    } catch (err) {
        console.error('Error al guardar asignaciones:', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar.' });
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    await Promise.all([eleccionStore.ListaEleccion()], partidoStore.reset());
});

// 🎯 Filtro de candidatos
watch(eleccionSeleccionada, async (id) => {
    partidoStore.reset();
    if (id) await partidoStore.ObtenerPartidosPorEleccion(id);
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar superior -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar listas" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingElecciones || loadingPartidos" />
                </template>
            </Toolbar>

            <!-- 🟡 Selector de Elección con Skeleton -->
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
                :value="loadingPartidos ? skeletonRows : partidosPorEleccion"
                :paginator="true"
                :rows="8"
                :filters="filters"
                :globalFilterFields="['nombre_partido']"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Listas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <!-- Columna 1: Nombre -->
                <Column header="Nombre Lista" style="width: 75%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingPartidos" height="1rem" width="80%"></Skeleton>

                        <span v-else>{{ slotProps.data.nombre_partido }}</span>
                    </template>
                </Column>

                <!-- Acciones -->
                <Column header="Acciones" style="min-width: 16rem">
                    <template #body="slotProps">
                        <template v-if="loadingPartidos">
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" />
                        </template>

                        <template v-else>
                            <!-- ver candidatos -->
                            <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="verCandidatos(slotProps.data)" />

                            <!-- asignar candidatos -->
                            <Button icon="pi pi-user-plus" outlined rounded class="mr-2" severity="success" @click="openAsignarCandidatos(slotProps.data)" v-tooltip.top="'Asignar candidatos'" />

                            <!-- editar -->
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />

                            <!-- eliminar -->
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePartido(slotProps.data)" />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Diálogo Crear / Editar Lista -->
        <Dialog v-model:visible="showFormDialog" modal header="Lista Electoral" :style="{ width: '500px' }">
            <div class="mb-4">
                <label for="nombre_partido" class="block font-medium mb-1">Nombre del Partido</label>
                <input id="nombre_partido" type="text" v-model="initialValues.nombre_partido" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.nombre_partido" />
            </div>

            <div class="mb-4">
                <label for="logo" class="block font-medium mb-1">Logo del Partido</label>

                <div class="flex flex-col gap-2">
                    <input id="logo" type="file" accept="image/*" class="w-full border border-gray-300 rounded px-3 py-2" @change="handleLogoUpload" />

                    <!-- Mostrar imagen actual solo en modo edición -->
                    <div v-if="isEditMode && initialValues.logo" class="mt-1">
                        <img :src="initialValues.logo" alt="Logo actual" class="w-32 h-auto border rounded shadow" />
                    </div>

                    <InputError :message="Array.isArray(errors.logo) ? errors.logo.join(', ') : errors.logo" />
                </div>
            </div>

            <!-- Solo mostrar si se está creando un nuevo partido -->
            <div class="mb-4" v-if="!isEditMode">
                <label for="eleccion" class="block font-medium mb-1">Elección</label>
                <select id="eleccion" v-model="initialValues.eleccion_id" class="w-full p-2 border border-gray-300 rounded">
                    <option value="">Seleccione una elección</option>
                    <option v-for="eleccion in elecciones" :key="eleccion.id" :value="eleccion.id">
                        {{ eleccion.nombre }}
                    </option>
                </select>
                <InputError :message="errors?.eleccion_id?.[0]?.message" />
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200" @click="showFormDialog = false">Cancelar</button>
                <button type="button" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700" @click="onFormSubmit">Guardar</button>
            </div>
        </Dialog>

        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirmar Eliminación" modal>
            <div class="flex items-center gap-4 px-2 py-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-red-600">
                    ¿Estás seguro de que deseas eliminar el partido <b>{{ selectedPartido?.nombre_partido }}</b
                    >?
                </span>
            </div>

            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deletePartido" />
            </template>
        </Dialog>

        <Dialog v-model:visible="mostrarModalCandidatos" :modal="true" :draggable="false" :style="{ width: '600px', maxWidth: '95vw' }" :header="`Candidatos`">
            <!-- Subtítulo con nombre del partido -->
            <div class="flex items-center mb-4">
                <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm border border-blue-200"> Partido: {{ candidatos[0]?.partido?.nombre_partido || 'No especificado' }} </span>
            </div>

            <!-- Tabla de candidatos -->
            <DataTable :value="candidatos" :loading="candidatoStore.loading" responsive-layout="scroll" class="shadow-sm border rounded-md">
                <Column header="#" style="width: 50px; text-align: center">
                    <template #body="{ index }">
                        {{ index + 1 }}
                    </template>
                </Column>

                <Column header="Nombre">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span class="font-medium text-gray-800"> {{ data.estudiante.nombre }} {{ data.estudiante.apellido }} </span>
                        </div>
                    </template>
                </Column>

                <Column header="Aula">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span class="font-medium text-gray-800"> {{ data.estudiante.aula }} </span>
                        </div>
                    </template>
                </Column>

                <Column header="Cargo">
                    <template #body="{ data }">
                        <span class="text-gray-700">{{ data.cargo.nombre_cargo }}</span>
                    </template>
                </Column>
            </DataTable>

            <!-- Footer con botón de cierre -->
            <template #footer>
                <div class="flex justify-end">
                    <Button label="Cerrar" icon="pi pi-times" class="p-button-text" @click="mostrarModalCandidatos = false" />
                </div>
            </template>
        </Dialog>
        <Dialog v-model:visible="asignarModalVisible" modal header="Asignar Candidatos" :style="{ width: '60rem' }">
            <div v-if="selectedPartido" class="space-y-6">
                <!-- Encabezado descriptivo -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-gray-700 text-sm leading-relaxed">
                        Asignando candidatos al partido:
                        <span class="font-semibold text-blue-700">{{ selectedPartido.nombre_partido }}</span>
                        en la elección
                        <span class="italic text-gray-900">{{ selectedEleccion.nombre_eleccion }}</span>
                    </p>
                </div>

                <!-- Lista de asignaciones -->
                <div class="space-y-5">
                    <div v-for="(item, index) in asignaciones" :key="item.cargo_id ?? index" class="grid grid-cols-12 gap-4 items-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                        <!-- Autocomplete Estudiante -->
                        <div class="col-span-6">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                            <AutocompleteEstudiante
                                :modelValue="item.estudiante"
                                @update:modelValue="
                                    (val) => {
                                        item.estudiante = val;
                                        item.estudiante_id = val?.id ?? null;
                                    }
                                "
                                :suggestions="estudiantes"
                                :loading="loadingEstudiantes"
                                @search="onBuscarEstudiante"
                                placeholder="Buscar estudiante..."
                                optionLabel="nombre"
                            />
                        </div>

                        <!-- Cargo -->
                        <div class="col-span-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                            <input type="text" readonly :value="item.cargo_nombre" class="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <template #footer>
                <div class="flex justify-between items-center w-full">
                    <Button label="Cancelar" text @click="asignarModalVisible = false" />
                    <Button label="Guardar" icon="pi pi-check" severity="success" @click="guardarAsignacion" />
                </div>
            </template>
        </Dialog>
    </div>
</template>
