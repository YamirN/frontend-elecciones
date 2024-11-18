<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { createVoter, deleteVoterById, exportVotantes, updateVoter } from '@/service/voterService';
import { useVoterStore } from '@/stores/voter';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
const visible = ref(false)

const closeDialog = () => {
    visible.value = false
    file.value = ''
}


const deleteConfirmVisible = ref(false)
const toast = useToast();
const votanteStore = useVoterStore();
const filters = ref({ global: { value: '' } });
const voterCreateDialog = ref(false);
const isEditMode = ref(false);
const deleteVoterDialog = ref(false);
const selectedVoter = ref(null);
const errors = ref({});
const isLoading = ref(false)
const file = ref(null);
const showDeleteConfirmation = () => {
    deleteConfirmVisible.value = true
}
const optionsSexo = ref([
    'Masculino',
    'Femenino'
]);
const optionsNivel = ref([
    'Primaria',
    'Secundaria'
]);


const SeccionOptions = ref([
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
    { label: 'E', value: 'E' },
    { label: 'F', value: 'F' },
    { label: 'G', value: 'G' },
    { label: 'H', value: 'H' }
]);

const gradoOptions = ref([
    { label: 'Primero', value: 'Primero' },
    { label: 'Segundo', value: 'Segundo' },
    { label: 'Tercero', value: 'Tercero' },
    { label: 'Cuarto', value: 'Cuarto' },
    { label: 'Quinto', value: 'Quinto' },
    { label: 'Sexto', value: 'Sexto' }
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
    name: '',
    last_name: '',
    dni: '',
    grado: '',
    seccion: '',
    nivel: '',
    sexo: '',
    estado: 'activo',

});


const openNew = () => {
    isEditMode.value = false;
    form.value = {
        name: '',
        last_name: '',
        dni: '',
        grado: '',
        seccion: '',
        nivel: '',
        sexo: '',

    };
    errors.value = {};
    voterCreateDialog.value = true;
};

const openEdit = (votante) => {
    isEditMode.value = true;
    form.value = {
        id: votante.id,
        name: votante.nombre,
        last_name: votante.apellido,
        dni: votante.dni,
        grado: votante.grado,
        seccion: votante.seccion,
        nivel: votante.nivel,
        sexo: votante.sexo,
    };
    errors.value = {};

    voterCreateDialog.value = true;
};
const confirmDeleteUser = (voter) => {
    selectedVoter.value = voter;
    deleteVoterDialog.value = true;
};

const createAVoter = async () => {

    try {

        await createVoter(form.value);
        voterCreateDialog.value = false;
        form.value = {
            name: '',
            last_name: '',
            dni: '',
            grado: '',
            seccion: '',
            nivel: '',
            sexo: '',
            estado: 'activo',

        };
        await votanteStore.ObtenerVotantes();
        toast.add({ severity: 'success', summary: 'Usuario creado', detail: 'Detalle del mensaje', life: 3000 });
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        errors.value = error.response.data.errors;
    }
};


// Manejar la carga del archivo
const handleFileUpload = (event) => {
    file.value = event.target.files[0];
    if (file.value) {

    }
};

// Llamar al store para importar votantes
const importFile = async () => {
    if (file.value) {
        isLoading.value = true
        try {
            // Intentar importar los votantes
            const result = await votanteStore.importarVotantes(file.value);
            if (result) {
                // Mostrar un mensaje de éxito si el resultado es true
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: votanteStore.successMessage || 'Datos importados correctamente',
                    life: 3000,
                });
                closeDialog(); // Cerrar el modal o diálogo
            }
        } catch (error) {
            // Mostrar mensaje de error capturado del store
            console.error("Error al importar:", error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: votanteStore.errorMessage || 'Hubo un problema al importar los datos.',
                life: 3000,
            });
        } finally {
            isLoading.value = false; // Detener el estado de carga
        }
    } else {
        // Mostrar advertencia si no se seleccionó un archivo
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Por favor selecciona un archivo',
            life: 3000,
        });
    }
}


