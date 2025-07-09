<script setup>
import { useAuthStore } from '@/stores/auth';
import { useCitaStore } from '@/stores/citaStore';
import { useServicioStore } from '@/stores/servicioStore';
import { isToday } from 'date-fns';

import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const citaStore = useCitaStore();
const servicioStore = useServicioStore();

const { servicios, loading: loadingServicios, errors } = storeToRefs(servicioStore);
const { user, isAuthenticated } = storeToRefs(authStore);
const { citaTemporal, citasCliente, loading: loadingCitasCliente, error, errors: errorsCitas } = storeToRefs(citaStore);
const activeIndex = ref('0');
// Client stats

const isFormComplete = computed(() => {
    return bookingForm.value.servicio && bookingForm.value.fecha && bookingForm.value.hora;
});

const totalServicios = computed(() => citasCliente.value.filter((cita) => cita.estado === 'completado').length);

const filteredHours = computed(() => {
    const fecha = bookingForm.value.fecha;
    if (!fecha) return citaStore.availableHours;

    const hoy = new Date();
    const fechaSeleccionada = new Date(fecha);

    if (!isToday(fechaSeleccionada)) {
        return citaStore.availableHours;
    }

    const ahora = hoy.getHours() * 60 + hoy.getMinutes(); // minutos actuales

    return citaStore.availableHours.filter((horaStr) => {
        const [h, m] = horaStr.split(':').map(Number);
        const minutosHora = h * 60 + m;
        return minutosHora > ahora;
    });
});

const parseFecha = (fechaStr, horaStr) => {
    const [dia, mes, anio] = fechaStr.split('-');
    return new Date(`${anio}-${mes}-${dia}T${horaStr}`);
};

const proximaReserva = computed(() => {
    const hoy = new Date();

    const futuras = citasCliente.value
        .filter((cita) => {
            const fechaCita = parseFecha(cita.fecha, cita.hora);
            return fechaCita > hoy && ['pendiente', 'confirmada'].includes(cita.estado);
        })
        .sort((a, b) => parseFecha(a.fecha, a.hora) - parseFecha(b.fecha, b.hora));

    return futuras.length
        ? parseFecha(futuras[0].fecha, futuras[0].hora).toLocaleString('es-PE', {
              dateStyle: 'short',
              timeStyle: 'short'
          })
        : 'Sin reservas';
});

const reservasEsteMes = computed(() => {
    const now = new Date();
    return citasCliente.value.filter((c) => {
        const fecha = new Date(c.fecha);
        return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
    }).length;
});

// Booking dialog
const showBookingDialog = ref(false);
const bookingForm = ref({
    servicio: null,
    fecha: null,
    hora: null
});

const resetBookingForm = () => {
    bookingForm.value = {
        servicio: null,
        fecha: null,
        hora: null
    };
};

const logout = async () => {
    await authStore.handleLogout();
    authStore.$reset();
    router.replace({ name: 'login' });
};

// Recent bookings
const recentBookings = computed(() => {
    return [...citasCliente.value]
        .sort((a, b) => {
            const [da, ma, ya] = a.fecha.split('-').map(Number);
            const [db, mb, yb] = b.fecha.split('-').map(Number);
            const dateA = new Date(ya, ma - 1, da);
            const dateB = new Date(yb, mb - 1, db);
            return dateB - dateA; // más recientes primero
        })
        .slice(0, 3);
});

// Methods
const formatDate = (fechaStr) => {
    if (!fechaStr) return '';

    const [dia, mes, anio] = fechaStr.split('-').map(Number);
    const date = new Date(anio, mes - 1, dia);

    const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', opciones);
};

