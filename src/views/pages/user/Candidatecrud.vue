<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { deleteCandidateById, updateCandidate } from '@/service/candidateService';
import { formatDateForApi } from '@/service/utils/dateUtil.js';
import { useCandidatoStore } from '@/stores/candidatos';
import SelectButton from 'primevue/selectbutton';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const candidatoStore = useCandidatoStore();
const errors = computed(() => candidatoStore.errors);
const imagePreview = ref('null');
const toast = useToast();
const candidatos = ref([]);
const filters = ref({ global: { value: '' } });
const candidateCreateDialog = ref(false);
const isEditMode = ref(false);
const deleteCandidateDialog = ref(false);
const selectedCandidate = ref(null);
const fileInput = ref(null);
// const errors = ref([]);

const options = ref([
    'Masculino',
    'Femenino'
]);
const form = ref({
    name: '',
    last_name: '',
    foto: null,
    sexo: '',
    fecha_postulacion: '',
    estado: 'activo',

});

const openNew = () => {
    isEditMode.value = false;
    form.value = {
        name: '',
        last_name: '',
        foto: '',
        sexo: '',
        fecha_postulacion: '',
    };
    imagePreview.value = '';
    candidateCreateDialog.value = true;
};

const openEdit = (candidate) => {
    isEditMode.value = true;
    form.value = {
        id: candidate.id,
        name: candidate.nombre,
        last_name: candidate.apellido,
        foto: candidate.foto,
        sexo: candidate.sexo,
        fecha_postulacion: candidate.fecha_postulacion,
    };
    imagePreview.value = getImageUrl(candidate.foto) || '';
    candidateCreateDialog.value = true;
};
const getImageUrl = (foto) => {

    return `${import.meta.env.VITE_APP_API_URL}/storage/${foto}`;

};
const confirmDeleteCandidate = (candidate) => {
    selectedCandidate.value = candidate;
    deleteCandidateDialog.value = true;
};

const onFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.foto = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;

        };
        reader.readAsDataURL(file);
    }
}
const createACandidate = async () => {

    const createSuccess = await candidatoStore.crearCandidato(form.value);
    if (createSuccess) {
        candidateCreateDialog.value = false;
        form.value = {
            name: '',
            last_name: '',
            foto: '',
            sexo: '',
            fecha_postulacion: '',
            estado: 'activo',
            fecha_nacimiento: '',
        };
        await candidatoStore.ObtenerCandidatos();
        // Mostramos el mensaje de éxito
        toast.add({
            severity: 'success',
            summary: 'Candidato creado',
            detail: 'El candidato ha sido creado correctamente',
            life: 3000,
        });
    }

};

const updateAcandidate = async () => {
    try {
        if (form.value.fecha_postulacion) {
            // Solo formatea si hay un valor
            const formattedDate = formatDateForApi(form.value.fecha_postulacion);
            if (formattedDate) {
                form.value.fecha_postulacion = formattedDate;
            }
        }

        await updateCandidate(form.value);
        candidateCreateDialog.value = false;
        await candidatoStore.ObtenerCandidatos();
        toast.add({ severity: 'success', summary: 'Accion exitosa', detail: 'Candidato actualizado', life: 3000 });
    } catch (error) {

        errors.value = error.response?.data?.errors || {};
    }
};
const deleteCandidate = async () => {
    try {
        await deleteCandidateById(selectedCandidate.value.id);
        deleteCandidateDialog.value = false;
        await candidatoStore.ObtenerCandidatos();
        toast.add({ severity: 'success', summary: 'Accion exitosa', detail: 'Usuario eliminado', life: 3000 });
        selectedCandidate.value = null;
    } catch (error) {

    }
};
const handleSave = () => {
    if (isEditMode.value) {
        updateAcandidate();
    } else {
        createACandidate();
    }
};


onMounted(() => {
    candidatoStore.ObtenerCandidatos();
});
</script>

<template>
    <div>

        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar candidato" icon="pi pi-plus-circle" severity="secondary" class="mr-2"
                        @click="openNew" />
                </template>

                <template #end>
                    <Button label="Exportar datos" icon="pi pi-upload" severity="secondary" disabled
                        @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable :value="candidatoStore.candidatos" :paginator="true" :rows="8" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios">
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

                <Column field="nombre" header="Nombre" sortable style="width: 25%"></Column>
                <Column field="apellido" header="Apellido" style="width: 25%"></Column>
                <Column field="estado" header="Estado" style="width: 25%"></Column>
                <Column field="fecha_postulacion" header="Fecha de postulacion" style="width: 25%"></Column>

                <Column :exportable="false" style="min-width: 12rem" header="Acciones">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteCandidate(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="candidateCreateDialog" :modal="true" :style="{ width: '30rem' }" :closable="false">
            <div class="flex flex-col gap-5 px-3">
                <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Detalles del Candidato</h2>
                <div class="mb-1">
                    <div class="flex flex-col items-center">
                        <div class="w-32 h-32 mb-4 relative">
                            <img v-if="imagePreview" :src="imagePreview" alt="Vista previa de la imagen de perfil"
                                class="w-full h-full object-cover rounded-full border-4 border-indigo-500"
                                loading="lazy" />

                            <div v-else class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                                <i class="pi pi-user" style="font-size: 3rem"></i>
                            </div>
                            <input type="file" id="foto" ref="fileInput" accept="image/*" class="hidden"
                                @change="onFileSelect" />

                            <button type="button" @click="$refs.fileInput.click()"
                                class="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <i class="pi pi-camera" style="font-size: 1.5rem"></i>
                            </button>

                        </div>
                        <p class="text-sm text-gray-500 mb-2">Subir la foto del Candidato o Logo</p>

                        <InputError class="mt-2" :message="errors.foto ? errors.foto.join(', ') : ''" />
                    </div>
                </div>
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
                    <InputLabel for="sexo" value="Sexo" />
                    <SelectButton v-model="form.sexo" :options="options" aria-labelledby="basic"
                        :invalid="!!errors.sexo" />


                    <InputError class="mt-2" :message="errors.sexo ? errors.sexo.join(', ') : ''" />
                </div>
                <div>
                    <InputLabel for="Fecha_postulacion" value="Fecha de postulacion" />
                    <DatePicker class="mt-1 block w-full" v-model="form.fecha_postulacion" dateFormat="yy-mm-dd"
                        :invalid="!!errors.fecha_postulacion" />

                    <InputError class="mt-2"
                        :message="errors.fecha_postulacion ? errors.fecha_postulacion.join(', ') : ''" />
                </div>

                <div class="flex justify-center"></div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="candidateCreateDialog = false" />
                <Button label="Guardar" class="custom-cancel-button" text icon="pi pi-check" @click="handleSave" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCandidateDialog" :style="{ width: '450px', textColor: '#ffebee' }"
            header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl " style="color: red" />
                <span class="text-red-500" v-if="selectedCandidate">Estas seguro que quieres eliminar a <b>{{
                    selectedCandidate.nombre
                        }} {{
                            selectedCandidate.apellido
                        }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text
                    @click="deleteCandidateDialog = false" />
                <Button label="Si" icon="pi pi-check" @click="deleteCandidate" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>
