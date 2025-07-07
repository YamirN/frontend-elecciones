<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { useClienteStore } from '@/stores/clienteStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// States y Stores

const clienteStore = useClienteStore();
const { clientes, loading: loadingClientes, errors } = storeToRefs(clienteStore);

const selectedCliente = ref(null);
const isEditMode = ref(false);
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));
const toast = useToast();

const initialValues = ref({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    estado: 'activo',
    telefono: ''
});

// ✏️ Editar cliente
const openEdit = (cliente) => {
    isEditMode.value = true;
    selectedCliente.value = cliente;

    initialValues.value = {
        id: cliente.id,
        nombre: cliente.user?.nombre || '',
        apellido: cliente.user?.apellido || '',
        email: cliente.user?.email || '',
        estado: cliente.user?.estado || 'activo',
        dni: cliente.dni,
        telefono: cliente.telefono
    };
    errors.value = {};
    showFormDialog.value = true;
};

// 📤 Guardar (crear o actualizar)
const onFormSubmit = async () => {
    const payload = { ...initialValues.value };

    const exito = isEditMode.value ? await clienteStore.actualizarCliente(payload, selectedCliente.value.id) : await clienteStore.crearCliente(payload);

    if (exito) {
        showFormDialog.value = false;
        await clienteStore.ListaCliente();
        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Cliente guardado correctamente', life: 3000 });
    } else {
        toast.add({ severity: 'warn', summary: 'Validación', detail: 'Revisa los campos del formulario.', life: 3000 });
    }
};

/// ❌ Confirmar eliminación
const confirmDelete = (cliente) => {
    selectedCliente.value = cliente;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar
const deleteCliente = async () => {
    const success = await clienteStore.eliminarCliente(selectedCliente.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Cliente eliminado',
            detail: 'Se eliminó correctamente.',
            life: 3000
        });
        showDeleteDialog.value = false;
        selectedCliente.value = null;
        await clienteStore.ListaCliente();
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    await clienteStore.ListaCliente();
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->

            <!-- Tabla de clientes -->
            <DataTable :value="loadingClientes ? skeletonRows : clientes" :paginator="true" :rows="8" :filters="filters" :globalFilterFields="['user.nombre', 'user.apellido', 'user.email', 'dni', 'telefono']" tableStyle="min-width: 40rem">
                <!-- Encabezado con búsqueda -->
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Clientes</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <!-- Nombre -->
                <Column header="Nombre">
                    <template #body="{ data }"> {{ data.user.nombre }} {{ data.user.apellido }} </template>
                </Column>

                <!-- DNI -->
                <Column field="dni" header="DNI" />

                <!-- Email -->
                <Column header="Email">
                    <template #body="{ data }"> {{ data.user.email }}</template>
                </Column>
                <!-- Teléfono -->
                <Column field="telefono" header="Teléfono" />

                <!-- Estado -->
                <Column field="estado" header="Estado">
                    <template #body="{ data }">
                        <Tag :value="data.user.estado" :severity="data.user.estado === 'activo' ? 'success' : 'danger'" />
                    </template>
                </Column>

                <!-- Acciones -->
                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog Formulario -->
        <Dialog v-model:visible="showFormDialog" modal header="Formulario de Cliente" :style="{ width: '30rem' }">
            <form @submit.prevent="onFormSubmit" class="flex flex-col gap-5 px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {{ isEditMode ? 'Editar Cliente' : 'Nuevo Cliente' }}
                </h2>

                <!-- Nombre -->
                <div>
                    <InputLabel for="nombre" value="Nombre" />
                    <InputText id="nombre" v-model="initialValues.nombre" class="w-full" />
                    <InputError class="mt-2" :message="errors.nombre ? errors.nombre.join(', ') : ''" />
                </div>

                <!-- Apellido -->
                <div>
                    <InputLabel for="apellido" value="Apellido" />
                    <InputText id="apellido" v-model="initialValues.apellido" class="w-full" />
                    <InputError class="mt-2" :message="errors.apellido ? errors.apellido.join(', ') : ''" />
                </div>

                <!-- Email -->
                <div>
                    <InputLabel for="email" value="Email" />
                    <InputText id="email" v-model="initialValues.email" type="email" class="w-full" />
                    <InputError class="mt-2" :message="errors.email ? errors.email.join(', ') : ''" />
                </div>

                <!-- DNI -->
                <div>
                    <InputLabel for="dni" value="DNI" />
                    <InputText id="dni" v-model="initialValues.dni" class="w-full" maxlength="8" />
                    <InputError class="mt-2" :message="errors.dni ? errors.dni.join(', ') : ''" />
                </div>

                <!-- Teléfono -->
                <div>
                    <InputLabel for="telefono" value="Teléfono" />
                    <InputText id="telefono" v-model="initialValues.telefono" class="w-full" />
                    <InputError class="mt-2" :message="errors.telefono ? errors.telefono.join(', ') : ''" />
                </div>

                <!-- Estado -->
                <div>
                    <InputLabel for="estado" value="Estado" />
                    <select id="estado" v-model="initialValues.estado" class="w-full p-2 border rounded">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    <InputError class="mt-2" :message="errors.estado ? errors.estado.join(', ') : ''" />
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-2">
                    <Button label="Cancelar" icon="pi pi-times" text type="button" @click="showFormDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" text type="submit" />
                </div>
            </form>
        </Dialog>

        <!-- Confirmar eliminación -->
        <Dialog v-model:visible="showDeleteDialog" header="Confirmar eliminación" :modal="true" :style="{ width: '400px' }">
            <p>
                ¿Estás seguro de que deseas eliminar el cliente <strong>{{ selectedCliente?.nombre }}</strong
                >?
            </p>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deleteCliente" />
            </template>
        </Dialog>
    </div>
</template>
