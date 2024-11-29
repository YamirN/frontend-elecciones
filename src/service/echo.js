import Echo from 'laravel-echo';
// Importa `pusher-js` como un módulo ES
import Pusher from 'pusher-js';

// Asigna Pusher globalmente
window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: '1478963',
    wsHost: 'api.coordinacionbondy.com',
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],

});



export default echo;