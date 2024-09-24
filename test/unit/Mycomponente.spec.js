import Dashboard from '@/views/Dashboard.vue';
import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
describe('Dashboard', () => {


    vi.mock('@/service/candidateService', () => ({
        fetchCandidate: () => Promise.resolve({
            candidato: [
                {
                    id: 1,
                    users: [{ name: 'Juan', last_name: 'Pérez' }],
                    votos_count: 25,
                    foto: 'foto.jpg',
                },
            ],
        }),
    }));

    vi.mock('@/service/voterService', () => ({
        ObtenerNoVotantes: () => Promise.resolve({ cantidad: 10 }),
        ObtenerVotantes: () => Promise.resolve({ cantidad: 50 }),
        ObtenerVotantesOk: () => Promise.resolve({ cantidad: 40 }),
    }));

    test('renders correct statistics and candidates on load', async () => {
        const wrapper = mount(Dashboard);

        // Espera a que se carguen los datos
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 0));

        // Log del HTML para depuración
        console.log(wrapper.html());

        // Verifica que las estadísticas se muestran correctamente
        expect(wrapper.text()).toContain('10'); // número de no votantes
        expect(wrapper.text()).toContain('50'); // número total de votantes
        expect(wrapper.text()).toContain('40'); // número de votos emitidos

        // Verifica que los candidatos se muestran correctamente
        expect(wrapper.text()).toContain('Juan Pérez'); // nombre del candidato
        const porcentajeTexto = ((25 / 50) * 100).toFixed(2) + '%'; // calcular dinámicamente
        expect(wrapper.text()).toContain(porcentajeTexto); // porcentaje de votos
    });

});
