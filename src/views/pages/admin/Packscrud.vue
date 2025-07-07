<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { usePackStore } from '@/stores/packStore';
import { useServicioStore } from '@/stores/servicioStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// States y Stores

const packStore = usePackStore();
const servicioStore = useServicioStore();

const { servicios } = storeToRefs(servicioStore);
const { packs, loading: loadingPacks, errors } = storeToRefs(packStore);

const selectedPack = ref(null);
const isEditMode = ref(false);
const showDetailDialog = ref(false);
const selectedDetailPack = ref(null);
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const filters = ref({ global: { value: '' } });
const skeletonRows = Array.from({ length: 8 }, () => ({}));
const toast = useToast();

const initialValues = ref({
    nombre: '',
    descripcion: '',
    precio_total: '',
    imagen: null,
    estado: 'activo',
    fecha_expiracion: '',
    servicios: [] // << servicios seleccionados con cantidad
});

// 🧼 Reset del formulario
const resetForm = () => {
    initialValues.value = {
        nombre: '',
        descripcion: '',
        precio_total: '',
        imagen: null,
        estado: 'activo',
        fecha_expiracion: '',
        servicios: []
    };
    errors.value = {};
};

// 🆕 Crear nuevo pack
const openNew = () => {
    isEditMode.value = false;
    resetForm();
    showFormDialog.value = true;
};

// ✏️ Editar pack
const openEdit = (pack) => {
    isEditMode.value = true;
    selectedPack.value = pack;

    initialValues.value = {
        id: pack.id,
        nombre: pack.nombre,
        descripcion: pack.descripcion,
        precio_total: pack.precio_total,
        estado: pack.estado,
        fecha_expiracion: pack.fecha_expiracion,
        servicios: pack.servicios.map((s) => ({
            servicio_id: s.id,
            cantidad: s.cantidad
        })),
        imagen: null // se carga nueva solo si el usuario la cambia
    };

    showFormDialog.value = true;
};

// Detalles pack
const openDetail = async (pack) => {
    const response = await packStore.obtenerPackPorId(pack.id);
    selectedDetailPack.value = response.data;
    showDetailDialog.value = true;
};

// 📤 Guardar (crear o actualizar)
const onFormSubmit = async () => {
    const formData = new FormData();

    for (const key in initialValues.value) {
        if (key === 'servicios') {
            formData.append('servicios', JSON.stringify(initialValues.value.servicios));
        } else if (initialValues.value[key] !== null) {
            formData.append(key, initialValues.value[key]);
        }
    }

    const exito = isEditMode.value ? await packStore.actualizarPack(formData, selectedPack.value.id) : await packStore.crearPack(formData);

    if (exito) {
        showFormDialog.value = false;
        await packStore.ListaPack();
        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Pack guardado correctamente', life: 3000 });
    } else {
        toast.add({ severity: 'warn', summary: 'Validación', detail: 'Revisa los campos del formulario.', life: 3000 });
    }
};

/// ❌ Confirmar eliminación
const confirmDelete = (pack) => {
    selectedPack.value = pack;
    showDeleteDialog.value = true;
};

// 🗑️ Eliminar
const deletePack = async () => {
    const success = await packStore.eliminarPack(selectedPack.value.id);
    if (success) {
        toast.add({
            severity: 'success',
            summary: 'pack eliminado',
            detail: 'Se eliminó correctamente.',
            life: 3000
        });
        showDeleteDialog.value = false;
        selectedPack.value = null;
        await packStore.ListaPack();
    }
};

// 🔄 Carga inicial
onMounted(async () => {
    await servicioStore.ListaServicio();
    await packStore.ListaPack();
});
</script>

