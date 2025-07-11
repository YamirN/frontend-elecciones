<script setup>
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref, watch } from 'vue';

const toast = useToast();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Formulario reactivo y errores
const loading = ref(false);
const editableData = reactive({
    nombre: '',
    apellido: '',
    password: '',
    password_confirmation: ''
});
const errors = reactive({
    nombre: '',
    apellido: '',
    password: '',
    password_confirmation: ''
});

// Poblamos editableData UNA VEZ al montar, con el user ya disponible
onMounted(() => {
    editableData.nombre = user.value?.nombre ?? '';
    editableData.apellido = user.value?.apellido ?? '';
});

// Si por alguna razón el user cambia globalmente, también refrescamos
watch(user, (u) => {
    editableData.nombre = u?.nombre ?? '';
    editableData.apellido = u?.apellido ?? '';
});

// Detectar cambios para activar el botón
const hasChanges = computed(() => {
    return editableData.nombre.trim() !== (user.value?.nombre ?? '') || editableData.apellido.trim() !== (user.value?.apellido ?? '') || editableData.password.length > 0;
});

// Validación
const validateForm = () => {
    errors.nombre = '';
    errors.apellido = '';
    errors.password = '';
    errors.password_confirmation = '';
    let isValid = true;

    if (!editableData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido';
        isValid = false;
    } else if (editableData.nombre.trim().length > 100) {
        errors.nombre = 'El nombre no puede exceder 100 caracteres';
        isValid = false;
    }

    if (!editableData.apellido.trim()) {
        errors.apellido = 'El apellido es requerido';
        isValid = false;
    } else if (editableData.apellido.trim().length > 100) {
        errors.apellido = 'El apellido no puede exceder 100 caracteres';
        isValid = false;
    }

    if (editableData.password) {
        if (editableData.password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
            isValid = false;
        }
        if (editableData.password !== editableData.password_confirmation) {
            errors.password_confirmation = 'Las contraseñas no coinciden';
            isValid = false;
        }
    } else if (editableData.password_confirmation) {
        errors.password = 'Debes ingresar una contraseña';
        isValid = false;
    }

    return isValid;
};

const goBack = () => {
    router.back();
};

// Guardar cambios
const saveChanges = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Corrige los errores.', life: 3000 });
        return;
    }

    loading.value = true;
    const payload = {
        nombre: editableData.nombre.trim(),
        apellido: editableData.apellido.trim()
    };
    if (editableData.password) {
        payload.password = editableData.password;
        payload.password_confirmation = editableData.password_confirmation;
    }

    const result = await authStore.actualizarPerfil(payload);
    if (result.success) {
        toast.add({ severity: 'success', summary: '¡Listo!', detail: result.message, life: 3000 });
        editableData.password = '';
        editableData.password_confirmation = '';
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: result.message, life: 3000 });
    }
    loading.value = false;
};

// Resetear formulario
const resetForm = () => {
    editableData.nombre = user.value?.nombre ?? '';
    editableData.apellido = user.value?.apellido ?? '';
    editableData.password = '';
    editableData.password_confirmation = '';
    Object.keys(errors).forEach((k) => (errors[k] = ''));
};
</script>

<template>
    <div class="user-profile">
        <Card class="profile-card">
            <template #title>
                <div class="flex items-center justify-between px-4 pt-4">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-user text-2xl" />
                        <span class="text-lg font-semibold">Perfil de Usuario</span>
                    </div>
                    <!-- Botón Volver -->
                    <Button label="Volver" icon="pi pi-arrow-left" text @click="goBack" class="!text-gray-600 hover:!text-gray-800" />
                </div>
            </template>

            <template #content>
                <div v-if="user" class="profile-content">
                    <!-- Información de solo lectura -->
                    <div class="field-group mb-4">
                        <h3 class="section-title">Información Personal</h3>

                        <div class="field">
                            <label for="email" class="field-label">Correo Electrónico</label>
                            <InputText id="email" v-model="user.email" readonly class="w-full readonly-field" :pt="{ root: { class: 'bg-gray-50' } }" />
                        </div>
                        <div class="field">
                            <label for="dni" class="field-label">DNI</label>
                            <InputText id="dni" v-model="user.modelo.dni" readonly class="w-full readonly-field" :pt="{ root: { class: 'bg-gray-50' } }" />
                        </div>
                    </div>

                    <!-- Campos editables -->
                    <div class="field-group">
                        <h3 class="section-title">Editar Información</h3>

                        <div class="field">
                            <label for="nombre" class="field-label">Nombre *</label>
                            <InputText id="nombre" v-model="editableData.nombre" class="w-full" :class="{ 'p-invalid': errors.nombre }" placeholder="Ingresa tu nombre" maxlength="100" />
                            <small v-if="errors.nombre" class="p-error">{{ errors.nombre }}</small>
                        </div>

                        <div class="field">
                            <label for="apellido" class="field-label">Apellido *</label>
                            <InputText id="apellido" v-model="editableData.apellido" class="w-full" :class="{ 'p-invalid': errors.apellido }" placeholder="Ingresa tu apellido" maxlength="100" />
                            <small v-if="errors.apellido" class="p-error">{{ errors.apellido }}</small>
                        </div>

                        <Divider />

                        <div class="password-section">
                            <h4 class="subsection-title">Cambiar Contraseña (Opcional)</h4>

                            <div class="field">
                                <label for="password" class="field-label">Nueva Contraseña</label>
                                <Password id="password" v-model="editableData.password" class="w-full" :class="{ 'p-invalid': errors.password }" placeholder="Nueva contraseña (opcional)" :feedback="true" toggleMask />
                                <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                            </div>

                            <div class="field">
                                <label for="password_confirmation" class="field-label">Confirmar Nueva Contraseña</label>
                                <Password
                                    id="password_confirmation"
                                    v-model="editableData.password_confirmation"
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.password_confirmation }"
                                    placeholder="Confirmar nueva contraseña"
                                    :feedback="false"
                                    toggleMask
                                />
                                <small v-if="errors.password_confirmation" class="p-error">{{ errors.password_confirmation }}</small>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="action-buttons">
                        <Button label="Guardar Cambios" icon="pi pi-save" @click="saveChanges" :loading="loading" :disabled="!hasChanges" class="p-button-success" />
                        <Button label="Cancelar" icon="pi pi-times" @click="resetForm" :disabled="loading" class="p-button-secondary" outlined />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Toast para notificaciones -->
        <Toast />
    </div>
</template>

<style scoped>
.user-profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
}

.profile-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.field-group {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fafafa;
}

.section-title {
    margin: 0 0 1rem 0;
    color: #374151;
    font-size: 1.1rem;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
}

.subsection-title {
    margin: 0 0 1rem 0;
    color: #4b5563;
    font-size: 1rem;
    font-weight: 500;
}

.password-section {
    margin-top: 1rem;
}

.field {
    margin-bottom: 1rem;
}

.field:last-child {
    margin-bottom: 0;
}

.field-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
}

.readonly-field {
    background-color: #f9fafb !important;
    color: #6b7280 !important;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.p-error {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
    }

    .field-group {
        padding: 1rem;
    }
}
</style>
