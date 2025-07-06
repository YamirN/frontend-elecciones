<script setup>
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';
import Card from 'primevue/card';
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
                router.push('/cliente/dashboard');
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
    router.push('/register');
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card class="w-full max-w-md shadow-lg border-0">
            <template #header>
                <div class="text-center py-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
                    <div class="flex justify-center mb-4">
                        <i class="pi pi-heart text-3xl text-white"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-white">SerenitySpa</h1>
                    <p class="text-white mt-2">Bienvenido de vuelta</p>
                </div>
            </template>

            <template #content>
                <div class="p-6">
                    <form @submit.prevent="handleLogin" class="space-y-6">
                        <!-- Email -->
                        <div class="space-y-2">
                            <label for="email" class="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                            <div class="relative">
                                <i class="pi pi-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                                <InputText
                                    id="email"
                                    v-model="loginForm.email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    class="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    :class="{ 'border-red-500': emailError }"
                                />
                            </div>
                            <small v-if="emailError" class="text-red-500 text-xs">{{ emailError }}</small>
                        </div>

                        <!-- Password -->
                        <div class="space-y-2">
                            <label for="password" class="block text-sm font-semibold text-gray-700">Contraseña</label>
                            <div class="relative">
                                <i class="pi pi-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                                <InputText
                                    id="password"
                                    v-model="loginForm.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="••••••••"
                                    class="w-full pl-14 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    :class="{ 'border-red-500': passwordError }"
                                />
                                <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                                </button>
                            </div>
                            <small v-if="passwordError" class="text-red-500 text-xs">{{ passwordError }}</small>
                        </div>

                        <!-- Error -->
                        <p v-if="loginError" class="text-red-500 text-sm text-center">{{ loginError }}</p>

                        <!-- Botón -->
                        <Button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200" :disabled="isLoading">
                            <span v-if="!isLoading">Iniciar Sesión</span>
                            <span v-else class="flex items-center justify-center space-x-2">
                                <i class="pi pi-spin pi-spinner"></i>
                                <span>Iniciando...</span>
                            </span>
                        </Button>
                    </form>

                    <!-- Divider -->
                    <div class="flex items-center my-6">
                        <div class="flex-1 border-t border-gray-300"></div>
                        <span class="px-4 text-sm text-gray-500">o</span>
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>

                    <!-- Register Link -->
                    <div class="text-center">
                        <p class="text-gray-600 text-sm">
                            ¿No tienes cuenta?
                            <button type="button" @click="goToRegister" class="text-blue-500 hover:text-blue-600 hover:underline font-medium ml-1">Regístrate aquí</button>
                        </p>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Volver -->
        <Button icon="pi pi-home" rounded outlined class="fixed top-6 left-6 z-20" @click="goToHome" />
    </div>
</template>
