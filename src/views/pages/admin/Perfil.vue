<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue';
import { ref } from 'vue';

const authStore = useAuthStore();
const { user } = authStore;
const toast = useToast();

const form = ref({
    nombre: user.nombre,
    apellido: user.apellido,
    password: '',
    password_confirmation: ''
});

const errors = ref({});

// Detectar cambios para activar el botón

const loading = ref(false);
const validateForm = () => {
    errors.value = {};

    if (!form.value.nombre) {
        errors.value.nombre = 'El nombre es obligatorio';
    }
    if (!form.value.apellido) {
        errors.value.apellido = 'El apellido es obligatorio';
    }

    if (form.value.password) {
        if (form.value.password.length < 8) {
            errors.value.password = 'La contraseña debe tener al menos 8 caracteres';
        }
        if (form.value.password !== form.value.password_confirmation) {
            errors.value.password_confirmation = 'Las contraseñas no coinciden';
        }
    } else if (form.value.password_confirmation) {
        errors.value.password = 'Debes ingresar una contraseña';
    }
    return Object.keys(errors.value).length === 0;
};

const successMessage = ref('');
const errorMessage = ref('');
const guardarCambios = async () => {
    if (!validateForm()) return;

    loading.value = true;
    try {
        await authStore.actualizarPerfil(form.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente', life: 3000 });
        await authStore.fetchUser();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el perfil', life: 3000 });
        console.error(error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">Perfil del Administrador</h2>

        <!-- Campos no editables -->
        <div>
            <label class="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="text" :value="user.email" class="w-full mt-1 input-disabled" disabled />
        </div>

        <!-- Campos editables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input v-model="form.nombre" type="text" class="w-full mt-1 input" />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700">Apellido</label>
                <input v-model="form.apellido" type="text" class="w-full mt-1 input" />
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Nueva Contraseña (opcional)</label>
                <Password v-model="form.password" toggleMask class="w-full mt-1 input" inputClass="w-full" placeholder="••••••••" />
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                <Password v-model="form.password_confirmation" toggleMask class="w-full mt-1 input" inputClass="w-full" placeholder="••••••••" />
            </div>
        </div>

        <!-- Mensajes -->
        <p v-if="successMessage" class="text-green-600 font-medium">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-red-600 font-medium">{{ errorMessage }}</p>

        <!-- Botón -->
        <div class="text-right">
            <button @click="guardarCambios" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar cambios</button>
        </div>
    </div>
</template>

<style scoped>
.input {
    border: 1px solid #d1d5db;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 1rem;
}
.input-disabled {
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    color: #6b7280;
}
</style>
