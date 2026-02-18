
import localtunnel from 'localtunnel';

(async () => {
    try {
        const tunnel = await localtunnel({ port: 5173 });

        // the assigned public url for your local server, e.g. https://abcdefg.localtunnel.me
        console.log('URL:', tunnel.url);

        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });
    } catch (err) {
        console.error('Error:', err);
    }
})();