const exportCSV = async () => {
    try {
        const data = await exportVotantes();
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Plantilla.xlsx');
        document.body.appendChild(link);
        link.click();
    } catch (error) {

    }
};
const updateAvoter = async () => {
    try {
        await updateVoter(form.value);
        voterCreateDialog.value = false;
        await votanteStore.ObtenerVotantes();
        toast.add({ severity: 'success', summary: 'Accion exitosa', detail: 'Votante actualizado', life: 3000 });
    } catch (error) {
        console.error("Error al cargar los datos:", error);

        errors.value = error.response?.data?.errors || {};
    }
};

const eliminarVotantes = async () => {
    const success = await votanteStore.EliminarTodosLosVotantes();
    if (success) {
        deleteConfirmVisible.value = false

    } else {
        console.error(votanteStore.error || 'Error al eliminar los votantes.');
    }
};

const deleteVoter = async () => {
    try {
        await deleteVoterById(selectedVoter.value.id);
        deleteVoterDialog.value = false;
        await votanteStore.ObtenerVotantes();
        toast.add({ severity: 'success', summary: 'Accion exitosa', detail: 'Votante Eliminado', life: 3000 });
        selectedVoter.value = null;
    } catch (error) {

    }
};

const handleSave = () => {
    if (isEditMode.value) {
        updateAvoter();
    } else {
        createAVoter();
    }
};

onMounted(() => {
    votanteStore.ObtenerVotantes();
});

