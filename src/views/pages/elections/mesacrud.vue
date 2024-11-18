<script setup>
import InputError from '@/components/InputError.vue';
import InputLabel from '@/components/InputLabel.vue';
import { useMesaSufragioStore } from '@/stores/mesaSufragioStore';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const mesaStore = useMesaSufragioStore();
const toast = useToast();
const filters = ref({ global: { value: '' } });
const mesaCreateDialog = ref(false);
const deleteMesaDialog = ref(false);
const selectedMesa = ref(null);
const errors = computed(() => mesaStore.errors);

const form = ref({
    nombre: '',
});

const openNew = () => {
    form.value = {
        nombre: '',
    };
    mesaCreateDialog.value = true;
};


const confirmDeleteMesa = (Mesa) => {
    selectedMesa.value = Mesa;
    deleteMesaDialog.value = true;

};

const createAMesa = async () => {

    const createSuccess = await mesaStore.addMesa(form.value);
    if (createSuccess) {
        mesaCreateDialog.value = false;
        form.value = {
            nombre: '',
        };
        toast.add({
            severity: 'success',
            summary: 'Candidato creado',
            detail: 'El candidato ha sido creado correctamente',
            life: 3000,
        });
    }

};


const deleteMesa = async () => {
    if (selectedMesa.value) {
        const success = await mesaStore.removeMesa(selectedMesa.value.id);
        if (!success) {
            toast.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'La mesa ha sido eliminado correctamente',
                life: 3000,
            });
        }
        // Ocultar modal después de eliminar
        deleteMesaDialog.value = false;
        selectedMesa.value = null;
    }
};

const handleSave = () => {

    createAMesa();

};


onMounted(() => {
    mesaStore.getMesas();
});
</script>

<template>
    <div>

        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar Mesa" icon="pi pi-plus-circle" severity="secondary" class="mr-2"
                        @click="openNew" />
                </template>


            </Toolbar>

            <DataTable :value="mesaStore.mesas" :paginator="true" :rows="8" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                tableStyle="min-width: 40rem"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} mesas">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Administrar Mesas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column field="nombre" header="Mesa" style="width: 75%"></Column>

                <Column :exportable="false" style="min-width: 12rem" header="Acciones">
                    <template #body="slotProps">

                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteMesa(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="mesaCreateDialog" :modal="true" :style="{ width: '30rem' }" :closable="false">
            <div class="flex flex-col gap-5 px-3">
                <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Detalles de la Mesa</h2>
                <div class="mb-1">

                </div>
                <div>
                    <InputLabel for="nombre" value="Mesa" />

                    <InputText class="mt-1 block w-full" v-model="form.nombre" :invalid="!!errors.name" />
                    <InputError class="mt-2" :message="errors.nombre ? errors.nombre.join(', ') : ''" />

                </div>

            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="mesaCreateDialog = false" />
                <Button label="Save" class="custom-cancel-button" text icon="pi pi-check" @click="handleSave" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteMesaDialog" :style="{ width: '450px', textColor: '#ffebee' }" header="Confirmar"
            :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl " style="color: red" />
                <span class="text-red-500" v-if="selectedMesa">Estas seguro que quieres eliminar a <b>{{
                    selectedMesa.nombre
                        }} </b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="deleteMesaDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteMesa" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>
