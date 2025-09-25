<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { formatDateForApi } from '@/service/utils/dateUtil';
import { validateExcelFile } from '@/service/utils/fileValidation';
import { useEleccionStore } from '@/stores/eleccionesStore';
import { useEstudianteStore } from '@/stores/estudianteStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const visible = ref(false);
const eleccionStore = useEleccionStore();
const { elecciones } = storeToRefs(eleccionStore);
const estudianteStore = useEstudianteStore();

const { estudiantes, loading: loadingEstudiantes } = storeToRefs(estudianteStore);
const errors = computed(() => estudianteStore.errors);

const pagination = computed(() => estudianteStore.pagination);
const closeDialog = () => {
    visible.value = false;
    file.value = '';
};

const eleccionActiva = computed(() => elecciones.value.some((e) => e.estado === 'en_proceso'));

const onPageChange = (event) => {
    const nuevaPagina = event.page + 1; // PrimeVue empieza desde 0

    if (filtrosActivos.value.length > 0) {
        // Construir objeto de filtros desde la lista activa
        const filtros = filtrosActivos.value.reduce((acc, filtro) => {
            acc[filtro.campo] = filtro.valor;
            return acc;
        }, {});

        estudianteStore.buscarPorFiltro(filtros, nuevaPagina);
    } else {
        estudianteStore.obtenerEstudiantes(nuevaPagina);
    }
};

const deleteConfirmVisible = ref(false);
const showViewDialog = ref(false);
const toast = useToast();
const showFormDialog = ref(false);
const isEditMode = ref(false);
const showDeleteDialog = ref(false);
const selectedEstudiante = ref(null);
const confirmText = ref('');

// filtros

// UI states
const filtroMenu = ref();
const dialogVisible = ref(false);
const campoSeleccionado = ref(null);
const valorFiltro = ref('');
const filtrosActivos = ref([]); // <- para mostrar los filtros aplicados

const menuItems = [
    { label: 'Nombre', campo: 'nombre', command: () => abrirDialogFiltro('nombre') },
    { label: 'DNI', campo: 'dni', command: () => abrirDialogFiltro('dni') },
    { label: 'Nivel', campo: 'nivel', command: () => abrirDialogFiltro('nivel') },
    { label: 'Sección', campo: 'seccion', command: () => abrirDialogFiltro('seccion') },
    { label: 'Grado', campo: 'grado', command: () => abrirDialogFiltro('grado') }
];

const labelCampoSeleccionado = computed(() => {
    const item = menuItems.find((i) => i.campo === campoSeleccionado.value);
    return item ? item.label : '';
});

function toggleFiltroMenu(event) {
    filtroMenu.value.toggle(event);
}

function abrirDialogFiltro(campo) {
    campoSeleccionado.value = campo;
    valorFiltro.value = '';
    dialogVisible.value = true;
}

async function aplicarFiltro() {
    dialogVisible.value = false;
    if (!valorFiltro.value) return;

    // Guardar filtro en lista visual (evitar duplicados)
    const existente = filtrosActivos.value.find((f) => f.campo === campoSeleccionado.value);
    if (existente) {
        existente.valor = valorFiltro.value;
    } else {
        filtrosActivos.value.push({
            campo: campoSeleccionado.value,
            label: labelCampoSeleccionado.value,
            valor: valorFiltro.value
        });
    }

    // Construir objeto de filtros para enviar al store
    const filtros = filtrosActivos.value.reduce((acc, filtro) => {
        acc[filtro.campo] = filtro.valor;
        return acc;
    }, {});

    // Llamar store con todos los filtros y reiniciar a página 1
    await estudianteStore.buscarPorFiltro(filtros, 1);
}

async function quitarFiltro(index) {
    filtrosActivos.value.splice(index, 1);

    if (filtrosActivos.value.length > 0) {
        // Reconstruir objeto con los filtros que siguen activos
        const filtros = filtrosActivos.value.reduce((acc, filtro) => {
            acc[filtro.campo] = filtro.valor;
            return acc;
        }, {});

        // Reaplicar los filtros desde la página 1
        await estudianteStore.buscarPorFiltro(filtros, 1);
    } else {
        // Si ya no hay filtros, cargar lista completa
        await estudianteStore.obtenerEstudiantes(1);
    }
}

// end filtros

// export and import
const error = ref(null);
function handleFileUpload(event) {
    const selectedFile = event.target.files[0];
    const { valid, error: validationError } = validateExcelFile(selectedFile);

    if (!valid) {
        error.value = validationError;
        return;
    }

    file.value = selectedFile;
    error.value = null;
}

