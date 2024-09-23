<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { createCandidate, fetchCandidate } from '@/service/candidateService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const imagePreview = ref(null);
const toast = useToast();
const candidatos = ref([]);
const filters = ref({ global: { value: '' } });
const candidateCreateDialog = ref(false);
const isEditMode = ref(false);
const deleteUserDialog = ref(false);
const selectedUser = ref(null);
const fileInput = ref(null);
const errors = ref({});
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
    candidateCreateDialog.value = true;
};

const openEdit = (user) => {
    isEditMode.value = true;
    form.value = {
        id: user.id,
        name: user.name,
        foto: user.foto,
        sexo: user.sexo,
        fecha_postulacion: user.fecha_postulacion,
    };
    candidateCreateDialog.value = true;
};
const confirmDeleteUser = (user) => {
    selectedUser.value = user;
    deleteUserDialog.value = true;
};

const onFileSelect = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
        form.value.foto = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;

        };
        reader.readAsDataURL(file);
    }
}
const createAUser = async () => {
    try {
        const now = new Date();
        const fechaPostulacion = now.toISOString().slice(0, 19).replace('T', ' '); // Formato correcto para MySQL
        form.value.fecha_postulacion = fechaPostulacion;
        await createCandidate(form.value);
        candidateCreateDialog.value = false;
        form.value = {
            name: '',
            last_name: '',
            foto: '',
            sexo: '',
            fecha_postulacion: '',
            estado: 'activo',

        };
        await fetchCandidateList();
        toast.add({ severity: 'success', summary: 'Usuario creado', detail: 'Detalle del mensaje', life: 3000 });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        errors.value = error.response.data.errors;

    }
};

const fetchCandidateList = async () => {
    try {
        const response = await fetchCandidate();
        candidatos.value = response.candidato
            .filter(candidato => candidato.estado === 'activo')
            .map(candidato => ({
                nameComplete: `${candidato.users[0]?.name || 'N/A'} ${candidato.users[0]?.last_name || 'N/A'}`,
                sexo: candidato.sexo,
                estado: candidato.estado,
                fecha_postulacion: formatearFecha(candidato.fecha_postulacion),
            }));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
};

const updateUserHandler = async () => {
    try {
        await updateUser(form.value);
        candidateCreateDialog.value = false;
        await fetchUsersList();
        toast.add({ severity: 'success', summary: 'Usuario actualizado', detail: 'Detalle del mensaje', life: 3000 });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        errors.value = error.response?.data?.errors || {};
    }
};
const deleteUserHandler = async () => {
    try {
        await deleteUserById(selectedUser.value.id);
        deleteUserDialog.value = false;
        await fetchUsersList(); // Vuelve a cargar la lista de usuarios
        toast.add({ severity: 'success', summary: 'Usuario eliminado', detail: 'Detalle del mensaje', life: 3000 });
        selectedUser.value = null;
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
    }
};
const handleSave = () => {
    if (isEditMode.value) {
        updateUserHandler();
    } else {
        createAUser();
    }
};
const formatearFecha = (fechaISO) => {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
};
onMounted(fetchCandidateList);
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable :value="candidatos" :paginator="true" :rows="8" :filters="filters"
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

                <Column field="nameComplete" header="Nombre" sortable style="width: 25%"></Column>
                <Column field="sexo" header="Sexo" style="width: 25%"></Column>
                <Column field="fecha_postulacion" header="Fecha de postulacion" style="width: 25%"></Column>

                <Column :exportable="false" style="min-width: 12rem" header="Acciones">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteUser(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="candidateCreateDialog" :modal="true" :style="{ width: '30rem' }" :closable="false">
            <div class="flex flex-col gap-5 px-3">
                <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Crea un candidato</h2>
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
                        <p class="text-sm text-gray-500 mb-2">Subir la foto del candidato</p>

                        <InputError class="mt-2" :message="errors.foto ? errors.foto.join(', ') : ''" />
                    </div>
                </div>
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
                    <InputLabel for="sexo" value="Sexo" />
                    <InputText class="mt-1 block w-full" v-model="form.sexo" :invalid="!!errors.sexo" />
                    <InputError class="mt-2" :message="errors.sexo ? errors.sexo.join(', ') : ''" />
                </div>
                <div>
                    <InputLabel for="sexo" value="Fecha de postulacion" />
                    <DatePicker class="mt-1 block w-full" v-model="form.fecha_postulacion" dateFormat="dd/mm/yy" />

                    <InputError class="mt-2"
                        :message="errors.fecha_postulacion ? errors.fecha_postulacion.join(', ') : ''" />
                </div>

                <div class="flex justify-center"></div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="candidateCreateDialog = false" />
                <Button label="Save" class="custom-cancel-button" text icon="pi pi-check" @click="handleSave" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="selectedUser">Estas seguro que quieres eliminar a <b>{{ selectedUser.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteUserHandler" />
            </template>
        </Dialog>
    </div>
</template>
