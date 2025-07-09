<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { useServicioStore } from '@/stores/servicioStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// States y Stores

const servicioStore = useServicioStore();
const { servicios, loading: loadingServicios, errors } = storeToRefs(servicioStore);

const selectedServicio = ref(null);
const isEditMode = ref(false);
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));
const toast = useToast();

const initialValues = ref({
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: '',
    estado: 'activo',
    imagen: null
});

const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h ? `${h}h ` : ''}${m} min`;
};

// 🧼 Reset del formulario
const resetForm = () => {
    initialValues.value = {
        nombre: '',
        descripcion: '',
        duracion: '',
        precio: '',
        estado: 'activo',
        imagen: null
    };
    errors.value = {};
};

// 🆕 Crear nuevo servicio
const openNew = () => {
    isEditMode.value = false;
    resetForm();
    showFormDialog.value = true;
};

// ✏️ Editar servicio
const openEdit = (servicio) => {
    isEditMode.value = true;
    selectedServicio.value = servicio;

    initialValues.value = {
        id: servicio.id,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        duracion: servicio.duracion,
        precio: servicio.precio,
        estado: servicio.estado,
        imagen: null
    };

    showFormDialog.value = true;
};

// 📤 Guardar (crear o actualizar)
const onFormSubmit = async () => {
    const formData = new FormData();
    for (const key in initialValues.value) {
        if (initialValues.value[key] !== null) {
            formData.append(key, initialValues.value[key]);
        }
    }

    const exito = isEditMode.value ? await servicioStore.actualizarServicio(formData, selectedServicio.value.id) : await servicioStore.crearServicio(formData);

    if (exito) {
        showFormDialog.value = false;
        await servicioStore.ListaServicio();
        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Servicio guardado correctamente', life: 3000 });
    } else {
        toast.add({ severity: 'warn', summary: 'Validación', detail: 'Revisa los campos del formulario.', life: 3000 });
    }
};

/// ❌ Confirmar eliminación
const confirmDelete = (servicio) => {
    selectedServicio.value = servicio;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar
const deleteServicio = async () => {
    const success = await servicioStore.eliminarServicio(selectedServicio.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Servicio eliminado',
            detail: 'Se eliminó correctamente.',
            life: 3000
        });
        showDeleteDialog.value = false;
        selectedServicio.value = null;
        await servicioStore.ListaServicio();
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    await servicioStore.ListaServicio();
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar Servicio" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingServicios" />
                </template>
            </Toolbar>

            <!-- Tabla de servicios -->
            <DataTable :value="loadingServicios ? skeletonRows : servicios" :paginator="true" :rows="8" :filters="filters" :globalFilterFields="['nombre', 'descripcion', 'duracion', 'precio', 'estado']" tableStyle="min-width: 40rem">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Servicios</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <!-- Columnas -->
                <Column field="nombre" header="Nombre" />
                <Column field="descripcion" header="Descripción" />
                <Column field="duracion" header="Duración">
                    <template #body="slotProps"> {{ formatDuration(slotProps.data.duracion) }}</template>
                </Column>
                <Column field="precio" header="Precio">
                    <template #body="slotProps"> S/. {{ slotProps.data.precio }} </template>
                </Column>

                <Column field="estado" header="Estado">
                    <template #body="{ data }">
                        <Tag :value="data.servicio.estado" :severity="data.servicio.estado === 'activo' ? 'success' : 'danger'" />
                    </template>
                </Column>

                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog Formulario -->
        <Dialog v-model:visible="showFormDialog" modal header="Formulario de Servicio" :style="{ width: '30rem' }">
            <form @submit.prevent="onFormSubmit" class="flex flex-col gap-5 px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {{ isEditMode ? 'Editar Servicio' : 'Nuevo Servicio' }}
                </h2>

                <!-- Nombre -->
                <div>
                    <InputLabel for="nombre" value="Nombre" />
                    <InputText id="nombre" v-model="initialValues.nombre" class="w-full" />
                    <InputError class="mt-2" :message="errors.nombre ? errors.nombre.join(', ') : ''" />
                </div>

                <!-- Descripción -->
                <div>
                    <InputLabel for="descripcion" value="Descripción" />
                    <InputText id="descripcion" v-model="initialValues.descripcion" class="w-full" />
                    <InputError class="mt-2" :message="errors.descripcion ? errors.descripcion.join(', ') : ''" />
                </div>

                <!-- Duración -->
                <div>
                    <InputLabel for="duracion" value="Duración (minutos)" />
                    <InputText id="duracion" type="number" v-model="initialValues.duracion" class="w-full" min="0" />
                    <InputError class="mt-2" :message="errors.duracion ? errors.duracion.join(', ') : ''" />
                </div>

                <!-- Precio -->
                <div>
                    <InputLabel for="precio" value="Precio" />
                    <InputText id="precio" type="number" v-model="initialValues.precio" class="w-full" min="0" />
                    <InputError class="mt-2" :message="errors.precio ? errors.precio.join(', ') : ''" />
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

                <!-- Imagen -->
                <div>
                    <InputLabel for="imagen" value="Imagen" />
                    <input type="file" id="imagen" accept="image/*" class="w-full" @change="(e) => (initialValues.imagen = e.target.files[0])" />
                    <InputError class="mt-2" :message="errors.imagen ? errors.imagen.join(', ') : ''" />
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
                ¿Estás seguro de que deseas eliminar el servicio <strong>{{ selectedServicio?.nombre }}</strong
                >?
            </p>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deleteServicio" />
            </template>
        </Dialog>
    </div>
</template>
