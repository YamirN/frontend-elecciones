<script setup>
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref({
    email: '',
    password: '',
    rememberMe: false
});

const emailError = ref('');
const passwordError = ref('');
const loginError = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

// Validaciones
const validateEmail = () => {
    const email = loginForm.value.email;
    if (!email) {
        emailError.value = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.value = 'Correo electrónico inválido';
    } else {
        emailError.value = '';
    }
};

const validatePassword = () => {
    const password = loginForm.value.password;
    if (!password) {
        passwordError.value = 'La contraseña es requerida';
    } else if (password.length < 6) {
        passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
    } else {
        passwordError.value = '';
    }
};

const isFormValid = computed(() => {
    return loginForm.value.email && loginForm.value.password && !emailError.value && !passwordError.value;
});

const handleLogin = async () => {
    loginError.value = '';
    validateEmail();
    validatePassword();

    if (!isFormValid.value) return;

    isLoading.value = true;

    try {
        const success = await authStore.handleLogin(loginForm.value.email, loginForm.value.password);

        if (!success) {
            loginError.value = authStore.error || 'Credenciales incorrectas';
            return;
        }

        // Redirección según rol
        switch (authStore.rol) {
            case 'administrador':
                router.push('/admin/dashboard');
                break;
            case 'cliente':
                router.push('/cliente/home');

                break;
            case 'trabajador':
                router.push('/trabajador/dashboard');
                break;
            default:
                loginError.value = 'Rol de usuario no reconocido';
        }
    } catch (error) {
        loginError.value = 'Error al iniciar sesión';
    } finally {
        isLoading.value = false;
    }
};

const goToHome = () => {
    router.push('/');
};

const goToRegister = () => {
    router.push('/registrar');
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                    <i class="pi pi-user text-2xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">DejavuSpa</h1>
                <p class="text-gray-600">Bienvenido de vuelta</p>
            </div>

            <!-- Formulario -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <form @submit.prevent="handleLogin" class="space-y-6">
                    <!-- Email Field -->
                    <div>
                        <label for="email" class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                            <i class="pi pi-envelope mr-2 text-blue-500"></i>
                            Correo Electrónico
                        </label>
                        <InputText
                            id="email"
                            v-model="loginForm.email"
                            type="email"
                            placeholder="tu@email.com"
                            class="w-full"
                            :class="{ 'p-invalid': emailError }"
                            :pt="{
                                root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                            }"
                        />
                        <small v-if="emailError" class="text-red-500 mt-1 block">{{ emailError }}</small>
                    </div>

                    <!-- Password Field -->
                    <div>
                        <label for="password" class="flex items-center text-sm font-semibold text-gray-700 mb-2">
                            <i class="pi pi-lock mr-2 text-blue-500"></i>
                            Contraseña
                        </label>
                        <div class="relative">
                            <InputText
                                id="password"
                                v-model="loginForm.password"
                                :type="showPassword ? 'text' : 'password'"
                                placeholder="••••••••"
                                class="w-full pr-12"
                                :class="{ 'p-invalid': passwordError }"
                                :pt="{
                                    root: { class: 'border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg' }
                                }"
                            />
                            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                            </button>
                        </div>
                        <small v-if="passwordError" class="text-red-500 mt-1 block">{{ passwordError }}</small>
                    </div>

                    <!-- Forgot Password Link -->
                    <div class="text-right">
                        <button type="button" class="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors" @click="goToForgotPassword">¿Olvidaste tu contraseña?</button>
                    </div>

                    <!-- Error Message -->
                    <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div class="flex items-center">
                            <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                            <p class="text-red-700 text-sm">{{ loginError }}</p>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <Button
                        type="submit"
                        :loading="isLoading"
                        :disabled="isLoading || !loginForm.email || !loginForm.password"
                        class="w-full py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        :style="{
                            background: !isLoading && loginForm.email && loginForm.password ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : '#9ca3af',
                            color: 'white',
                            border: 'none',
                            minHeight: '56px'
                        }"
                    >
                        <i v-if="!isLoading" class="pi pi-sign-in mr-2"></i>
                        <i v-else class="pi pi-spin pi-spinner mr-2"></i>
                        {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                    </Button>
                </form>

                <!-- Divider -->
                <div class="flex items-center my-8">
                    <div class="flex-1 border-t border-gray-300"></div>
                    <span class="px-4 text-sm text-gray-500 bg-white">o</span>
                    <div class="flex-1 border-t border-gray-300"></div>
                </div>

                <!-- Register Link -->
                <div class="text-center">
                    <p class="text-gray-600">
                        ¿No tienes cuenta?
                        <button type="button" @click="goToRegister" class="text-blue-500 hover:text-blue-700 font-semibold transition-colors ml-1">Regístrate aquí</button>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-gray-500 text-sm">
                <p>Tu bienestar es nuestra prioridad</p>
            </div>
        </div>

        <!-- Botón Home -->
        <Button icon="pi pi-home" rounded outlined class="fixed top-6 left-6 z-20 bg-white hover:bg-gray-50 border-gray-300" @click="goToHome" v-tooltip.right="'Volver al inicio'" />

        <!-- Toast para notificaciones -->
        <Toast />
    </div>
</template>