watch(() => form.value, validateSelection, { deep: true });
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar Elector" icon="pi pi-plus-circle" severity="secondary" class="mr-2"
                        @click="openNew" />

                    <div>
                        <Button label="Eliminar todos los electores" icon="pi pi-trash" severity="danger" class="mr-2"
                            @click="showDeleteConfirmation" />

                    </div>
                </template>

                <template #end>
                    <Button label="Importar Estudiantes" icon="pi pi-file-excel" @click="visible = true" />
                </template>

            </Toolbar>

            <DataTable :value="votanteStore.votantes" :paginator="true" :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Electores</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>
                <Column field="nombre" header="Nombre" sortable style="width: 20%"></Column>
                <Column field="apellido" header="Apellido" sortable style="width: 20%"></Column>
                <Column field="dni" header="Dni" style="width: 15%"></Column>
                <Column field="grado" header="Grado" style="width: 15%"></Column>
                <Column field="nivel" header="Nivel" sortable style="width: 15%"></Column>

                <Column :exportable="false" style="min-width: 12rem" header="Acciones">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteUser(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="voterCreateDialog" :modal="true" :style="{ width: '30rem' }" :closable="false">
            <div class="flex flex-col gap-5 px-3">
                <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Detalles del Elector</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <!-- Usamos grid para dividir en dos columnas -->
                    <div>
                        <InputLabel for="nombre" value="Nombre" />
                        <InputText class="mt-1 block w-full" v-model="form.name" :invalid="!!errors.name" />
                        <InputError class="mt-2" :message="errors.name ? errors.name.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="last_name" value="Apellido" />
                        <InputText class="mt-1 block w-full" v-model="form.last_name" :invalid="!!errors.last_name" />
                        <InputError class="mt-2" :message="errors.last_name ? errors.last_name.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="dni" value="DNI" />
                        <InputText class="mt-1 block w-full" v-model="form.dni" :invalid="!!errors.dni" />
                        <InputError class="mt-2" :message="errors.dni ? errors.dni.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="seccion" value="Sección" />
                        <Select v-model="form.seccion" :options="SeccionOptions" optionLabel="label" optionValue="value"
                            placeholder="Elije la seccion" :invalid="!!errors.seccion" class="w-full md:w-56" />
                        <InputError class="mt-2" :message="errors.seccion ? errors.seccion.join(', ') : ''" />
                    </div>



                    <div>
                        <InputLabel for="nivel" value="Nivel" />
                        <SelectButton v-model="form.nivel" :options="optionsNivel" aria-labelledby="nivel" />
                        <InputError class="mt-2" :message="errors.nivel ? errors.nivel.join(', ') : ''" />

                        <InputLabel for="grado" value="Grado" />
                        <Select v-model="form.grado" :options="gradoOptions" optionLabel="label" optionValue="value"
                            placeholder="Selecciona el grado" class="w-full md:w-56" />
                        <InputError class="mt-2" :message="errors.grado ? errors.grado.join(', ') : ''" />

                    </div>

                    <div>
                        <InputLabel for="sexo" value="Sexo" />
                        <SelectButton v-model="form.sexo" :options="optionsSexo" aria-labelledby="sexo" />
                        <InputError class="mt-2" :message="errors.sexo ? errors.sexo.join(', ') : ''" />
                    </div>


                </div>

                <div class="flex justify-center"></div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="voterCreateDialog = false" />
                <Button label="Save" class="custom-cancel-button" text icon="pi pi-check" @click="handleSave"
                    :disabled="!isValidSelection" />
            </template>
        </Dialog>


        <Dialog v-model:visible="deleteVoterDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" style="color: red" />
                <span class="text-red-500" v-if="selectedVoter">Estas seguro que quieres eliminar a <b>{{
                    selectedVoter.nombre
                        }} {{
                            selectedVoter.apellido
                        }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="deleteVoterDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteVoter" severity="danger" />
            </template>
        </Dialog>


    </div>
    <!-- Modal -->


    <Dialog v-model:visible="visible" modal :style="{ width: '30rem' }"
        :breakpoints="{ '960px': '75vw', '641px': '90vw' }" :showHeader="false" :closeOnEscape="true"
        :dismissableMask="true">
        <div class="p-4">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Subir Excel de los Electores</h2>
                <Button icon="pi pi-times" @click="closeDialog" class="p-button-rounded p-button-text" />
            </div>



            <Message severity="warn" :closable="false" class="mb-6">
                <template #icon>
                    <i class="pi pi-exclamation-triangle mr-2"></i>
                </template>
                <span class="font-bold">Importante:</span> Use la plantilla proporcionada para evitar errores en la
                importación.
            </Message>

            <div class="mb-6">
                <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">
                    Archivo Excel
                </label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div class="space-y-1 text-center">
                        <i class="pi pi-upload text-4xl text-gray-400"></i>
                        <div class="flex text-sm text-gray-600">
                            <label for="file-upload"
                                class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Seleccionar archivo</span>
                                <input id="file-upload" name="file-upload" type="file" class="sr-only"
                                    @change="handleFileUpload" accept=".xlsx, .xls">
                            </label>
                            <p class="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p class="text-xs text-gray-500">
                            Excel (.xlsx, .xls)
                        </p>
                    </div>
                </div>
                <p v-if="file" class="mt-2 text-sm text-gray-500">
                    Archivo seleccionado: {{ file.name }}
                </p>
            </div>

            <div class="flex justify-between">
                <Button @click="exportCSV" class="p-button-secondary">
                    <i class="pi pi-download mr-2"></i>
                    <span>Descargar Plantilla</span>
                </Button>
                <Button @click="importFile" :disabled="!file" class="p-button-primary">
                    <i class="pi pi-upload mr-2"></i>
                    <span>Importar Datos</span>
                </Button>
            </div>
        </div>
    </Dialog>
    <Dialog v-model:visible="isLoading" modal :closable="false" :showHeader="false" :style="{ width: '300px' }">
        <div class="flex flex-column align-items-center p-5">
            <ProgressSpinner style="width:50px;height:50px" strokeWidth="8" fill="var(--surface-ground)"
                animationDuration=".5s" />
            <h3 class="mt-4 mb-2">Importando datos...</h3>
            <p class="text-center text-sm text-gray-600">
                Por favor, espere mientras se procesan los datos del archivo Excel.
                Este proceso puede tardar unos minutos dependiendo del tamaño del archivo.
            </p>
        </div>
    </Dialog>

    <!-- Toast para mensajes -->
    <Toast />
    <!-- Diálogo de confirmación -->
    <Dialog v-model:visible="deleteConfirmVisible" modal header="Confirmar eliminación" :style="{ width: '350px' }">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>¿Está seguro de que desea eliminar a todos los votantes?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" @click="deleteConfirmVisible = false" class="p-button-text" />
            <Button label="Sí" icon="pi pi-check" @click="eliminarVotantes" severity="danger" autofocus />
        </template>
    </Dialog>




</template>
<style>
.p-dialog-content {
    padding: 0 !important;
}
</style>