const exportar = () => {
    estudianteStore.exportar();
};

const importar = async () => {
    if (!file.value) return;

    isLoading.value = true;

    try {
        // Espera un ciclo para que el loader aparezca antes de cerrar el otro modal
        await nextTick();
        visible.value = false;

        await estudianteStore.importar(file.value);

        toast.add({
            severity: 'success',
            summary: 'Datos importados',
            detail: 'La operación fue exitosa.',
            life: 3000
        });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Hubo un error al importar los datos', detail: 'Verificar el formato de los datos', life: 10000 });
    } finally {
        isLoading.value = false;
    }
};

const descargarPlantilla = () => {
    const link = document.createElement('a');
    link.href = '/plantillas_estudiantes.xlsx';
    link.download = 'plantillas_estudiantes.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

//

const isLoading = ref(false);
const file = ref(null);
const showDeleteConfirmation = () => {
    deleteConfirmVisible.value = true;
};
const optionsSexo = ref(['Masculino', 'Femenino']);
const optionsNivel = ref(['Primaria', 'Secundaria']);

const skeletonRows = Array.from({ length: 10 }, () => ({}));

const SeccionOptions = ref([
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
    { label: 'E', value: 'E' },
    { label: 'F', value: 'F' },
    { label: 'G', value: 'G' },
    { label: 'H', value: 'H' },
    { label: 'I', value: 'I' },
    { label: 'J', value: 'J' },
    { label: 'K', value: 'K' },
    { label: 'L', value: 'L' },
    { label: 'M', value: 'M' },
    { label: 'N', value: 'N' }
]);

const optionsEstado = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];

const gradoOptions = ref([
    { label: 'Primero', value: '1' },
    { label: 'Segundo', value: '2' },
    { label: 'Tercero', value: '3' },
    { label: 'Cuarto', value: '4' },
    { label: 'Quinto', value: '5' },
    { label: 'Sexto', value: '6' }
]);

const validateSelection = () => {
    errors.value.nivel = null;
    errors.value.grado = null;

    if (form.value.nivel === 'Secundaria' && form.value.grado === 'Sexto') {
        errors.value.nivel = ['La combinación de nivel y grado es inválida.'];
        errors.value.grado = ['El grado "Sexto" no está disponible para "Secundaria".'];
    }
};
const isValidSelection = computed(() => {
    return form.value.nivel !== 'Secundaria' || form.value.grado !== 'Sexto';
});

const form = ref({
    nombre: '',
    apellido: '',
    dni: '',
    grado: '',
    seccion: '',
    nivel: '',
    sexo: '',
    estado: 'activo',
    fecha_nacimiento: ''
});

const openNew = () => {
    isEditMode.value = false;
    form.value = {
        nombre: '',
        apellido: '',
        dni: '',
        grado: '',
        seccion: '',
        nivel: '',
        sexo: '',
        estado: 'activo',
        fecha_nacimiento: ''
    };
    errors.value = {};
    showFormDialog.value = true;
};

const openEdit = (estudiante) => {
    isEditMode.value = true;
    selectedEstudiante.value = estudiante;
    form.value = {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        dni: estudiante.dni,
        grado: estudiante.grado,
        seccion: estudiante.seccion,
        nivel: estudiante.nivel,
        sexo: estudiante.sexo,
        estado: estudiante.estado,
        fecha_nacimiento: estudiante.fecha_nacimiento
    };
    errors.value = {};

    showFormDialog.value = true;
};
const confirmDeleteUser = (estudiante) => {
    selectedEstudiante.value = estudiante;
    showDeleteDialog.value = true;
};

function verEstudiante(estudiante) {
    selectedEstudiante.value = { ...estudiante };
    showViewDialog.value = true;
}

const onFormSubmit = async () => {
    const formData = new FormData();

    formData.append('nombre', form.value.nombre);
    formData.append('apellido', form.value.apellido);
    formData.append('dni', form.value.dni);
    formData.append('grado', form.value.grado);
    formData.append('seccion', form.value.seccion);
    formData.append('nivel', form.value.nivel);
    formData.append('sexo', form.value.sexo);
    formData.append('estado', form.value.estado);
    formData.append('fecha_nacimiento', formatDateForApi(form.value.fecha_nacimiento));

    try {
        if (isEditMode.value) {
            await estudianteStore.actualizarEstudiante(selectedEstudiante.value?.id, formData);
        } else {
            await estudianteStore.crearEstudiante(formData);
        }

        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'Estudiante actualizado' : 'Estudiante creado',
            detail: 'La operación fue exitosa.',
            life: 3000
        });

        showFormDialog.value = false;
        selectedEstudiante.value = null;
    } catch (err) {
        console.error('Error al enviar:', err);
        errors.value = estudianteStore.errors;
    }
};

