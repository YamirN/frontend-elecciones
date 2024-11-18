
import { generarListaHuella, generarListaPendiente, generarPdf } from '@/service/reportes';
import { defineStore } from 'pinia';

export const usePdfStore = defineStore('pdf', {
    state: () => ({
        pdf: null, // Contenido del PDF seleccionado
        error: null,
        isLoading: false
    }),
    actions: {
        async generarPdfs(nivel, grado, seccion) {
            this.isLoading = true;
            try {
                const response = await generarPdf(nivel, grado, seccion);
                this.pdf = response.data.pdf; // Asumiendo que el base64 viene en response.data.pdf

                // Convertir base64 a blob y descargar
                const byteCharacters = atob(this.pdf);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Crear URL y descargar
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `lista_votantes_${nivel}-${grado}-${seccion}.pdf`; // Nombre del archivo
                document.body.appendChild(link);
                link.click();

                // Limpieza
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);

                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al generar el PDF';
                console.error('Error:', error);
            } finally {
                this.isLoading = false;
            }
        },
        async generarPdfsHuella(nivel, grado, seccion) {
            this.isLoading = true;
            try {
                const response = await generarListaHuella(nivel, grado, seccion);
                this.pdf = response.data.pdf; // Asumiendo que el base64 viene en response.data.pdf

                // Convertir base64 a blob y descargar
                const byteCharacters = atob(this.pdf);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Crear URL y descargar
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `lista_con_HuellaFirma_${nivel}-${grado}-${seccion}.pdf`; // Nombre del archivo
                document.body.appendChild(link);
                link.click();

                // Limpieza
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);

                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al generar el PDF';
                console.error('Error:', error);
            } finally {
                this.isLoading = false;
            }
        },
        async generarPdfsPendiente() {
            this.isLoading = true;
            try {
                const response = await generarListaPendiente();
                this.pdf = response.data.pdf; // Asumiendo que el base64 viene en response.data.pdf

                // Convertir base64 a blob y descargar
                const byteCharacters = atob(this.pdf);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Crear URL y descargar
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `lista_no_votaron.pdf`; // Nombre del archivo
                document.body.appendChild(link);
                link.click();

                // Limpieza
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);

                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al generar el PDF';
                console.error('Error:', error);
            } finally {
                this.isLoading = false;
            }
        }
    }
});