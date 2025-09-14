import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY, // tu key
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, // tu cluster

    forceTLS: true,
    wssPort: 443,
    enabledTransports: ['ws', 'wss']
});
window.echo = echo;

export default echo;
