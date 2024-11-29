import Echo from 'laravel-echo';
// Importa `pusher-js` como un módulo ES
import Pusher from 'pusher-js';

// Asigna Pusher globalmente
window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: 'some_key',
    wsHost: 'api.coordinacionbondy.com',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],

});



export default echo;