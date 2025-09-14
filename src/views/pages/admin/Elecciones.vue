<script setup>
import { formatDateForApi } from '@/service/utils/dateUtil';
import { useAuthStore } from '@/stores/auth';
import { useEleccionStore } from '@/stores/eleccionesStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// States y Stores
const eleccionStore = useEleccionStore();
const authStore = useAuthStore();
const { elecciones, loading: loadingElecciones } = storeToRefs(eleccionStore);
const selectedEleccion = ref(null);
const isEditMode = ref(false);
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const toast = useToast();
const errors = ref({});
const filters = ref({ global: { value: '' } });

// 🧾 Valores iniciales del formulario
const initialValues = ref({
    nombre_eleccion: '',
    estado: 'pendiente',
    fecha_inicio: '',
    fecha_fin: null
});

// 🧼 Reset del formulario
const resetForm = () => {
    initialValues.value = {
        nombre_eleccion: '',
        estado: 'pendiente',
        fecha_inicio: '',
        fecha_fin: null
    };
    errors.value = {};
};

// 🆕 Crear nueva elección
const openNew = () => {
    isEditMode.value = false;
    resetForm();
    showFormDialog.value = true;
};

const getEstadoLabel = (estado) => {
    if (estado === 'pendiente') return 'Iniciar';
    if (estado === 'en_proceso') return 'Finalizar';
    return 'Finalizada';
};

const getEstadoIcon = (estado) => {
    if (estado === 'pendiente') return 'pi pi-play';
    if (estado === 'en_proceso') return 'pi pi-stop';
    return 'pi pi-check';
};

const cambiarEstado = async (eleccion) => {
    try {
        const nuevoEstado = eleccion.estado === 'pendiente' ? 'en_proceso' : eleccion.estado === 'en_proceso' ? 'finalizada' : null;

        if (!nuevoEstado) return;

        await eleccionStore.cambiarEstado(eleccion.id, nuevoEstado);

        toast.add({
            severity: 'success',
            summary: 'Estado actualizado',
            detail: `Nuevo estado: ${nuevoEstado}`,
            life: 3000
        });

        await eleccionStore.ListaEleccion();
    } catch (error) {
        const mensajeGeneral = error.response?.data?.message || 'Error al cambiar estado';
        const errores = error.response?.data?.errors;
        const mensajeDetalles = errores ? Object.values(errores).flat().join(', ') : 'Ocurrió un error inesperado';

        toast.add({
            severity: 'error',
            summary: mensajeGeneral,
            detail: mensajeDetalles,
            life: 5000
        });

        console.error('Error al cambiar estado:', error);
    }
};

// ✅ Envío del formulario
const handleSave = async () => {
    if (!initialValues.value.nombre_eleccion || !initialValues.value.fecha_inicio || !initialValues.value.estado) {
        errors.value = {
            nombre_eleccion: !initialValues.value.nombre_eleccion ? 'El nombre es obligatorio' : null,
            fecha_inicio: !initialValues.value.fecha_inicio ? 'La fecha de inicio es obligatoria' : null,
            estado: !initialValues.value.estado ? 'El estado es obligatorio' : null
        };
        return;
    }
    const payload = {
        ...initialValues.value,
        fecha_inicio: formatDateForApi(initialValues.value.fecha_inicio)
    };

    try {
        await eleccionStore.crearEleccion(payload);

        toast.add({
            severity: 'success',
            summary: 'Elección creada',
            detail: 'La operación fue exitosa.',
            life: 3000
        });

        showFormDialog.value = false;
        selectedEleccion.value = null;
        await eleccionStore.ListaEleccion();
    } catch (error) {
        if (error.response?.status === 422) {
            errors.value = error.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error al guardar la elección.',
                life: 3000
            });
        }
    }
};

