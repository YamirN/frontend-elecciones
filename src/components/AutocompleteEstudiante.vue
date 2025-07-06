<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    modelValue: Object,
    suggestions: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Buscar...'
    },
    optionLabel: {
        type: String,
        default: 'nombre'
    }
});

const emit = defineEmits(['update:modelValue', 'search']);

const searchText = ref('');
const showSuggestions = ref(false);
const wrapperRef = ref(null);

// 🔍 Emitir búsqueda con debounce
let debounceTimeout;
const onInput = (e) => {
    searchText.value = e.target.value;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        emit('search', searchText.value);
    }, 300);
};

// ✅ Seleccionar item
const selectItem = (item) => {
    searchText.value = item?.[props.optionLabel] || '';
    emit('update:modelValue', item);
    showSuggestions.value = false;
};

// 🔄 Reflejar cambios externos
watch(
    () => props.modelValue,
    (newVal) => {
        searchText.value = newVal ? newVal[props.optionLabel] : '';
    },
    { immediate: true }
);

// 🔒 Cerrar dropdown al hacer clic fuera
const handleClickOutside = (e) => {
    if (!wrapperRef.value?.contains(e.target)) {
        showSuggestions.value = false;
    }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
    <div class="relative" ref="wrapperRef">
        <input type="text" class="w-full border rounded px-3 py-2" :placeholder="placeholder" :value="searchText" @input="onInput" @focus="showSuggestions = true" />

        <!-- Sugerencias -->
        <ul v-if="showSuggestions" class="absolute z-10 bg-white border rounded w-full mt-1 max-h-60 overflow-auto shadow-lg">
            <li v-if="loading" class="px-3 py-2 text-gray-500 italic">Cargando...</li>
            <li v-else-if="suggestions.length" v-for="(item, index) in suggestions" :key="item.id || index" class="px-3 py-2 hover:bg-gray-100 cursor-pointer" @click="selectItem(item)">
                {{ item[props.optionLabel] }}
            </li>
            <li v-else class="px-3 py-2 text-gray-500 italic">No se encontraron resultados</li>
        </ul>
    </div>
</template>
