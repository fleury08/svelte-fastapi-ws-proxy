<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { websocket } from '@ubermanu/sveltekit-websocket/stores';
	import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websockets.store';

	storeWsConnection.set(createWebSocketConnection());
	let reconnectionManager: ReturnType<typeof setInterval>;

	let messages = [];

	function createWebSocketConnection() {
		const connection = browser ? new WebSocket($websocket.url) : null;

		if (connection) {
			connection.addEventListener('open', () => {
				clearInterval(reconnectionManager)
				registerMessage('Connecting to the websocket');
				storeConnected.set(true);
			});

			connection.addEventListener('message', (event) => {
				registerMessage(JSON.stringify(JSON.parse(event.data), null, 2));
			});

			connection.addEventListener('update', (event: MessageEvent) => {
				registerMessage(JSON.stringify(JSON.parse(event.data), null, 2));
			});

			connection.addEventListener('close', () => {
				registerMessage('Connection with websocket has been closed.');
				storeConnected.set(false);
				reconnectionManager = setInterval(() => {
					registerMessage("Trying reconnection to the websockets");
					storeWsConnection.set(createWebSocketConnection());
				}, 5000);
			});

		}
		return connection;
	}

	function registerMessage(message: string) {
		messages.push(message);
		storeWsMessages.set(messages);
		console.log(message);
	}


</script>


<slot />