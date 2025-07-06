<script setup>
import AutocompleteEstudiante from '@/components/AutocompleteEstudiante.vue';
import { useCandidatoStore } from '@/stores/candidatos';
import { useCargoStore } from '@/stores/cargoStore';
import { useEleccionStore } from '@/stores/eleccionesStore';
import { useEstudianteStore } from '@/stores/estudianteStore';
import { usePartidoStore } from '@/stores/partidoStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

// States y Stores
const eleccionStore = useEleccionStore();
const candidatoStore = useCandidatoStore();
const estudianteStore = useEstudianteStore();
const cargoStore = useCargoStore();
const partidoStore = usePartidoStore();

const { elecciones, loading: loadingElecciones } = storeToRefs(eleccionStore);
const { candidatos, loading: loadingCandidatos } = storeToRefs(candidatoStore);
const { estudiantes, loadingEstudiantes } = storeToRefs(estudianteStore);
const { cargos } = storeToRefs(cargoStore);
const { partidos } = storeToRefs(partidoStore);

const eleccionSeleccionada = ref('');
const selectedCandidate = ref(null);
const isEditMode = ref(false);
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const toast = useToast();

const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));

// 🧾 Valores iniciales del formulario
const initialValues = ref({
    estudiante: null,
    partido_politico_id: '',
    cargo_id: '',
    eleccion_id: ''
});

const errors = ref({});

// 🧼 Reset del formulario
const resetForm = () => {
    initialValues.value = {
        estudiante_id: '',
        partido_politico_id: '',
        cargo_id: '',
        eleccion_id: eleccionSeleccionada.value || ''
    };
    errors.value = {};
};

// 🆕 Crear nuevo candidato
const openNew = () => {
    isEditMode.value = false;
    resetForm();
    showFormDialog.value = true;
};

// ✏️ Editar candidato
const openEdit = (candidato) => {
    isEditMode.value = true;
    initialValues.value = {
        id: candidato.id,
        estudiante_id: candidato.estudiante_id,
        partido_politico_id: candidato.partido_politico_id,
        cargo_id: candidato.cargo_id,
        eleccion_id: candidato.eleccion_id,
        estado_candidatura: candidato.estado_candidatura
    };
    showFormDialog.value = true;
};

const resolver = ({ values }) => {
    const errors = {};

    if (!values.estudiante?.id) {
        errors.estudiante = [{ message: 'Debe seleccionar un estudiante válido.' }];
    }

    // Validaciones adicionales
    if (!values.partido_politico_id) {
        errors.partido_politico_id = [{ message: 'Debe seleccionar un partido político.' }];
    }
    if (!values.cargo_id) {
        errors.cargo_id = [{ message: 'Debe seleccionar un cargo.' }];
    }
    if (!values.eleccion_id) {
        errors.eleccion_id = [{ message: 'Debe seleccionar una elección.' }];
    }

    return { errors };
};

const onFormSubmit = async ({ values, valid }) => {
    if (!valid) return;

    const payload = { ...values };

    const success = isEditMode.value ? await candidatoStore.actualizarCandidato(payload, selectedCandidate.value?.id) : await candidatoStore.crearCandidato(payload);

    if (success) {
        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'Candidato actualizado' : 'Candidato creado',
            detail: 'La operación fue exitosa.',
            life: 3000
        });

        showFormDialog.value = false;
        selectedCandidate.value = null;

        if (eleccionSeleccionada.value) {
            await candidatoStore.ListaCandidatosPorEleccion(eleccionSeleccionada.value);
        }
    }
};

// ❌ Confirmar eliminación
const confirmDeleteCandidate = (candidato) => {
    selectedCandidate.value = candidato;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar candidato
const deleteCandidate = async () => {
    const success = await candidatoStore.eliminarCandidato(selectedCandidate.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Candidato eliminado',
            detail: 'Se eliminó correctamente',
            life: 3000
        });

        showDeleteDialog.value = false;
        selectedCandidate.value = null;

        if (eleccionSeleccionada.value) {
            await candidatoStore.ListaCandidatosPorEleccion(eleccionSeleccionada.value);
        }
    }
};

// Datos y búsqueda de estudiantes
const onBuscarEstudiante = (query) => {
    const term = query?.trim();
    if (term && term.length >= 3) {
        estudianteStore.buscarPorNombre(term);
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    candidatoStore.reset();

    await Promise.all([eleccionStore.ListaEleccion(), cargoStore.ListaCargo(), partidoStore.ListaPartido()]);
});