const formatDateForDisplay = (date) => {
    if (!date) return '';

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}-${mes}-${anio}`;
};

const getStatusSeverity = (estado) => {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return 'warning';
        case 'confirmado':
            return 'info';
        case 'completado':
            return 'success';
        case 'cancelado':
            return 'danger';
        default:
            return '';
    }
};

const bookService = (service) => {
    bookingForm.value.servicio = service;
    showBookingDialog.value = true;
};

const confirmBooking = async () => {
    const { servicio, fecha, hora } = bookingForm.value;

    // Validación local básica
    if (!servicio || !fecha || !hora) {
        toast.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Por favor completa todos los campos de la reserva',
            life: 3000
        });
        return;
    }

    const payload = {
        servicio_id: servicio.id,
        fecha: fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
        hora
    };

    const success = await citaStore.generarCitaTemporal(payload);

    if (success) {
        // Éxito: Redirigir a MercadoPago
        toast.add({
            severity: 'success',
            summary: 'Redirigiendo al pago',
            detail: 'Serás llevado a MercadoPago para completar la reserva',
            life: 4000
        });

        // Abrir ventana de pago
        window.open(citaTemporal.value.init_point, '_blank');

        // Cerrar diálogo y resetear formulario
        showBookingDialog.value = false;
        bookingForm.value = {
            servicio: null,
            fecha: null,
            hora: null
        };
    } else {
        // Mostrar error devuelto por el store
        toast.add({
            severity: 'error',
            summary: 'Error en la reserva',
            detail: error.value || 'Ya cuenta con un servicio reservado para esta fecha y hora',
            life: 4000
        });
    }
};

const rescheduleBooking = (booking) => {
    toast.add({
        severity: 'info',
        summary: 'Reagendar',
        detail: `Reagendando ${booking.servicio}`,
        life: 3000
    });
};

const rateService = (booking) => {
    toast.add({
        severity: 'info',
        summary: 'Calificar Servicio',
        detail: `Calificando ${booking.servicio}`,
        life: 3000
    });
};

const useOffer = (type) => {
    toast.add({
        severity: 'success',
        summary: 'Oferta Aplicada',
        detail: '20% de descuento aplicado a tu próxima reserva',
        life: 3000
    });
};

const viewVipPackage = () => {
    toast.add({
        severity: 'info',
        summary: 'Paquete VIP',
        detail: 'Redirigiendo a paquetes especiales...',
        life: 3000
    });
};

// Navigation methods
const goToMyBookings = () => {
    router.push({ name: 'cliente-reservas' });
};

onMounted(async () => {
    await citaStore.CitasCliente();
    servicioStore.ListaServicio();
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
        router.push({ name: 'login' });
    }
});
const formatFechaBackend = (fecha) => {
    if (!(fecha instanceof Date)) return fecha;
    return fecha.toISOString().split('T')[0];
};
watch(
    () => [bookingForm.value.fecha, bookingForm.value.servicio],
    async ([fecha, servicio]) => {
        if (fecha && servicio) {
            await citaStore.cargarHorasDisponibles({
                fecha: formatFechaBackend(fecha),
                cliente_id: authStore.user.id,
                servicio_id: servicio.id
            });
        }
    }
);
</script>

<template>
    <div class="p-6">
        <!-- Welcome Banner -->
        <Tabs v-model:value="activeIndex" class="mb-8">
            <TabList>
                <Tab value="0">Inicio</Tab>
                <Tab value="1">Mis Reservas</Tab>
            </TabList>

            <TabPanels>
                <!-- TAB 1: Bienvenida -->
                <TabPanel name="inicio" title="Inicio" value="0">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-6 text-center">
                        <h2 v-if="user" class="text-4xl font-bold mb-4">¡Bienvenido de vuelta, {{ user.nombre }}!</h2>
                        <p class="text-xl mb-6">Tu bienestar es nuestra prioridad</p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button label="Reservar Ahora" icon="pi pi-calendar-plus" size="large" class="bg-white text-blue-900 hover:bg-gray-100" @click="showBookingDialog = true" />
                            <Button label="Mis Reservas" icon="pi pi-list" @click="activeIndex = '1'" />
                        </div>
                    </div>
                    <!-- Quick Stats for Client -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-green-200 rounded-lg p-6 text-center">
                            <i class="pi pi-check-circle text-4xl text-green-700 mb-3"></i>
                            <h3 class="text-2xl font-bold text-gray-800">{{ totalServicios }}</h3>
                            <p class="text-gray-600 mt-2">Servicios Completados</p>
                        </div>
                        <div class="bg-blue-200 rounded-lg p-6 text-center">
                            <i class="pi pi-calendar text-4xl text-blue-600 mb-3"></i>
                            <h3 class="text-2xl font-bold text-gray-800">{{ proximaReserva }}</h3>
                            <p class="text-gray-600 mt-2">Próxima Reserva</p>
                        </div>
                        <div class="bg-purple-200 rounded-lg p-6 text-center">
                            <i class="pi pi-star text-4xl text-purple-600 mb-3"></i>
                            <h3 class="text-2xl font-bold text-gray-800">{{ reservasEsteMes }}</h3>
                            <p class="text-gray-600 mt-2">Reservas Este Mes</p>
                        </div>
                    </div>
                    <!-- Recommended Services -->
                    <div class="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Nuestros Servicios</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="service in servicios" :key="service.id" class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                                <div class="relative">
                                    <img :src="service.imagen" :alt="service.nombre" class="w-full h-48 object-cover rounded-t-lg" />
                                </div>
                                <div class="p-4">
                                    <div class="flex justify-between items-start mb-3">
                                        <h3 class="text-xl font-bold text-gray-800">{{ service.nombre }}</h3>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-blue-600">S/. {{ service.precio }}</div>
                                            <div class="text-sm text-gray-500">{{ service.duracion }} min</div>
                                        </div>
                                    </div>
                                    <p class="text-gray-600 mb-4 leading-relaxed">{{ service.descripcion }}</p>
                                    <div class="flex justify-end">
                                        <Button label="Reservar" size="small" @click="bookService(service)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel value="1">
                    <div class="bg-white rounded-lg shadow p-6 mb-8">
                        <div class="flex justify-between items-center mb-8">
                            <h2 class="text-3xl font-bold text-gray-800">Mis Reservas Recientes</h2>
                            <Button label="Ver Todas" outlined @click="goToMyBookings" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="booking in recentBookings" :key="booking.id" class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                                <div class="p-4">
                                    <!-- Título y estado -->
                                    <div class="flex justify-between items-start mb-3">
                                        <h3 class="font-semibold text-gray-800">{{ booking.servicio.nombre }}</h3>
                                        <Tag :value="booking.estado" :severity="getStatusSeverity(booking.estado)" class="text-xs" />
                                    </div>
                                    <!-- Fecha, hora y trabajador -->
                                    <div class="space-y-2 text-sm text-gray-600 mb-4">
                                        <div class="flex items-center">
                                            <i class="pi pi-calendar mr-2"></i>
                                            <span>{{ formatDate(booking.fecha) }}</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="pi pi-clock mr-2"></i>
                                            <span>{{ booking.hora }}</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="pi pi-user mr-2"></i>
                                            <span>
                                                {{ booking.trabajador ? booking.trabajador.nombre + ' ' + booking.trabajador.apellido : 'Sin asignar' }}
                                            </span>
                                        </div>
                                    </div>
                                    <!-- Precio y acciones -->
                                    <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <span class="font-semibold text-green-600">S/. {{ booking.servicio.precio }}</span>
                                        <div class="flex space-x-2">
                                            <Button v-if="booking.estado === 'Confirmado'" label="Reagendar" size="small" outlined @click="rescheduleBooking(booking)" />
                                            <Button v-if="booking.estado === 'Completado'" label="Calificar" size="small" @click="rateService(booking)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <!-- Special Offers -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 text-center">
            <h2 class="text-3xl font-bold mb-4">Ofertas Especiales para Ti</h2>
            <p class="text-xl mb-8">Aprovecha estos descuentos exclusivos</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div class="bg-white text-gray-800 rounded-lg p-6">
                    <i class="pi pi-gift text-4xl text-purple-600 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">20% OFF (Funcion en Desarrollo ...)</h3>
                    <p class="text-gray-600 mb-4">En tu próximo masaje relajante</p>
                    <Button label="Usar Oferta" class="bg-purple-600 text-white" @click="useOffer('massage')" />
                </div>

                <div class="bg-white text-gray-800 rounded-lg p-6">
                    <i class="pi pi-star text-4xl text-yellow-500 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Paquete VIP (Funcion en Desarrollo ...)</h3>
                    <p class="text-gray-600 mb-4">3 servicios por el precio de 2</p>
                    <Button label="Ver Paquete" class="bg-yellow-500 text-white" @click="viewVipPackage" />
                </div>
            </div>
        </div>

        <!-- Quick Booking Dialog -->
        <Dialog v-model:visible="showBookingDialog" modal @hide="resetBookingForm" header="✨ Reservar tu Experiencia de Bienestar" :style="{ width: '600px' }" class="booking-dialog" :draggable="false">
            <div class="space-y-6 p-2">
                <!-- Paso actual indicator -->
                <div class="flex items-center justify-center mb-6">
                    <div class="flex items-center space-x-2">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">1</div>
                            <span class="ml-2 text-sm font-medium text-gray-700">Servicio</span>
                        </div>
                        <div class="w-8 h-px bg-gray-300"></div>
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full" :class="bookingForm.servicio ? 'flex items-center justify-center bg-blue-500 text-white' : 'flex items-center justify-center bg-gray-200 text-gray-500'">2</div>
                            <span class="ml-2 text-sm font-medium" :class="bookingForm.servicio ? 'text-gray-700' : 'text-gray-400'">Fecha & Hora</span>
                        </div>
                    </div>
                </div>

                <!-- Servicio Selection -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <label class="flex items-center text-lg font-semibold text-gray-800 mb-4">
                        <i class="pi pi-sparkles mr-2 text-blue-600"></i>
                        Elige tu Servicio
                    </label>
                    <Select
                        v-model="bookingForm.servicio"
                        :options="servicios"
                        optionLabel="nombre"
                        placeholder="¿Qué experiencia te gustaría vivir hoy?"
                        class="w-full"
                        :pt="{
                            root: { class: 'border-2 border-blue-200 hover:border-blue-400 transition-colors' },
                            input: { class: 'text-gray-700 font-medium' }
                        }"
                    >
                        <template #option="slotProps">
                            <div class="flex p-2 hover:bg-blue-50 rounded w-full">
                                <!-- Parte izquierda: nombre y duración -->
                                <div class="flex-grow">
                                    <div class="font-semibold text-gray-800">{{ slotProps.option.nombre }}</div>
                                    <div class="text-sm text-gray-600">{{ slotProps.option.duracion }} min</div>
                                </div>

                                <!-- Parte derecha: precio alineado -->
                                <div class="text-right ml-4 self-center">
                                    <div class="font-bold text-blue-600">S/. {{ slotProps.option.precio }}</div>
                                </div>
                            </div>
                        </template>
                    </Select>

                    <!-- Servicio seleccionado preview -->
                    <div v-if="bookingForm.servicio" class="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-gray-800">{{ bookingForm.servicio.nombre }}</h4>
                                <p class="text-sm text-gray-600">{{ bookingForm.servicio.descripcion }}</p>
                                <div class="flex items-center mt-2 space-x-4">
                                    <span class="text-sm text-gray-500">
                                        <i class="pi pi-clock mr-1"></i>
                                        {{ bookingForm.servicio.duracion }} min
                                    </span>
                                    <span class="text-sm font-semibold text-green-600">
                                        <i class="pi pi-tag mr-1"></i>
                                        S/. {{ bookingForm.servicio.precio }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-4xl">💆‍♀️</div>
                        </div>
                    </div>
                </div>

                <!-- Fecha y Hora Selection -->
                <div v-if="bookingForm.servicio" class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 transition-all duration-300">
                    <label class="flex items-center text-lg font-semibold text-gray-800 mb-4">
                        <i class="pi pi-calendar mr-2 text-green-600"></i>
                        Selecciona Fecha y Hora
                    </label>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Fecha -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="pi pi-calendar-plus mr-1"></i>
                                Fecha preferida
                            </label>
                            <DatePicker
                                v-model="bookingForm.fecha"
                                :minDate="new Date()"
                                placeholder="¿Cuándo te gustaría venir?"
                                class="w-full"
                                dateFormat="dd/mm/yy"
                                :pt="{
                                    root: { class: 'border-2 border-green-200 hover:border-green-400 transition-colors' },
                                    input: { class: 'text-gray-700 font-medium' }
                                }"
                                showIcon
                                iconDisplay="input"
                            />
                        </div>

                        <!-- Hora -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="pi pi-clock mr-1"></i>
                                Hora preferida
                            </label>
                            <Select
                                v-model="bookingForm.hora"
                                :options="filteredHours"
                                placeholder="Elige tu horario"
                                class="w-full"
                                :pt="{
                                    root: { class: 'border-2 border-green-200 hover:border-green-400 transition-colors' },
                                    input: { class: 'text-gray-700 font-medium' }
                                }"
                            >
                                <template #option="slotProps">
                                    <div class="flex items-center justify-between p-2 hover:bg-green-50 rounded">
                                        <span class="font-medium">{{ slotProps.option }}</span>
                                        <i class="pi pi-check-circle text-green-500"></i>
                                    </div>
                                </template>
                            </Select>
                        </div>
                    </div>
                </div>

                <!-- Resumen de la reserva -->
                <div v-if="bookingForm.servicio && bookingForm.fecha && bookingForm.hora" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                    <h3 class="flex items-center text-lg font-semibold text-gray-800 mb-3">
                        <i class="pi pi-check-circle mr-2 text-purple-600"></i>
                        Resumen de tu Reserva
                    </h3>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Servicio:</span>
                            <span class="font-semibold text-gray-800">{{ bookingForm.servicio.nombre }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Fecha:</span>
                            <span class="font-semibold text-gray-800">{{ formatDate(formatDateForDisplay(bookingForm.fecha)) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Hora:</span>
                            <span class="font-semibold text-gray-800">{{ bookingForm.hora }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Duración:</span>
                            <span class="font-semibold text-gray-800">{{ bookingForm.servicio.duracion }} min</span>
                        </div>
                        <hr class="border-purple-200" />
                        <div class="flex justify-between items-center text-lg">
                            <span class="font-semibold text-gray-800">Total:</span>
                            <span class="font-bold text-purple-600 text-xl">S/. {{ bookingForm.servicio.precio }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <Button label="Cancelar" text class="text-gray-500 hover:text-gray-700" @click="showBookingDialog = false">
                        <template #icon>
                            <i class="pi pi-times mr-2"></i>
                        </template>
                    </Button>

                    <Button
                        :label="isFormComplete ? '✨ Confirmar mi Reserva' : 'Completa los datos'"
                        :disabled="!isFormComplete"
                        class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                        @click="confirmBooking"
                    >
                        <template #icon>
                            <i class="pi pi-check mr-2"></i>
                        </template>
                    </Button>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-purple-600 {
    --tw-gradient-to: #9333ea;
}

.from-purple-600 {
    --tw-gradient-from: #9333ea;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0));
}

.to-pink-600 {
    --tw-gradient-to: #db2777;
}

.bg-green-50 {
    background-color: #f0fdf4;
}

.bg-blue-50 {
    background-color: #eff6ff;
}

.bg-purple-50 {
    background-color: #faf5ff;
}

.text-green-600 {
    color: #16a34a;
}

.text-blue-600 {
    color: #2563eb;
}

.text-purple-600 {
    color: #9333ea;
}

.text-yellow-500 {
    color: #eab308;
}

.bg-purple-600 {
    background-color: #9333ea !important;
}

.bg-yellow-500 {
    background-color: #eab308 !important;
}

.leading-relaxed {
    line-height: 1.625;
}
</style>
