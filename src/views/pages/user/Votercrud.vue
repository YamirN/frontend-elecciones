<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { formatDateForApi, formatDateForCreateUsers, formatDateInList } from '@/service/utils/dateUtil.js';
import { createVoter, deleteVoterById, exportVotantes, fetchVoter, importVotantes, updateVoter } from '@/service/voterService';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const votantes = ref([]);
const filters = ref({ global: { value: '' } });
const voterCreateDialog = ref(false);
const isEditMode = ref(false);
const deleteVoterDialog = ref(false);
const selectedVoter = ref(null);
const errors = ref({});
const fileupload = ref(null);
const optionsSexo = ref([
    'Masculino',
    'Femenino'
]);
const optionsNivel = ref([
    'Primaria',
    'Secundaria'
]);

const gradoOptions = ref({
    Primaria: [
        { label: '1ro', disabled: false },
        { label: '2do', disabled: false },
        { label: '3ro', disabled: false },
        { label: '4to', disabled: false },
        { label: '5to', disabled: false },
        { label: '6to', disabled: false }
    ],
    Secundaria: [
        { label: '1ro', disabled: false },
        { label: '2do', disabled: false },
        { label: '3ro', disabled: false },
        { label: '4to', disabled: false }
    ]
});

const filteredGradoOptions = computed(() => {
    if (form.value.nivel === 'Primaria') {
        return gradoOptions.value.Primaria;
    } else if (form.value.nivel === 'Secundaria') {
        return gradoOptions.value.Secundaria;
    } else {
        // Si no se ha seleccionado nivel, deshabilitar todas las opciones
        return [
            { label: '1ro', disabled: true },
            { label: '2do', disabled: true },
            { label: '3ro', disabled: true },
            { label: '4to', disabled: true },
            { label: '5to', disabled: true },
            { label: '6to', disabled: true },
        ];
    }
});

const form = ref({
    name: '',
    last_name: '',
    dni: '',
    grado: '',
    seccion: '',
    nivel: '',
    fecha_nacimiento: '',
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
        fecha_nacimiento: '',
        sexo: '',

    };
    errors.value = {};
    voterCreateDialog.value = true;
};

const openEdit = (votante) => {
    isEditMode.value = true;
    form.value = {
        id: votante.id,
        name: votante.name,
        last_name: votante.last_name,
        dni: votante.dni,
        grado: votante.grado,
        seccion: votante.seccion,
        nivel: votante.nivel,
        fecha_nacimiento: votante.fecha_nacimiento,
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

        form.value.fecha_nacimiento = formatDateForCreateUsers(form.value.fecha_nacimiento);
        await createVoter(form.value);
        voterCreateDialog.value = false;
        form.value = {
            name: '',
            last_name: '',
            dni: '',
            grado: '',
            seccion: '',
            nivel: '',
            fecha_nacimiento: '',
            sexo: '',
            estado: 'activo',

        };
        await fetchVoterList();
        toast.add({ severity: 'success', summary: 'Usuario creado', detail: 'Detalle del mensaje', life: 3000 });
    } catch (error) {

        errors.value = error.response.data.errors;
    }
};

const fetchVoterList = async () => {
    try {
        const response = await fetchVoter();
        votantes.value = response.votante
            .map(votante => {
                const name = votante.user?.name || 'N/A';
                const last_name = votante.user?.last_name || 'N/A';
                const nameComplete = `${name} ${last_name}`;
                const grado = votante.grado;
                const seccion = votante.seccion;
                const gradeSection = `${grado} ${seccion}`;
                return {
                    id: votante.id,
                    dni: votante.dni,
                    nameComplete,
                    name,
                    last_name,
                    gradeSection,
                    grado: votante.grado,
                    seccion: votante.seccion,
                    nivel: votante.nivel,
                    sexo: votante.sexo,
                    estado: votante.estado,
                    fecha_nacimiento: formatDateInList(votante.fecha_nacimiento),
                };
            });

    } catch (error) {

    }
};

