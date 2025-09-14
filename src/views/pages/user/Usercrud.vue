<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { useUsuarioStore } from '@/stores/usuarioStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const usuarioStore = useUsuarioStore();
const { roles, usuarios, loading: loadingUsuarios, errors } = storeToRefs(usuarioStore);

const toast = useToast();

const filters = ref({ global: { value: '' } });
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditMode = ref(false);
const deleteUserDialog = ref(false);
const selectedUsuario = ref(null);
const form = ref({
    nombre_usuario: '',
    nombre: '',
    apellido: '',
    role_id: '',
    estado: 'activo',
    email: '',
    password: '',
    password_confirmation: ''
});

const openNew = () => {
    isEditMode.value = false;

    form.value = {
        nombre_usuario: '',
        nombre: '',
        apellido: '',
        role_id: '',
        estado: 'activo',
        email: '',
        password: '',
        password_confirmation: ''
    };
    errors.value = {};
    showFormDialog.value = true;
};

const openEdit = (usuario) => {
    isEditMode.value = true;
    selectedUsuario.value = usuario;
    form.value = {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        role_id: usuario.roles?.[0]?.id || null,
        estado: usuario.estado,
        email: usuario.email,
        password: '',
        password_confirmation: ''
    };
    errors.value = {};
    showFormDialog.value = true;
};

const optionsEstado = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
];

const confirmDeleteUser = (usuario) => {
    selectedUsuario.value = usuario;
    showDeleteDialog.value = true;
};

const onFormSubmit = async () => {
    const formData = new FormData();

    formData.append('nombre_usuario', form.value.nombre_usuario);
    formData.append('nombre', form.value.nombre);
    formData.append('apellido', form.value.apellido);
    formData.append('role_id', form.value.role_id);
    formData.append('estado', form.value.estado);
    formData.append('email', form.value.email);
    formData.append('password', form.value.password);
    formData.append('password_confirmation', form.value.password_confirmation);

    try {
        if (isEditMode.value) {
            await usuarioStore.actualizarUsuario(selectedUsuario.value?.id, formData);
        } else {
            await usuarioStore.crearUsuario(formData);
        }

        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'Usuario actualizado' : 'Usuario creado',
            detail: 'La operación fue exitosa.',
            life: 3000
        });

        showFormDialog.value = false;
        selectedUsuario.value = null;
    } catch (err) {
        console.error('Error al enviar:', err);
        errors.value = usuarioStore.errors;
    }
};

const deleteUsuario = async () => {
    const success = await usuarioStore.eliminarUsuario(selectedUsuario.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Usuario eliminado',
            detail: 'Se eliminó correctamente',
            life: 3000
        });

        showDeleteDialog.value = false;
        selectedUsuario.value = null;
    }
};

onMounted(async () => {
    await usuarioStore.obtenerUsuarios();
    await usuarioStore.obtenerRoles();
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar usuario" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
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

                <Column header="Usuario" style="width: 15%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.nombre_usuario }} </span>
                    </template>
                </Column>

                <Column header="Nombre Completo" style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.nombre }} {{ slotProps.data.apellido }}</span>
                    </template>
                </Column>

                <Column header="Correo" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.email }} </span>
                    </template>
                </Column>

                <Column header="Rol " style="width: 25%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingUsuarios" height="1rem" width="80%"></Skeleton>
                        <span v-else>{{ slotProps.data.roles.length ? slotProps.data.roles[0].name : 'Sin rol' }}</span>
                    </template>
                </Column>
                <Column header="Estado " style="width: 20%">
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
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showFormDialog" :modal="true" :style="{ width: '40rem' }" :closable="false">
            <div class="px-6 py-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-2">Detalles del Usuario</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <InputLabel for="nombre_usuario" value="Nombre_usuario" />
                        <InputText class="mt-1 w-full" v-model="form.nombre_usuario" :invalid="!!errors.nombre_usuario" />
                        <InputError class="mt-1" :message="errors.nombre_usuario ? errors.nombre_usuario.join(', ') : ''" />
                    </div>
                    <div>
                        <InputLabel for="nombre" value="Nombre" />
                        <InputText class="mt-1 w-full" v-model="form.nombre" :invalid="!!errors.nombre" />
                        <InputError class="mt-1" :message="errors.nombre ? errors.nombre.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="apellido" value="Apellido" />
                        <InputText class="mt-1 w-full" v-model="form.apellido" :invalid="!!errors.apellido" />
                        <InputError class="mt-1" :message="errors.apellido ? errors.apellido.join(', ') : ''" />
                    </div>
                    <div>
                        <InputLabel for="rol" value="Rol" />
                        <Select v-model="form.role_id" :options="roles" optionLabel="name" optionValue="id" placeholder="Selecciona el rol" class="w-full mt-1" />
                        <InputError class="mt-1" :message="errors.role_id ? errors.role_id.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="estado" value="Estado" />
                        <Select v-model="form.estado" :options="optionsEstado" optionLabel="label" optionValue="value" placeholder="Selecciona el estado" class="w-full mt-1" />
                        <InputError class="mt-1" :message="errors.estado ? errors.estado.join(', ') : ''" />
                    </div>
                    <div>
                        <InputLabel for="email" value="Email" />
                        <InputText class="mt-1 w-full" v-model="form.email" :invalid="!!errors.email" />
                        <InputError class="mt-1" :message="errors.email ? errors.email.join(', ') : ''" />
                    </div>

                    <div>
                        <InputLabel for="password" value="Password" />
                        <InputText class="mt-1 w-full" v-model="form.password" :invalid="!!errors.password" type="password" />
                        <InputError class="mt-1" :message="errors.password ? errors.password.join(', ') : ''" />
                    </div>
                    <div>
                        <InputLabel for="password_confirmation" value="Confirmar Contraseña" />
                        <InputText class="mt-1 w-full" v-model="form.password_confirmation" :invalid="!!errors.password_confirmation" type="password" />
                        <InputError class="mt-1" :message="errors.password_confirmation ? errors.password_confirmation.join(', ') : ''" />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3 px-6 py-3 border-t">
                    <Button label="Cancelar" icon="pi pi-times" text class="p-button-secondary" @click="showFormDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" class="p-button-success" @click="onFormSubmit" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" style="color: red" />
                <span class="text-red-500" v-if="selectedUsuario"
                    >Estas seguro que quieres eliminar a <b>{{ selectedUsuario.nombre }} {{ selectedUsuario.apellido }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="showDeleteDialog = false" />
                <Button label="Si" icon="pi pi-check" @click="deleteUsuario" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>
