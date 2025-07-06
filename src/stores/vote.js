
import { emitirVoto } from '@/service/estudianteService';
import { defineStore } from 'pinia';
export const useVoteStore = defineStore('vote', {
    state: () => ({
        voteSuccess: false,
        errors: null,
    }),
    actions: {
        async submitVote({ dni, candidateId }) {
            try {
                const now = new Date();
                const fecha_voto = now.toISOString().slice(0, 19).replace('T', ' ');
                const response = await emitirVoto(dni, candidateId, fecha_voto);  // Pasa los parámetros individuales
                if (response.data.success) {
                    this.voteSuccess = true;
                    return true;
                }
            } catch (error) {
                this.errors = 'Error al emitir el voto.';
                throw error; // Permite manejar el error en el componente si es necesario
            }
        },
    },
});