const onFileSelect = async (event) => {
    const file = event.files[0];
    if (file) {
        try {
            await importVotantes(file);
            toast.add({ severity: 'success', summary: 'Datos subidos', detail: 'Archivo importado con exito!', life: 3000 });
            await fetchVoterList();
        } catch (error) {


        }
    }
};
const onError = () => {
    toast.add({ severity: 'error', summary: 'Error al cargar el archivo', detail: 'Verifica los datos', life: 3000 });
};

const exportCSV = async () => {
    try {
        const data = await exportVotantes();

        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ListaVotantes.xlsx');
        document.body.appendChild(link);
        link.click();
    } catch (error) {

    }
};
const updateAvoter = async () => {
    try {
        if (form.value.fecha_nacimiento) {
            // Solo formatea si hay un valor
            const formattedDate = formatDateForApi(form.value.fecha_nacimiento);
            if (formattedDate) {
                form.value.fecha_nacimiento = formattedDate;
            }
        }

        await updateVoter(form.value);
        voterCreateDialog.value = false;
        await fetchVoterList();
        toast.add({ severity: 'success', summary: 'Accion exitosa', detail: 'Votante actualizado', life: 3000 });
    } catch (error) {


        errors.value = error.response?.data?.errors || {};
    }
};

const deleteVoter = async () => {
    try {
        await deleteVoterById(selectedVoter.value.id);
        deleteVoterDialog.value = false;
        await fetchVoterList();
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

onMounted(fetchVoterList);
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar votante" icon="pi pi-plus-circle" severity="secondary" class="mr-2"
                        @click="openNew" />
                </template>

                <template #end>
                    <FileUpload ref="fileupload" mode="basic" url="http://127.0.0.1:8000/api/import-votantes"
                        name="file" accept=".xlsx,.csv" :maxFileSize="1000000" chooseLabel="Importar Datos"
                        @upload="onFileSelect" @error="onError" class="mr-2" auto />

                    <Button label="Exportar Datos" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
                </template>
            </Toolbar>

            <DataTable :value="votantes" :paginator="true" :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Votantes</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>
                <Column field="dni" header="Dni" style="width: 12%"></Column>
                <Column field="nameComplete" header="Nombre" sortable style="width: 25%"></Column>
                <Column field="gradeSection" header="Grado" style="width: 12%"></Column>
                <Column field="nivel" header="Nivel" sortable style="width: 12%"></Column>
                <Column field="sexo" header="Sexo" style="width: 12%"></Column>
                <Column field="estado" header="Estado" sortable style="width: 12%"></Column>
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
                <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Detalles del Votante</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <!-- Usamos grid para dividir en dos columnas -->
                    <div>
                        <InputLabel for="name" value="Nombre" />
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
                        <InputText class="mt-1 block w-full" v-model="form.seccion" :invalid="!!errors.seccion" />
                        <InputError class="mt-2" :message="errors.seccion ? errors.seccion.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="nivel" value="Nivel" />
                        <SelectButton v-model="form.nivel" :options="optionsNivel" aria-labelledby="nivel" />
                        <InputError class="mt-2" :message="errors.nivel ? errors.nivel.join(', ') : ''" />

                        <InputLabel for="grado" value="Grado" />
                        <SelectButton v-model="form.grado" :options="filteredGradoOptions" optionLabel="label"
                            optionValue="label" optionDisabled="disabled" aria-labelledby="grado"
                            placeholder="Selecciona un nivel primero" />
                    </div>

                    <div>
                        <InputLabel for="sexo" value="Sexo" />
                        <SelectButton v-model="form.sexo" :options="optionsSexo" aria-labelledby="sexo" />
                        <InputError class="mt-2" :message="errors.sexo ? errors.sexo.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="fecha_nacimiento" value="Fecha de Nacimiento" />
                        <DatePicker class="mt-1 block w-full" v-model="form.fecha_nacimiento" dateFormat="dd/mm/yy" />
                    </div>
                </div>

                <div class="flex justify-center"></div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="voterCreateDialog = false" />
                <Button label="Save" class="custom-cancel-button" text icon="pi pi-check" @click="handleSave" />
            </template>
        </Dialog>


        <Dialog v-model:visible="deleteVoterDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" style="color: red" />
                <span class="text-red-500" v-if="selectedVoter">Estas seguro que quieres eliminar a <b>{{
                    selectedVoter.nameComplete
                        }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="deleteVoterDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteVoter" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>
