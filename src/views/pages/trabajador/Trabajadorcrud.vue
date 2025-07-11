<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { useTrabajadorStore } from '@/stores/trabajadorStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// States y Stores

const trabajadorStore = useTrabajadorStore();
const { trabajadores, loading: loadingTrabajadores, errors } = storeToRefs(trabajadorStore);

const selectedTrabajador = ref(null);
const isEditMode = ref(false);
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));
const toast = useToast();

const formatHour = (hora) => hora?.slice(0, 5) || '';
const timeStringToDate = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
};
const formatTimeHHMM = (value) => {
    if (typeof value === 'string' && value.match(/^\d{2}:\d{2}$/)) {
        return value; // Ya está formateado
    }

    if (value instanceof Date) {
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    return ''; // fallback
};

const initialValues = ref({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    descripcion: '',
    telefono: '',
    horario_inicio: '',
    hora_fin: ''
});

// 🧼 Reset del formulario
const resetForm = () => {
    initialValues.value = {
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        descripcion: '',
        telefono: '',
        horario_inicio: '',
        hora_fin: '',
        estado: 'activo'
    };
    errors.value = {};
};

// 🆕 Crear nuevo trabajador
const openNew = () => {
    isEditMode.value = false;
    resetForm();
    showFormDialog.value = true;
};

// ✏️ Editar trabajador
const openEdit = (trabajador) => {
    isEditMode.value = true;
    selectedTrabajador.value = trabajador;

    initialValues.value = {
        id: trabajador.id,
        nombre: trabajador.user?.nombre ?? '',
        apellido: trabajador.user?.apellido ?? '',
        email: trabajador.user?.email ?? '',
        dni: trabajador.dni,
        descripcion: trabajador.descripcion,
        telefono: trabajador.telefono,
        horario_inicio: timeStringToDate(trabajador.horario_inicio),
        hora_fin: timeStringToDate(trabajador.hora_fin),
        estado: trabajador.user.estado,
        password: '' // opcional para editar
    };

    showFormDialog.value = true;
};

// 📤 Guardar (crear o actualizar)
const onFormSubmit = async () => {
    const formData = new FormData();

    if (initialValues.value.horario_inicio) {
        formData.append('horario_inicio', formatTimeHHMM(initialValues.value.horario_inicio));
    }

    formData.append('horario_inicio', formatTimeHHMM(initialValues.value.horario_inicio));
    formData.append('hora_fin', formatTimeHHMM(initialValues.value.hora_fin));

    for (const key in initialValues.value) {
        if (['horario_inicio', 'hora_fin'].includes(key)) continue;
        if (initialValues.value[key] !== null && initialValues.value[key] !== undefined) {
            formData.append(key, initialValues.value[key]);
        }
    }

    const exito = isEditMode.value ? await trabajadorStore.actualizarTrabajador(formData, selectedTrabajador.value.id) : await trabajadorStore.crearTrabajador(formData);

    if (exito) {
        showFormDialog.value = false;
        await trabajadorStore.ListaTrabajador();
        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Trabajador guardado correctamente', life: 3000 });
    } else {
        toast.add({ severity: 'warn', summary: 'Validación', detail: 'Revisa los campos del formulario.', life: 3000 });
    }
};

/// ❌ Confirmar eliminación
const confirmDelete = (trabajador) => {
    selectedTrabajador.value = trabajador;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar
const deleteTrabajador = async () => {
    const success = await trabajadorStore.eliminarTrabajador(selectedTrabajador.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Trabajador eliminado',
            detail: 'Se eliminó correctamente.',
            life: 3000
        });
        showDeleteDialog.value = false;
        selectedTrabajador.value = null;
        await trabajadorStore.ListaTrabajador();
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    await trabajadorStore.ListaTrabajador();
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar Trabajador" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingTrabajadores" />
                </template>
            </Toolbar>

            <!-- Tabla de trabajador -->
            <DataTable :value="loadingTrabajadores ? skeletonRows : trabajadores" :paginator="true" :rows="8" :filters="filters" :globalFilterFields="['user.nombre', 'user.apellido', 'dni', 'telefono', 'descripcion']" tableStyle="min-width: 40rem">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Trabajadores</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column header="Nombre">
                    <template #body="slotProps"> {{ slotProps.data.user?.nombre }} {{ slotProps.data.user?.apellido }} </template>
                </Column>

                <Column field="dni" header="DNI" />
                <Column field="telefono" header="Teléfono" />
                <Column field="descripcion" header="Descripción" />

                <Column header="Horario">
                    <template #body="slotProps"> {{ formatHour(slotProps.data.horario_inicio) }} - {{ formatHour(slotProps.data.hora_fin) }} </template>
                </Column>

                <Column header="Email">
                    <template #body="slotProps">
                        {{ slotProps.data.user?.email }}
                    </template>
                </Column>

                <Column field="estado" header="Estado">
                    <template #body="{ data }">
                        <Tag :value="data.user.estado" :severity="data.user.estado === 'activo' ? 'success' : 'danger'" />
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
        <Dialog v-model:visible="showFormDialog" modal header="Formulario de Trabajador" :style="{ width: '30rem' }">
            <form @submit.prevent="onFormSubmit" class="flex flex-col gap-5 px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {{ isEditMode ? 'Editar Trabajador' : 'Nuevo Trabajador' }}
                </h2>

                <!-- Nombre -->
                <div>
                    <InputLabel for="nombre" value="Nombre" />
                    <InputText id="nombre" v-model="initialValues.nombre" class="w-full" />
                    <InputError class="mt-2" :message="errors.nombre?.join(', ')" />
                </div>

                <!-- Apellido -->
                <div>
                    <InputLabel for="apellido" value="Apellido" />
                    <InputText id="apellido" v-model="initialValues.apellido" class="w-full" />
                    <InputError class="mt-2" :message="errors.apellido?.join(', ')" />
                </div>

                <!-- Email -->
                <div>
                    <InputLabel for="email" value="Correo electrónico" />
                    <InputText id="email" type="email" v-model="initialValues.email" class="w-full" />
                    <InputError class="mt-2" :message="errors.email?.join(', ')" />
                </div>

                <!-- DNI -->
                <div>
                    <InputLabel for="dni" value="DNI" />
                    <InputText id="dni" v-model="initialValues.dni" class="w-full" />
                    <InputError class="mt-2" :message="errors.dni?.join(', ')" />
                </div>

                <!-- Teléfono -->
                <div>
                    <InputLabel for="telefono" value="Teléfono" />
                    <InputText id="telefono" v-model="initialValues.telefono" class="w-full" />
                    <InputError class="mt-2" :message="errors.telefono?.join(', ')" />
                </div>

                <!-- Descripción -->
                <div>
                    <InputLabel for="descripcion" value="Descripción" />
                    <InputText id="descripcion" v-model="initialValues.descripcion" class="w-full" />
                    <InputError class="mt-2" :message="errors.descripcion?.join(', ')" />
                </div>

                <!-- Horario de inicio -->
                <div>
                    <InputLabel for="horario_inicio" value="Horario de inicio" />
                    <Calendar v-model="initialValues.horario_inicio" timeOnly hourFormat="24" placeholder="Inicio (HH:MM)" showIcon iconDisplay="input" class="w-full" />
                    <InputError class="mt-2" :message="errors.horario_inicio?.join(', ')" />
                </div>

                <!-- Horario de fin -->
                <div>
                    <InputLabel for="hora_fin" value="Horario de fin" />
                    <Calendar v-model="initialValues.hora_fin" timeOnly hourFormat="24" placeholder="Fin (HH:MM)" showIcon iconDisplay="input" class="w-full" />
                    <InputError class="mt-2" :message="errors.hora_fin?.join(', ')" />
                </div>

                <div v-if="isEditMode">
                    <InputLabel for="estado" value="Estado" />
                    <select id="estado" v-model="initialValues.estado" class="w-full p-2 border rounded">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    <InputError class="mt-2" :message="errors.estado?.join(', ')" />
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
                ¿Estás seguro de que deseas eliminar el trabajador <strong>{{ selectedTrabajador?.nombre }}</strong
                >?
            </p>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deleteTrabajador" />
            </template>
        </Dialog>
    </div>
</template>
