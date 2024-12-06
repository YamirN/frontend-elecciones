<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Inicio',
        items: [{ label: 'Estadisticas', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },

    {
        label: 'GESTIONAR REGISTROS',
        to: '/pages',
        items: [
            // {
            //     label: 'Mesas',
            //     icon: 'pi pi-table',
            //     to: '/pages/mesas'
            // },
            {
                label: 'Gestionar Usuarios',
                icon: 'pi pi-fw pi-user-edit',
                items: [

                    {
                        label: 'Candidatos',
                        icon: 'pi pi-fw pi-user',
                        to: '/user/candidatecrud'
                    },
                    {
                        label: 'Estudiantes',
                        icon: 'pi pi-users',
                        to: '/user/votercrud'
                    }
                ]
            },


        ]
    },
    {
        label: 'REPORTES',
        to: '/pages',
        items: [

            // { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },


            {
                label: 'Actas',
                icon: 'pi pi-file-pdf',
                to: '/pages/empty'
            }
        ]
    },

]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
