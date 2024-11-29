<script setup>
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStoreAdmin = useAuthStore();
const email = ref('');
const password = ref('');
const checked = ref(false);
const router = useRouter();

const handleLoginAdminstrador = async (email, password) => {
    const isAuthenticated = await authStoreAdmin.handleLoginAdmin(email, password);

    if (isAuthenticated) {
        router.push({ name: 'dashboard' });
    } else {

        alert('CREDENCIALES INCORRECTAS');  // Mensaje de error si `isAuthenticated` es falso
    }
};


</script>

<template>

    <div
        class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, blue 10%, rgba(33, 150, 243, 0) 30%)">

                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">

                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenido
                            Administrador </div>
                        <span class="text-muted-color font-medium">Inicia sesion para acceder al panel</span>
                    </div>
                    <form @submit.prevent="handleLoginAdminstrador(email, password)">
                        <div>
                            <label for="email"
                                class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo
                                Electronico</label>
                            <InputText id="email" type="text" placeholder="Email address"
                                class="w-full md:w-[30rem] mb-8" v-model="email" />


                            <label for="password"
                                class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                            <Password id="password" v-model="password" placeholder="Password" :toggleMask="true"
                                class="mb-4" fluid :feedback="false"></Password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">

                            </div>
                            <button type="submit"
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 flex items-center justify-center">
                                <span>Acceder</span>

                                <i class="pi pi-arrow-right ml-2 h-3 w-5"></i>
                            </button>
                        </div>
                    </form>
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