<template>
    <div>
        <div class="card">
            <!-- Toolbar -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Agregar Pack" icon="pi pi-plus-circle" severity="secondary" class="mr-2" @click="openNew" :disabled="loadingPacks" />
                </template>
            </Toolbar>

            <!-- Tabla de packs -->
            <DataTable :value="loadingPacks ? skeletonRows : packs" :paginator="true" :rows="8" :filters="filters" :globalFilterFields="['nombre', 'descripcion', 'estado']" tableStyle="min-width: 40rem">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Packs</h4>
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

                <Column field="fecha_expiracion" header="Expira">
                    <template #body="slotProps">
                        {{ slotProps.data.fecha_expiracion }}
                    </template>
                </Column>

                <Column field="precio_total" header="Precio Total">
                    <template #body="slotProps"> S/. {{ slotProps.data.precio_total }} </template>
                </Column>

                <Column field="estado" header="Estado" />

                <Column header="Acciones" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2" @click="openDetail(slotProps.data)" />

                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="openEdit(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog Formulario -->
        <Dialog v-model:visible="showFormDialog" modal header="Formulario de Pack" :style="{ width: '40rem' }">
            <form @submit.prevent="onFormSubmit" class="flex flex-col gap-5 px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {{ isEditMode ? 'Editar Pack' : 'Nuevo Pack' }}
                </h2>

                <!-- Nombre -->
                <div>
                    <InputLabel for="nombre" value="Nombre" />
                    <InputText id="nombre" v-model="initialValues.nombre" class="w-full" />
                    <InputError class="mt-2" :message="errors.nombre?.join(', ')" />
                </div>

                <!-- Descripción -->
                <div>
                    <InputLabel for="descripcion" value="Descripción" />
                    <InputText id="descripcion" v-model="initialValues.descripcion" class="w-full" />
                    <InputError class="mt-2" :message="errors.descripcion?.join(', ')" />
                </div>

                <!-- Precio total -->
                <div>
                    <InputLabel for="precio_total" value="Precio Total" />
                    <InputText id="precio_total" type="number" v-model="initialValues.precio_total" class="w-full" min="0" />
                    <InputError class="mt-2" :message="errors.precio_total?.join(', ')" />
                </div>

                <!-- Fecha expiración -->
                <div>
                    <InputLabel for="fecha_expiracion" value="Fecha de expiración" />
                    <InputText id="fecha_expiracion" type="date" v-model="initialValues.fecha_expiracion" class="w-full" />
                    <InputError class="mt-2" :message="errors.fecha_expiracion?.join(', ')" />
                </div>

                <!-- Estado -->
                <div>
                    <InputLabel for="estado" value="Estado" />
                    <select id="estado" v-model="initialValues.estado" class="w-full p-2 border rounded">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    <InputError class="mt-2" :message="errors.estado?.join(', ')" />
                </div>

                <!-- Imagen -->
                <div>
                    <InputLabel for="imagen" value="Imagen" />
                    <input type="file" id="imagen" accept="image/*" class="w-full" @change="(e) => (initialValues.imagen = e.target.files[0])" />
                    <InputError class="mt-2" :message="errors.imagen?.join(', ')" />
                </div>

                <!-- Servicios incluidos -->
                <div class="border p-4 rounded bg-gray-50">
                    <h3 class="text-md font-semibold mb-2">Servicios del Pack</h3>
                    <div v-for="(item, index) in initialValues.servicios" :key="index" class="flex gap-2 items-center mb-2">
                        <select v-model="item.servicio_id" class="w-1/2 p-2 border rounded">
                            <option disabled value="">Selecciona servicio</option>
                            <option v-for="serv in servicios" :key="serv.id" :value="serv.id">
                                {{ serv.nombre }}
                            </option>
                        </select>

                        <input v-model.number="item.cantidad" type="number" min="1" placeholder="Cantidad" class="w-1/4 p-2 border rounded" />

                        <Button icon="pi pi-trash" severity="danger" text @click="initialValues.servicios.splice(index, 1)" />
                    </div>

                    <Button label="Agregar Servicio" icon="pi pi-plus" text @click="initialValues.servicios.push({ servicio_id: '', cantidad: 1 })" />
                    <InputError class="mt-2" :message="errors['servicios']?.join(', ')" />
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
                ¿Estás seguro de que deseas eliminar el servicio <strong>{{ selectedPack?.nombre }}</strong
                >?
            </p>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" @click="deletePack" />
            </template>
        </Dialog>

        <Dialog v-model:visible="showDetailDialog" modal header="Detalle del Pack" :style="{ width: '500px' }">
            <div v-if="selectedDetailPack" class="space-y-4">
                <div class="text-center">
                    <h3 class="text-xl font-bold text-gray-800">{{ selectedDetailPack.nombre }}</h3>
                    <p class="text-gray-600">{{ selectedDetailPack.descripcion }}</p>

                    <img v-if="selectedDetailPack.imagen_url" :src="selectedDetailPack.imagen_url" alt="Imagen del Pack" class="w-full h-48 object-cover rounded-lg mt-3" />
                </div>

                <div class="text-sm text-gray-700">
                    <p><strong>Precio total:</strong> S/. {{ selectedDetailPack.precio_total }}</p>
                    <p><strong>Fecha de expiración:</strong> {{ selectedDetailPack.fecha_expiracion }}</p>
                    <p><strong>Estado:</strong> {{ selectedDetailPack.estado }}</p>
                </div>

                <div>
                    <h4 class="text-base font-semibold text-gray-800 mb-2">Servicios incluidos:</h4>
                    <ul class="list-disc ml-6 text-sm text-gray-700 space-y-1">
                        <li v-for="(serv, index) in selectedDetailPack.servicios" :key="index">{{ serv.nombre }} (x{{ serv.cantidad }})</li>
                    </ul>
                </div>
            </div>

            <template #footer>
                <Button label="Cerrar" icon="pi pi-times" @click="showDetailDialog = false" />
            </template>
        </Dialog>
    </div>
</template>