const eliminarVotantes = async () => {
    const success = await estudianteStore.eliminarTodosEstudiantes();
    if (success) {
        deleteConfirmVisible.value = false;
    } else {
        console.error(estudianteStore.error || 'Error al eliminar los votantes.');
    }
    confirmText.value = '';
    deleteConfirmVisible.value = false;
};

const deleteEstudiante = async () => {
    const success = await estudianteStore.eliminarEstudiante(selectedEstudiante.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Estudiante eliminado',
            detail: 'Se eliminó correctamente',
            life: 3000
        });

        showDeleteDialog.value = false;
        selectedEstudiante.value = null;
    }
};

onMounted(async () => {
    await estudianteStore.obtenerEstudiantes();
    await eleccionStore.ListaEleccion();
});

watch(() => form.value, validateSelection, { deep: true });
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-4 flex flex-wrap justify-between items-center bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-sm rounded-xl px-4 py-3 backdrop-blur-sm">
                <template #start>
                    <div class="flex flex-wrap gap-3">
                        <Button unstyled label="Registrar " icon="pi pi-plus" class="flex items-center gap-2 bg-green-500 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200" @click="openNew" />

                        <Button unstyled label=" Eliminar Todos" icon="pi pi-trash" class="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200" @click="showDeleteConfirmation" />
                    </div>
                </template>

                <template #end>
                    <div class="flex flex-wrap gap-3">
                        <Button
                            unstyled
                            label=" Importar"
                            icon="pi pi-file-excel"
                            class="border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
                            @click="visible = true"
                        />

                        <Button
                            unstyled
                            label=" Exportar"
                            icon="pi pi-download"
                            class="border border-slate-400 text-slate-600 hover:bg-slate-50 font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
                            :loading="estudianteStore.loading"
                            @click="exportar"
                        />
                    </div>
                </template>
            </Toolbar>

            <DataTable
                :value="loadingEstudiantes ? skeletonRows : estudiantes"
                :lazy="true"
                :paginator="true"
                :rows="pagination.per_page"
                :totalRecords="pagination.total"
                :first="(pagination.current_page - 1) * pagination.per_page"
                @page="onPageChange"
                dataKey="id"
            >
                <template #header>
                    <div class="flex flex-col w-full gap-2">
                        <!-- Primera fila: título y total -->
                        <div class="flex flex-wrap items-center justify-between">
                            <h4 class="m-0">Administrar Estudiantes</h4>
                            <h4 class="text-near text-gray-500">Total de estudiantes: {{ pagination.total }}</h4>
                            <div class="flex items-center gap-3 px-4 py-2">
                                <span class="font-semibold text-slate-700">Filtros</span>

                                <Button
                                    unstyled
                                    icon="pi pi-plus"
                                    @click="toggleFiltroMenu($event)"
                                    class="flex items-center gap-2 border border-blue-300 text-blue-600 hover:bg-slate-100 px-1.5 py-1.5 rounded-md shadow-sm transition-all duration-200"
                                />

                                <Menu ref="filtroMenu" :model="menuItems" :popup="true" />
                            </div>
                        </div>

                        <!-- Segunda fila: filtros activos -->
                        <div v-if="filtrosActivos.length" class="flex flex-wrap gap-2">
                            <Tag v-for="(f, index) in filtrosActivos" :key="index" :value="`${f.label}: ${f.valor}`" rounded severity="info" class="cursor-pointer">
                                <template #icon>
                                    <i class="pi pi-times ml-1 cursor-pointer" @click.stop="quitarFiltro(index)" />
                                </template>
                            </Tag>
                        </div>
                    </div>

                    <!-- Dialog -->
                    <Dialog v-model:visible="dialogVisible" modal :header="`Filtrar por ${labelCampoSeleccionado}`" style="width: 400px">
                        <div class="flex flex-col gap-3">
                            <InputText v-model="valorFiltro" placeholder="Ingrese valor..." class="w-full" />
                        </div>
                        <template #footer>
                            <Button label="Cancelar" icon="pi pi-times" text @click="dialogVisible = false" />
                            <Button label="Aplicar Filtro" icon="pi pi-check" @click="aplicarFiltro" autofocus />
                        </template>
                    </Dialog>
                </template>

                <Column header="Nombre " style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingEstudiantes" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.nombre }} {{ slotProps.data.apellido }}</span>
                    </template>
                </Column>
                <Column header="DNI " style="width: 25%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingEstudiantes" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.dni }}</span>
                    </template>
                </Column>
                <Column header="Aula" style="width: 25%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingEstudiantes" height="1rem" width="50%"></Skeleton>
                        <span v-else>{{ slotProps.data.grado }} - {{ slotProps.data.seccion }} {{ slotProps.data.nivel }}</span>
                    </template>
                </Column>
                <Column header="Acciones" style="min-width: 16rem">
                    <template #body="slotProps">
                        <template v-if="loadingEstudiantes">
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" />
                        </template>
                        <template v-else>
                            <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info" @click="verEstudiante(slotProps.data)" />
                            <!-- Editar -->
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" :disabled="eleccionActiva" v-tooltip="eleccionActiva ? 'No se puede editar mientras hay una elección en proceso' : ''" />

                            <!-- Eliminar -->
                            <Button
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                @click="confirmDeleteUser(slotProps.data)"
                                :disabled="eleccionActiva"
                                v-tooltip="eleccionActiva ? 'No se puede eliminar mientras hay una elección en proceso' : ''"
                            />
                        </template>
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="dialogVisible" modal :header="`Filtrar por ${labelCampoSeleccionado}`" style="width: 400px">
                <div class="flex flex-col gap-3">
                    <div>
                        <InputText v-model="valorFiltro" placeholder="Ingrese valor..." class="w-full" />
                    </div>
                </div>

                <template #footer>
                    <Button label="Cancelar" icon="pi pi-times" text @click="dialogVisible = false" />
                    <Button label="Aplicar Filtro" icon="pi pi-check" @click="aplicarFiltro" autofocus />
                </template>
            </Dialog>
        </div>

        <Dialog v-model:visible="showFormDialog" :modal="true" :style="{ width: '40rem' }" :closable="false">
            <div class="px-6 py-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-2">Detalles del Estudiante</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <!-- Nombre -->
                    <div>
                        <InputLabel for="nombre" value="Nombre" />
                        <InputText class="mt-1 w-full" v-model="form.nombre" :invalid="!!errors.nombre" />
                        <InputError class="mt-1" :message="errors.nombre ? errors.nombre.join(', ') : ''" />
                    </div>

                    <!-- Apellido -->
                    <div>
                        <InputLabel for="apellido" value="Apellido" />
                        <InputText class="mt-1 w-full" v-model="form.apellido" :invalid="!!errors.apellido" />
                        <InputError class="mt-1" :message="errors.apellido ? errors.apellido.join(', ') : ''" />
                    </div>

                    <!-- DNI -->
                    <div>
                        <InputLabel for="dni" value="DNI" />
                        <InputText class="mt-1 w-full" v-model="form.dni" :invalid="!!errors.dni" />
                        <InputError class="mt-1" :message="errors.dni ? errors.dni.join(', ') : ''" />
                    </div>

                    <!-- Sección -->
                    <div>
                        <InputLabel for="seccion" value="Sección" />
                        <Select v-model="form.seccion" :options="SeccionOptions" optionLabel="label" optionValue="value" placeholder="Elige la sección" class="w-full" :invalid="!!errors.seccion" />
                        <InputError class="mt-1" :message="errors.seccion ? errors.seccion.join(', ') : ''" />
                    </div>

                    <!-- Nivel -->
                    <div>
                        <InputLabel for="nivel" value="Nivel" />
                        <SelectButton v-model="form.nivel" :options="optionsNivel" aria-labelledby="nivel" />
                        <InputError class="mt-1" :message="errors.nivel ? errors.nivel.join(', ') : ''" />
                    </div>

                    <!-- Grado -->
                    <div>
                        <InputLabel for="grado" value="Grado" />
                        <Select v-model="form.grado" :options="gradoOptions" optionLabel="label" optionValue="value" placeholder="Selecciona el grado" class="w-full" />
                        <InputError class="mt-1" :message="errors.grado ? errors.grado.join(', ') : ''" />
                    </div>

                    <!-- Sexo -->
                    <div>
                        <InputLabel for="sexo" value="Sexo" />
                        <SelectButton v-model="form.sexo" :options="optionsSexo" aria-labelledby="sexo" />
                        <InputError class="mt-1" :message="errors.sexo ? errors.sexo.join(', ') : ''" />
                    </div>

                    <!-- Estado -->
                    <div>
                        <InputLabel for="estado" value="Estado" />
                        <Select v-model="form.estado" :options="optionsEstado" optionLabel="label" optionValue="value" placeholder="Selecciona el estado" class="w-full" />
                        <InputError class="mt-1" :message="errors.estado ? errors.estado.join(', ') : ''" />
                    </div>

                    <!-- Fecha de nacimiento -->
                    <div class="md:col-span-2">
                        <InputLabel for="fecha_nacimiento" value="Fecha de Nacimiento" />
                        <Calendar v-model="form.fecha_nacimiento" dateFormat="dd-mm-yy" showIcon class="w-full" :invalid="!!errors.fecha_nacimiento" />
                        <InputError class="mt-1" :message="errors.fecha_nacimiento ? errors.fecha_nacimiento.join(', ') : ''" />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3 px-6 py-3 border-t">
                    <Button label="Cancelar" icon="pi pi-times" text class="p-button-secondary" @click="showFormDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" class="p-button-success" @click="onFormSubmit" :disabled="!isValidSelection" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" style="color: red" />
                <span class="text-red-500" v-if="selectedEstudiante"
                    >Estas seguro que quieres eliminar a <b>{{ selectedEstudiante.nombre }} {{ selectedEstudiante.apellido }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="showDeleteDialog = false" />
                <Button label="Si" icon="pi pi-check" @click="deleteEstudiante" severity="danger" />
            </template>
        </Dialog>
    </div>
    <!-- Modal -->

    <Dialog v-model:visible="visible" modal :style="{ width: '30rem' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }" :showHeader="false" :closeOnEscape="true" :dismissableMask="true">
        <div class="p-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Subir Excel de los Estudiantes</h2>
                <Button icon="pi pi-times" @click="closeDialog" class="p-button-rounded p-button-text" />
            </div>

            <Message severity="warn" :closable="false" class="mb-6">
                <template #icon>
                    <i class="pi pi-exclamation-triangle mr-2"></i>
                </template>
                <span class="font-bold">Importante:</span> Use la plantilla proporcionada para evitar errores en la importación.
            </Message>

            <div class="mb-6">
                <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">Archivo Excel</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md select-none" @mousedown.prevent>
                    <div class="space-y-1 text-center">
                        <i class="pi pi-upload text-4xl text-gray-400"></i>
                        <div class="flex text-sm text-gray-600">
                            <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
                                <span>Seleccionar archivo</span>
                                <input
                                    id="file-upload"
                                    name="file"
                                    type="file"
                                    class="sr-only"
                                    @change="
                                        handleFileUpload($event);
                                        $event.target.blur();
                                    "
                                    accept=".xlsx, .xls"
                                />
                            </label>
                            <p class="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p class="text-xs text-gray-500">Excel (.xlsx, .xls)</p>
                    </div>
                </div>
                <p v-if="file" class="mt-2 text-sm text-gray-500">Archivo seleccionado: {{ file.name }}</p>
            </div>

            <div class="flex justify-between">
                <Button @click="descargarPlantilla" class="p-button-secondary">
                    <i class="pi pi-download mr-2"></i>
                    <span>Descargar Plantilla</span>
                </Button>
                <Button @click="importar" :disabled="!file" class="p-button-primary">
                    <i class="pi pi-upload mr-2"></i>
                    <span>Importar Datos</span>
                </Button>
            </div>
        </div>
    </Dialog>
    <Dialog v-model:visible="isLoading" modal :closable="false" :showHeader="false" :style="{ width: '320px' }">
        <div class="flex flex-col items-center p-6 space-y-4 text-center">
            <!-- Título -->
            <h3 class="text-lg font-semibold text-gray-800">Importando datos...</h3>

            <!-- Spinner -->
            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />

            <!-- Mensaje descriptivo -->
            <p class="text-sm text-gray-600 leading-relaxed">
                Por favor, espere mientras procesamos el archivo Excel.<br />
                Este proceso puede tardar unos minutos dependiendo del tamaño del archivo.
            </p>
        </div>
    </Dialog>

    <!-- Toast para mensajes -->
    <Toast />
    <!-- Diálogo de confirmación -->
    <Dialog v-model:visible="deleteConfirmVisible" modal :style="{ width: '400px' }" :closable="false">
        <div class="px-6 py-4">
            <div class="flex flex-col items-center text-center space-y-4">
                <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 3rem"></i>
                <h2 class="text-xl font-bold text-gray-800">Confirmar eliminación</h2>
                <p class="text-gray-600">Esta acción eliminará <strong>todos los registros de estudiantes</strong>. Para continuar, escribe <span class="font-semibold text-red-500">ELIMINAR</span> en el campo.</p>

                <InputText v-model="confirmText" placeholder="Escribe ELIMINAR para confirmar" class="w-full" />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 px-6 py-3 border-t">
                <Button label="Cancelar" icon="pi pi-times" text class="p-button-secondary" @click="deleteConfirmVisible = false" />
                <Button
                    label="Eliminar"
                    icon="pi pi-trash"
                    outlined
                    rounded
                    severity="danger"
                    @click="eliminarVotantes"
                    :disabled="confirmText !== 'ELIMINAR' || eleccionActiva"
                    v-tooltip="eleccionActiva ? 'No se puede eliminar mientras hay una elección en proceso' : ''"
                />
            </div>
        </template>
    </Dialog>

    <Dialog
        v-model:visible="showViewDialog"
        header="Detalles del Estudiante"
        :modal="true"
        :style="{ width: '450px' }"
        :pt="{
            root: 'rounded-xl shadow-lg',
            header: 'flex items-center gap-3 border-b border-gray-200 px-6 py-4 text-xl font-bold text-gray-800 bg-gray-50 rounded-t-xl',
            content: 'p-0',
            footer: 'border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50 rounded-b-xl'
        }"
    >
        <template #header>
            <i class="pi pi-user-edit text-2xl text-blue-600"></i>
            <span class="text-xl font-bold text-gray-800">Detalles del Estudiante</span>
        </template>
        <div class="p-6 space-y-4">
            <!-- Nombre Completo -->
            <div class="pb-3 border-b border-gray-100">
                <span class="block text-sm font-semibold text-gray-600">Nombre Completo:</span>
                <span class="block text-lg text-gray-900 font-medium">{{ selectedEstudiante.nombre }} {{ selectedEstudiante.apellido }}</span>
            </div>

            <!-- Sexo -->
            <div class="pb-3 border-b border-gray-100">
                <span class="block text-sm font-semibold text-gray-600">Sexo:</span>
                <span class="block text-lg text-gray-900 font-medium">{{ selectedEstudiante.sexo }}</span>
            </div>

            <!-- DNI -->
            <div class="pb-3 border-b border-gray-100">
                <span class="block text-sm font-semibold text-gray-600">DNI:</span>
                <span class="block text-lg text-gray-900 font-medium">{{ selectedEstudiante.dni }}</span>
            </div>

            <!-- Grado y Sección -->
            <div class="pb-3 border-b border-gray-100">
                <span class="block text-sm font-semibold text-gray-600">Grado y Sección:</span>
                <span class="block text-lg text-gray-900 font-medium">{{ selectedEstudiante.grado }} - {{ selectedEstudiante.seccion }}</span>
            </div>

            <!-- Nivel -->
            <div class="pb-3 border-b border-gray-100">
                <span class="block text-sm font-semibold text-gray-600">Nivel:</span>
                <span class="block text-lg text-gray-900 font-medium">{{ selectedEstudiante.nivel }}</span>
            </div>

            <!-- Estado -->
            <div class="pb-3 border-b border-gray-100">
                <span class="block text-sm font-semibold text-gray-600">Estado:</span>
                <Tag :value="selectedEstudiante.estado" :severity="selectedEstudiante.estado === 'activo' ? 'success' : 'danger'" class="mt-1" />
            </div>

            <!-- Fecha de nacimiento (sin borde inferior si es el último) -->
            <div class="pb-0">
                <span class="block text-sm font-semibold text-gray-600">Fecha de nacimiento:</span>
                <span class="block text-lg text-gray-900 font-medium">{{ selectedEstudiante.fecha_nacimiento }}</span>
            </div>
        </div>
        <template #footer>
            <Button label="Cerrar" icon="pi pi-times" text @click="showViewDialog = false" />
        </template>
    </Dialog>
</template>
<style scoped>
.p-dialog-content {
    padding: 0 !important;
}
:deep(.p-dialog .p-dialog-header) {
    font-weight: bold;
}
.toolbar-modern {
    background: linear-gradient(135deg, #ffffff, #f7f9fc);
    border: 1px solid #e3e8ef;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(6px);
}

.modern-btn {
    font-weight: 600;
    border-radius: 10px;
    transition: all 0.25s ease;
}

.modern-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.p-button-outlined {
    background-color: white;
}
</style>
