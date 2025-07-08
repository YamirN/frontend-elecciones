<script setup>
// const authStore = useAuthStore();

// onMounted(async () => {
//     if (!authStore.user) {
//         await authStore.fetchUser();
//     }
// });
</script>

<template>
    <router-view :key="$route.fullPath" />
</template>

<style scoped></style>
