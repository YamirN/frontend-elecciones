<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
    if (!authStore.user) {
        await authStore.fetchUser();
    }
});
</script>

<template>
    <router-view :key="$route.fullPath" />
</template>

<style scoped></style>
