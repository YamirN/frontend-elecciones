<script setup>
import { useUsuarioStore } from '@/stores/usuarioStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const usuarioStore = useUsuarioStore();
const { roles, permisos, errors } = storeToRefs(usuarioStore);

const toast = useToast();
const showViewDialog = ref(null);
const showFormDialog = ref(null);
const showPermisosDialog = ref(null);
const filters = ref({ global: { value: '' } });

const isEditMode = ref(false);
const showDeleteDialog = ref(false);
const selectedRol = ref(null);
const permisosGlobales = ref([]);
const permisosSeleccionados = ref([]);

const form = ref({
    name: ''
});

const openNew = () => {
    isEditMode.value = false;
    errors.value = {};
    form.value = {
        name: ''
    };
    showFormDialog.value = true;
};

const openEdit = (user) => {
    isEditMode.value = true;
    form.value = {
        id: user.id,
        name: user.name
    };
    errors.value = {};
    showFormDialog.value = true;
};

const confirmRolDelete = (rol) => {
    selectedRol.value = rol;
    showDeleteDialog.value = true;
};

const verRol = (rol) => {
    selectedRol.value = rol;
    showViewDialog.value = true;
};

const asignarPermisos = (rol) => {
    selectedRol.value = rol; // <-- aquí asignas el rol seleccionado
    permisosSeleccionados.value = rol.permissions.map((p) => p.id);
    showPermisosDialog.value = true;
};

async function guardarPermisos() {
    try {
        await usuarioStore.asignarPermisos(selectedRol.value.id, permisosSeleccionados.value);
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Permisos asignados correctamente',
            life: 3000
        });
        showPermisosDialog.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.response?.data?.message || 'No se pudieron asignar los permisos',
            life: 3000
        });
    }
}

const onFormSubmitRol = async () => {
    const formData = new FormData();

    formData.append('name', form.value.name);

    try {
        if (isEditMode.value) {
            await usuarioStore.actualizarRol(selectedRol.value?.id, formData);
        } else {
            await usuarioStore.crearRol(formData);
        }

        toast.add({
            severity: 'success',
            summary: isEditMode.value ? 'Rol actualizado' : 'Rol creado',
            detail: 'La operación fue exitosa.',
            life: 3000
        });

        showFormDialog.value = false;
        selectedRol.value = null;
    } catch (err) {
        console.error('Error al enviar:', err);
        errors.value = usuarioStore.errors;
    }
};

onMounted(() => {
    usuarioStore.obtenerRoles();
    usuarioStore.obtenerPermisos().then((res) => {
        permisosGlobales.value = res.permissions;
    });
});
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Nuevo Rol" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable
                :value="roles"
                :paginator="true"
                :rows="8"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista de Roles</h4>
                    </div>
                </template>

                <Column header="Nombre " style="width: 80%">
                    <template #body="slotProps">
                        <span>{{ slotProps.data.name }} </span>
                    </template>
                </Column>

                <Column header="Acciones" style="width: 25%">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info" @click="verRol(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-key" outlined rounded class="mr-2" severity="info" @click="asignarPermisos(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmRolDelete(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" style="color: red" />
                <span class="text-red-500" v-if="selectedRol"
                    >Estas seguro que quieres eliminar el rol de <b>{{ selectedRol.name }} </b>?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="showDeleteDialog = false" />
                <Button label="Si" icon="pi pi-check" @click="deleteRol" severity="danger" />
            </template>
        </Dialog>

        <Dialog
            v-model:visible="showViewDialog"
            header="Permisos del rol"
            :modal="true"
            :style="{ width: '700px' }"
            :pt="{
                root: 'rounded-xl shadow-lg',
                header: 'flex items-center gap-3 border-b border-gray-200 px-6 py-4 text-xl font-bold text-gray-800 bg-gray-50 rounded-t-xl',
                content: 'p-0',
                footer: 'border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50 rounded-b-xl'
            }"
        >
            <template #header>
                <i class="pi pi-user-edit text-2xl text-blue-600"></i>
                <span class="text-xl font-bold text-gray-800">Permisos del Rol {{ selectedRol.name }}</span>
            </template>

            <div class="p-4 space-y-4">
                <!-- Permisos -->
                <div class="pb-3 border-b border-gray-100">
                    <span class="block text-sm font-semibold text-gray-600">Permisos:</span>

                    <div v-if="selectedRol.permissions && selectedRol.permissions.length > 0" class="mt-2">
                        <ul class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-gray-900 text-sm">
                            <li v-for="permiso in selectedRol.permissions" :key="permiso.id" class="flex items-start">
                                <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5"></i>
                                <span class="whitespace-nowrap">{{ permiso.name }}</span>
                            </li>
                        </ul>
                    </div>

                    <div v-else class="mt-2 text-gray-500 italic">No hay permisos asignados para este rol.</div>
                </div>
            </div>

            <template #footer>
                <Button label="Cerrar" icon="pi pi-times" text @click="showViewDialog = false" />
            </template>
        </Dialog>

        <Dialog v-model:visible="showPermisosDialog" modal header="Asignar Permisos" :style="{ width: '60rem' }" class="p-4">
            <div class="grid grid-cols-3 gap-4">
                <div v-for="permiso in permisos" :key="permiso.id" class="flex items-center gap-3 p-2 border rounded hover:bg-gray-50">
                    <input type="checkbox" :value="permiso.id" v-model="permisosSeleccionados" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label class="text-sm text-gray-800">{{ permiso.name }}</label>
                </div>
            </div>

            <div v-if="permisos.length === 0" class="text-gray-500 italic text-sm mt-4">No hay permisos disponibles.</div>

            <template #footer>
                <Button label="Cancelar" severity="secondary" @click="showPermisosDialog = false" />
                <Button label="Guardar" @click="guardarPermisos" />
            </template>
        </Dialog>

        <Dialog v-model:visible="showFormDialog" :modal="true" :style="{ width: '30rem' }" :closable="false">
            <div class="px-4 py-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center border-b pb-2">Detalles del Rol</h2>

                <div class="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <!-- Nombre -->
                    <div>
                        <InputLabel for="nombre" value="Nombre" />
                        <InputText class="mt-1 w-full" v-model="form.name" :invalid="!!errors.name" />
                        <InputError class="mt-1" :message="errors.name ? errors.name.join(', ') : ''" />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3 px-6 py-3 border-t">
                    <Button label="Cancelar" icon="pi pi-times" text class="p-button-secondary" @click="showFormDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" class="p-button-success" @click="onFormSubmitRol" />
                </div>
            </template>
        </Dialog>
    </div>
</template>