// ❌ Confirmar eliminación
const confirmDeleteEleccion = (eleccion) => {
    selectedEleccion.value = eleccion;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar elección
const deleteEleccion = async () => {
    const success = await eleccionStore.eliminarEleccion(selectedEleccion.value.id);

    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Elección eliminada',
            detail: 'Se eliminó correctamente',
            life: 3000
        });

        showDeleteDialog.value = false;
        selectedEleccion.value = null;

        await eleccionStore.ListaEleccion();
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    await eleccionStore.ListaEleccion();
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar superior -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar Eleccion" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingElecciones" />
                </template>
            </Toolbar>

            <DataTable
                :value="elecciones"
                :paginator="true"
                :rows="8"
                :filters="filters"
                :globalFilterFields="['nombre', 'estado']"
                dataKey="id"
                stripedRows
                responsiveLayout="scroll"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} elecciones"
                class="rounded-2xl shadow-sm border border-gray-200"
            >
                <!-- CABECERA -->
                <template #header>
                    <div class="flex flex-wrap gap-3 items-center justify-between p-3 bg-gray-50 rounded-t-2xl">
                        <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2"><i class="pi pi-cog text-blue-500"></i> Administrar Elecciones</h3>

                        <IconField class="w-full md:w-64">
                            <InputIcon>
                                <i class="pi pi-search text-gray-400" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar elecciones..." class="w-full rounded-lg" />
                        </IconField>
                    </div>
                </template>

                <!-- COLUMNA: Nombre -->
                <Column header="Nombre" style="width: 30%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingElecciones" height="1rem" width="80%" />
                        <span v-else class="font-medium text-gray-800">{{ slotProps.data.nombre }}</span>
                    </template>
                </Column>

                <!-- COLUMNA: Fecha Inicio -->
                <Column header="Fecha Inicio" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingElecciones" height="1rem" width="60%" />
                        <span v-else class="text-gray-600">{{ slotProps.data.fecha_inicio }}</span>
                    </template>
                </Column>

                <!-- COLUMNA: Estado -->
                <Column header="Estado" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingElecciones" height="1rem" width="60%" />
                        <span
                            v-else
                            :class="[
                                'px-3 py-1 text-sm font-semibold rounded-md',
                                slotProps.data.estado === 'en_proceso' ? 'bg-green-100 text-green-700' : slotProps.data.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
                            ]"
                        >
                            {{ slotProps.data.estado }}
                        </span>
                    </template>
                </Column>

                <!-- COLUMNA: Total Votos -->
                <Column header="Total de Votos" style="width: 20%">
                    <template #body="slotProps">
                        <Skeleton v-if="loadingElecciones" height="1rem" width="50%" />
                        <span v-else class="text-gray-800">{{ slotProps.data.total_votos }}</span>
                    </template>
                </Column>

                <Column header="Acciones" style="min-width: 16rem" bodyClass="flex gap-2">
                    <template #body="slotProps">
                        <template v-if="loadingElecciones">
                            <Skeleton shape="circle" size="2rem" class="mr-2" />
                            <Skeleton shape="circle" size="2rem" />
                        </template>
                        <template v-else>
                            <!-- Botón cambiar estado -->
                            <Button
                                :icon="getEstadoIcon(slotProps.data.estado)"
                                :label="getEstadoLabel(slotProps.data.estado)"
                                class="p-button-sm"
                                :disabled="slotProps.data.estado === 'finalizada'"
                                @click="cambiarEstado(slotProps.data)"
                                severity="info"
                            />

                            <!-- Botón eliminar -->
                            <Button v-if="authStore.can('eliminar eleccion')" icon="pi pi-trash" label="Eliminar" class="p-button-sm" @click="confirmDeleteEleccion(slotProps.data)" severity="danger" />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Diálogo Crear  -->
        <Dialog v-model:visible="showFormDialog" modal header="Elección" :style="{ width: '500px' }">
            <div class="mb-4">
                <label for="nombre_eleccion" class="block font-medium mb-1">Nombre de la Elección</label>
                <input id="nombre_eleccion" type="text" v-model="initialValues.nombre_eleccion" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors?.nombre" />
            </div>

            <div class="mb-4">
                <label for="fecha_inicio" class="block font-medium mb-1">Fecha de Inicio</label>
                <input id="fecha_inicio" type="date" v-model="initialValues.fecha_inicio" class="w-full border border-gray-300 rounded px-3 py-2" />
                <InputError :message="errors.fecha_inicio?.join(', ')" />
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200" @click="showFormDialog = false">Cancelar</button>
                <button type="button" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700" @click="handleSave">Guardar</button>
            </div>
        </Dialog>

        <Dialog v-model:visible="showDeleteDialog" :style="{ width: '450px' }" header="Confirmar Eliminación" :modal="true">
            <div class="flex items-center gap-4 px-2 py-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500" />
                <span class="text-red-600">
                    ¿Estás seguro de que deseas eliminar la eleccion
                    <b>{{ selectedEleccion?.nombre }}</b
                    >?
                </span>
            </div>

            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deleteEleccion" :disabled="selectedEleccion?.estado === 'en_proceso'" />
            </template>
        </Dialog>
    </div>
</template>
