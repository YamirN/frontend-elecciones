<script setup>
import { createUser, deleteUserById, fetchUsers, updateUser } from '@/service/userService';
import { useUsuarioStore } from '@/stores/usuarioStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const usuarioStore = useUsuarioStore();
const { usuarios, loading: loadingUsuarios } = storeToRefs(usuarioStore);

const toast = useToast();
const users = ref([]);
const filters = ref({ global: { value: '' } });
const userCreateDialog = ref(false);
const isEditMode = ref(false);
const deleteUserDialog = ref(false);
const selectedUser = ref(null);
const form = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    errors: {}
});
const errors = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
});

const openNew = () => {
    isEditMode.value = false;
    errors.value = {};
    form.value = {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    };
    userCreateDialog.value = true;
};

const openEdit = (user) => {
    isEditMode.value = true;
    form.value = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: ''
    };
    userCreateDialog.value = true;
};
const confirmDeleteUser = (user) => {
    selectedUser.value = user;
    deleteUserDialog.value = true;
};
const createUserHandler = async () => {
    try {
        await createUser(form.value);
        userCreateDialog.value = false;
        form.value = {
            name: '',
            email: '',
            password: '',
            password_confirmation: ''
        };
        await fetchUsersList(); // Actualiza la lista de usuarios
        toast.add({ severity: 'success', summary: 'Usuario creado', detail: 'Detalle del mensaje', life: 3000 });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        errors.value = error.response?.data?.errors || {};
    }
};

const fetchUsersList = async () => {
    try {
        users.value = await fetchUsers();
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
};

const updateUserHandler = async () => {
    try {
        await updateUser(form.value); // Llama al servicio para actualizar el usuario
        userCreateDialog.value = false;
        await fetchUsersList(); // Actualiza la lista de usuarios
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
        createUserHandler();
    }
};

onMounted(() => {
    usuarioStore.obtenerUsuarios();
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" disabled />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" disabled />
                </template>
            </Toolbar>

            <DataTable
                :value="usuarios"
                :paginator="true"
                :rows="8"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista de Usuarios</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column header="Nombre " style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.nombre }} {{ slotProps.data.apellido }}</span>
                    </template>
                </Column>

                <Column header="Rol " style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.roles.length ? slotProps.data.roles[0].name : 'Sin rol' }}</span>
                    </template>
                </Column>
                <Column header="Estado " style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>

                        <Tag :value="slotProps.data.estado" :severity="slotProps.data.estado === 'activo' ? 'success' : 'danger'" class="mt-1" />
                    </template>
                </Column>
                <Column header="Acciones" style="min-width: 16rem">
                    <template #body="slotProps">
                        <template v-if="loadingUsuarios">
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" />
                        </template>
                        <template v-else>
                            <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info" @click="verEstudiante(slotProps.data)" />
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        
    </div>
</template>
