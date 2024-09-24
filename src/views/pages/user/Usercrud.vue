<script setup>
import { createUser, deleteUserById, fetchUsers, updateUser } from '@/service/userService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

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

onMounted(fetchUsersList);
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" disabled />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)"
                        disabled />
                </template>
            </Toolbar>

            <DataTable :value="users" :paginator="true" :rows="8" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios">
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

                <Column field="name" header="Name" sortable style="width: 50%"></Column>


            </DataTable>
        </div>


    </div>
</template>
