<script setup>
import { useAuthStore } from '@/stores/auth';
import { useClienteStore } from '@/stores/clienteStore';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const clienteStore = useClienteStore();
const authStore = useAuthStore();

// Form data
const form = ref({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password_confirmation: '',
    dni: '',
    telefono: ''
});

const isFormComplete = computed(() => {
    return Object.values(form.value).every((value) => value && value.toString().trim() !== '');
});

// Form state
const isLoading = ref(false);
const errors = ref({});

// Submit handler
const handleSubmit = async () => {
    errors.value = {};
    isLoading.value = true;

    const success = await clienteStore.registerCliente(form.value);

    if (success) {
        const loginSuccess = await authStore.handleLogin(form.value.email, form.value.password);

        if (loginSuccess) {
            toast.add({
                severity: 'success',
                summary: '¡Cuenta creada!',
                detail: 'Bienvenido. Redirigiendo al panel...',
                life: 3000
            });

            router.push({ name: 'clienteDashboard' });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Registro exitoso pero no se pudo iniciar sesión',
                detail: 'Inicia sesión manualmente.',
                life: 5000
            });

            router.push({ name: 'login' });
        }
    } else {
        errors.value = clienteStore.errors;

        toast.add({
            severity: 'error',
            summary: 'Error al crear cuenta',
            detail: 'Corrige los errores del formulario.',
            life: 5000
        });
    }

    isLoading.value = false;
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                    <i class="pi pi-user-plus text-2xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">Únete a DejavuSpa</h1>
                <p class="text-gray-600">Crea tu cuenta y comienza tu viaje de bienestar</p>
            </div>

            <!-- Formulario -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Nombres -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <i class="pi pi-user mr-2 text-blue-500"></i>
                                Nombre
                            </label>
                            <InputText
                                v-model="form.nombre"
                                placeholder="Tu nombre"
                                class="w-full"
                                :class="{ 'p-invalid': errors.nombre }"
                                :pt="{
                                    root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <small v-if="errors.nombre" class="text-red-500 mt-1 block">{{ errors.nombre[0] }}</small>
                        </div>

                        <div>
                            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <i class="pi pi-user mr-2 text-blue-500"></i>
                                Apellido
                            </label>
                            <InputText
                                v-model="form.apellido"
                                placeholder="Tu apellido"
                                class="w-full"
                                :class="{ 'p-invalid': errors.apellido }"
                                :pt="{
                                    root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <small v-if="errors.apellido" class="text-red-500 mt-1 block">{{ errors.apellido[0] }}</small>
                        </div>
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                            <i class="pi pi-envelope mr-2 text-blue-500"></i>
                            Correo Electrónico
                        </label>
                        <InputText
                            v-model="form.email"
                            type="email"
                            placeholder="tu@email.com"
                            class="w-full"
                            :class="{ 'p-invalid': errors.email }"
                            :pt="{
                                root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                            }"
                        />
                        <small v-if="errors.email" class="text-red-500 mt-1 block">{{ errors.email[0] }}</small>
                    </div>

                    <!-- DNI y Teléfono -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <i class="pi pi-id-card mr-2 text-blue-500"></i>
                                DNI
                            </label>
                            <InputText
                                v-model="form.dni"
                                placeholder="12345678"
                                maxlength="8"
                                class="w-full"
                                :class="{ 'p-invalid': errors.dni }"
                                :pt="{
                                    root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <small v-if="errors.dni" class="text-red-500 mt-1 block">{{ errors.dni[0] }}</small>
                        </div>

                        <div>
                            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <i class="pi pi-phone mr-2 text-blue-500"></i>
                                Teléfono
                            </label>
                            <InputText
                                v-model="form.telefono"
                                placeholder="987654321"
                                maxlength="9"
                                class="w-full"
                                :class="{ 'p-invalid': errors.telefono }"
                                :pt="{
                                    root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <small v-if="errors.telefono" class="text-red-500 mt-1 block">{{ errors.telefono[0] }}</small>
                        </div>
                    </div>

                    <!-- Contraseñas -->
                    <div class="space-y-4">
                        <div>
                            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <i class="pi pi-lock mr-2 text-blue-500"></i>
                                Contraseña
                            </label>
                            <Password
                                v-model="form.password"
                                placeholder="Crea una contraseña segura"
                                :feedback="true"
                                toggleMask
                                class="w-full"
                                :class="{ 'p-invalid': errors.password }"
                                :pt="{
                                    root: { class: 'w-full' },
                                    input: { class: 'w-full border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <small v-if="errors.password" class="text-red-500 mt-1 block">{{ errors.password[0] }}</small>
                        </div>

                        <div>
                            <label class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <i class="pi pi-lock mr-2 text-blue-500"></i>
                                Confirmar Contraseña
                            </label>
                            <Password
                                v-model="form.password_confirmation"
                                placeholder="Repite tu contraseña"
                                :feedback="false"
                                toggleMask
                                class="w-full"
                                :class="{ 'p-invalid': errors.password_confirmation }"
                                :pt="{
                                    root: { class: 'w-full' },
                                    input: { class: 'w-full border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <small v-if="errors.password_confirmation" class="text-red-500 mt-1 block">{{ errors.password_confirmation[0] }}</small>
                        </div>
                    </div>

                    <!-- Botón de registro -->
                    <Button
                        type="submit"
                        :loading="isLoading"
                        :disabled="!isFormComplete || isLoading"
                        class="w-full py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        :style="{
                            background: isFormComplete ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : '#9ca3af',
                            color: 'white',
                            border: 'none',
                            minHeight: '56px'
                        }"
                    >
                        <i class="pi pi-user-plus mr-2"></i>
                        {{ isLoading ? 'Creando cuenta...' : '✨ Crear mi cuenta' }}
                    </Button>

                    <!-- Link a login -->
                    <div class="text-center pt-4 border-t border-gray-200">
                        <p class="text-gray-600">
                            ¿Ya tienes una cuenta?
                            <router-link to="/login" class="text-blue-500 hover:text-blue-700 font-semibold transition-colors"> Inicia sesión aquí </router-link>
                        </p>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-gray-500 text-sm">
                <p>Al registrarte, te unes a miles de personas que confían en DejavuSpa</p>
            </div>
        </div>

        <!-- Toast para notificaciones -->
        <Toast />
    </div>
</template>

<style scoped>
.p-invalid {
    border-color: #ef4444 !important;
}

.bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-50 {
    --tw-gradient-from: #eff6ff;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(239, 246, 255, 0));
}

.to-purple-100 {
    --tw-gradient-to: #e9d5ff;
}

.from-blue-500 {
    --tw-gradient-from: #3b82f6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
}

.to-purple-500 {
    --tw-gradient-to: #8b5cf6;
}

.from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-purple-600 {
    --tw-gradient-to: #7c3aed;
}
</style>