// 🎯 Filtro de candidatos
watch(eleccionSeleccionada, async (id) => {
    if (id) {
        await candidatoStore.ListaCandidatosPorEleccion(id);
    } else {
        candidatoStore.reset();
    }
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar superior -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar candidato" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingElecciones || loadingCandidatos" />
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
                :value="loadingCandidatos ? skeletonRows : candidatos"
                :paginator="true"
                :rows="8"
                :filters="filters"
                :globalFilterFields="['estudiante.nombre_completo', 'estudiante.aula', 'cargo.nombre', 'partido.nombre', 'estado_candidatura']"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Candidatos</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <!-- Columna 1: Nombre -->
                <Column header="Nombre" style="width: 25%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingCandidatos" height="1rem" width="80%"></Skeleton>

                        <span v-else>{{ slotProps.data.estudiante?.nombre_completo }}</span>
                    </template>
                </Column>

                <!-- Columna 2: Aula -->
                <Column header="Aula" style="width: 10%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingCandidatos" height="1rem" width="60%" />
                        <span v-else>{{ slotProps.data.estudiante?.aula }}</span>
                    </template>
                </Column>

                <!-- Columna 3: Cargo -->
                <Column header="Cargo" style="width: 25%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingCandidatos" height="1rem" width="70%" />
                        <span v-else>{{ slotProps.data.cargo?.nombre }}</span>
                    </template>
                </Column>

                <!-- Columna 4: Lista -->
                <Column header="Lista" style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingCandidatos" height="1rem" width="60%" />
                        <span v-else>{{ slotProps.data.partido?.nombre }}</span>
                    </template>
                </Column>

                <!-- Columna 5: Estado -->
                <Column header="Estado" style="width: 25%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingCandidatos" height="1rem" width="50%" />
                        <span v-else>{{ slotProps.data.estado_candidatura }}</span>
                    </template>
                </Column>

                <!-- Acciones -->
                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <template v-if="loadingCandidatos">
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" />
                        </template>
                        <template v-else>
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCandidate(slotProps.data)" />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showFormDialog" modal :style="{ width: '30rem' }" :closable="false">
            <Form v-slot="$form" :initialValues="initialValues" :resolver="resolver" :validateOnBlur="true" :validateOnMount="false" :validateOnValueUpdate="false" @submit="onFormSubmit" class="flex flex-col gap-5 px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {{ isEditMode ? 'Editar Candidato' : 'Nuevo Candidato' }}
                </h2>

                <div>
                    <InputLabel for="estudiante_id" value="Estudiante" />
                    <AutocompleteEstudiante
                        name="estudiante"
                        :modelValue="$form.estudiante?.value"
                        @update:modelValue="$form.estudiante?.setValue($event)"
                        :suggestions="estudiantes"
                        :loading="loadingEstudiantes"
                        @search="onBuscarEstudiante"
                        placeholder="Buscar estudiante..."
                        optionLabel="nombre"
                    />
                    <Message v-if="$form.estudiante?.invalid">
                        {{ $form.estudiante?.error?.message }}
                    </Message>
                </div>

                <div>
                    <InputLabel for="partido_politico_id" value="Partido Político" />
                    <select name="partido_politico_id" class="w-full p-2 border rounded">
                        <option value="">Seleccione un partido</option>
                        <option v-for="partido in partidos" :key="partido.id" :value="partido.id">
                            {{ partido.nombre_partido }}
                        </option>
                    </select>
                    <Message v-if="$form.partido_politico_id?.invalid" severity="error">
                        {{ $form.partido_politico_id.error.message }}
                    </Message>
                </div>

                <div>
                    <InputLabel for="cargo_id" value="Cargo" />
                    <select name="cargo_id" class="w-full p-2 border rounded">
                        <option value="">Seleccione un cargo</option>
                        <option v-for="cargo in cargos" :key="cargo.id" :value="cargo.id">
                            {{ cargo.nombre_cargo }}
                        </option>
                    </select>
                    <Message v-if="$form.cargo_id?.invalid" severity="error">
                        {{ $form.cargo_id.error.message }}
                    </Message>
                </div>

                <div>
                    <InputLabel for="eleccion_id" value="Elección" />
                    <select name="eleccion_id" class="w-full p-2 border rounded">
                        <option value="">Seleccione una elección</option>
                        <option v-for="eleccion in elecciones" :key="eleccion.id" :value="eleccion.id">
                            {{ eleccion.nombre }}
                        </option>
                    </select>
                    <Message v-if="$form.eleccion_id?.invalid" severity="error">
                        {{ $form.eleccion_id.error.message }}
                    </Message>
                </div>

                <div class="flex justify-end gap-2 mt-2">
                    <Button label="Cancelar" icon="pi pi-times" text type="button" @click="showFormDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" text type="submit" />
                </div>
            </Form>
        </Dialog>

        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirmar Eliminación" :modal="true">
            <div class="flex items-center gap-4 px-2 py-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-red-600">
                    ¿Estás seguro de que deseas eliminar este candidato con ID
                    <b>{{ selectedCandidate?.id }}</b
                    >?
                </span>
            </div>

            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deleteCandidate" />
            </template>
        </Dialog>
    </div>
</template>
