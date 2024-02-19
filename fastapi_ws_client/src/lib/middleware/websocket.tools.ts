import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websockets.store';
import { browser } from '$app/environment';
export function closeWebSocketConnection(connection: WebSocket) {
	connection.close(4000, 'Connection closed by user');
	storeConnected.set(false);
	storeWsConnection.set(null);
}

let reconnectionManager: ReturnType<typeof setInterval>;

export function createWebSocketConnection(url: string): WebSocket | null {
	const connection = browser ? new WebSocket(url) : null;

	if (connection) {
		connection.addEventListener('open', () => {
			clearInterval(reconnectionManager);
			registerMessage('Connecting to the websocket');
			storeConnected.set(true);
		});

		connection.addEventListener('message', (event: MessageEvent) => {
			registerMessage(JSON.stringify(JSON.parse(event.data), null, 2));
		});

		connection.addEventListener('close', (event) => {
			registerMessage('Connection with websocket has been closed.');
			storeConnected.set(false);
			if (event.code !== 4000) {
				reconnectionManager = setInterval(() => {
					registerMessage('Trying reconnection to the websockets');
					storeWsConnection.set(createWebSocketConnection(url));
				}, 5000);
			}
		});
	}
	return connection;
}

export function registerMessage(message: string) {
	storeWsMessages.update((messages) => {
		return [...messages, message];
	});
	console.log(message);
}
