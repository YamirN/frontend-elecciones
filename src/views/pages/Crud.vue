<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import TextInput from '@/components/TextInput.vue';
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
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                :value="users"
                :paginator="true"
                :rows="8"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Usuarios</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="name" header="Name" sortable style="width: 25%"></Column>
                <Column field="email" header="Email" style="width: 35%"></Column>
                <Column field="password" header="Password" style="width: 25%"></Column>
                <Column :exportable="false" style="min-width: 12rem" header="Acciones">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="opendialogview(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUser(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="userCreateDialog" :modal="true" header="Crear Usuario" :style="{ width: '25rem' }">
            <div class="flex flex-col gap-6">
                <div>
                    <InputLabel for="name" value="Name" />

                    <TextInput id="name" type="text" class="mt-1 block w-full" v-model="form.name" required autocomplete="name" />

                    <InputError class="mt-2" :message="errors.name ? errors.name.join(', ') : ''" />
                </div>

                <div class="mt-4">
                    <InputLabel for="email" value="Email" />
                    <TextInput id="email" type="email" class="mt-1 block w-full" v-model="form.email" required autocomplete="username" />
                    <InputError class="mt-2" :message="errors.email || ''" />
                </div>

                <div class="mt-4">
                    <InputLabel for="password" value="Password" />
                    <TextInput id="password" type="password" class="mt-1 block w-full" v-model="form.password" required autocomplete="new-password" />
                    <InputError class="mt-2" :message="errors.password || ''" />
                </div>

                <div class="mt-4">
                    <InputLabel for="password_confirmation" value="Confirm Password" />
                    <TextInput id="password_confirmation" type="password" class="mt-1 block w-full" v-model="form.password_confirmation" required autocomplete="new-password" />
                    <InputError class="mt-2" :message="errors.password_confirmation || ''" />
                </div>

                <div class="flex justify-center"></div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="userCreateDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="handleSave" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="selectedUser"
                    >Estas seguro que quieres eliminar a <b>{{ selectedUser.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteUserHandler" />
            </template>
        </Dialog>
    </div>
</template>
