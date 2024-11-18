<script setup>
import { usePdfStore } from '@/stores/reportes';
import { ref } from 'vue';

const pdfStore = usePdfStore();
const nivelSeleccionado = ref('');
const gradoSeleccionado = ref('');
const seccionSeleccionado = ref('');



const downloadPdf = async () => {
    if (nivelSeleccionado.value) {
        await pdfStore.generarPdfs(nivelSeleccionado.value, gradoSeleccionado.value, seccionSeleccionado.value);

    }
};

const downloadPdfhuella = async () => {
    if (nivelSeleccionado.value) {
        await pdfStore.generarPdfsHuella(nivelSeleccionado.value, gradoSeleccionado.value, seccionSeleccionado.value);

    }
};

const downloadPdfPendiente = async () => {
    await pdfStore.generarPdfsPendiente();
};
</script>

<template>
    <div class="p-6 space-y-6">
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card para Generar PDF por Nivel y Mesa -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div class="aspect-video relative bg-gradient-to-br from-blue-500 to-blue-700">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-5xl">🗒️</span>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Reporte de Electores por Nivel, Grado y Seccion
                    </h3>

                    <div class="space-y-4">
                        <!-- Selector de Nivel -->
                        <div>
                            <label for="nivel" class="block text-sm font-medium text-gray-700 mb-1">Nivel:</label>
                            <select id="nivel" v-model="nivelSeleccionado"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Seleccionar</option>
                                <option value="Primaria">Primaria</option>
                                <option value="Secundaria">Secundaria</option>
                            </select>
                        </div>

                        <!-- Selector de Grado -->
                        <div v-if="nivelSeleccionado" class="mt-4">
                            <label for="grado" class="block text-sm font-medium text-gray-700 mb-1">Grado:</label>
                            <select id="grado" v-model="gradoSeleccionado"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Seleccionar</option>
                                <option value="Primero">1°</option>
                                <option value="Segundo">2°</option>
                                <option value="Tercero">3°</option>
                                <option value="Cuarto">4°</option>
                                <option value="Quinto">5°</option>
                                <option value="Sexto">6°</option>
                                <!-- Puedes agregar más grados aquí -->
                            </select>
                        </div>

                        <!-- Selector de Sección -->
                        <div v-if="gradoSeleccionado" class="mt-4">
                            <label for="seccion" class="block text-sm font-medium text-gray-700 mb-1">Sección:</label>
                            <select id="seccion" v-model="seccionSeleccionado"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Seleccionar</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                                <option value="G">G</option>
                                <option value="H">H</option>

                                <!-- Puedes agregar más secciones aquí -->
                            </select>
                        </div>

                        <!-- Botón para generar PDF -->
                        <button @click="downloadPdf" :disabled="!nivelSeleccionado"
                            class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">

                            <span class="pi pi-file-pdf mr-2" style="font-size: 1rem"></span>
                            Generar PDF
                        </button>

                        <!-- ACA IRIA EL BOTON PARA DESCARGAR EL PDF CON HUELLA -->
                        <button @click="downloadPdfhuella" :disabled="!nivelSeleccionado"
                            class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="pi pi-file-pdf mr-2" style="font-size: 1rem"></span>
                            Generar PDF Firma
                        </button>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div class="aspect-video relative bg-gradient-to-br from-red-500 to-white-700">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-5xl">🗒️</span>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Reporte de Electores que no votaron
                    </h3>

                    <div class="space-y-4">

                        <!-- Botón para generar PDF -->
                        <button @click="downloadPdfPendiente"
                            class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">

                            <span class="pi pi-file-pdf mr-2" style="font-size: 1rem"></span>
                            Generar PDF
                        </button>


                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>