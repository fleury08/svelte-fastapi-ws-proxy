import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websockets.store';
import { browser } from '$app/environment';

export function closeWebSocketConnection(connection: WebSocket) {
	connection.close();
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

		connection.addEventListener('close', () => {
			registerMessage('Connection with websocket has been closed.');
			storeConnected.set(false);
			reconnectionManager = setInterval(() => {
				registerMessage('Trying reconnection to the websockets');
				storeWsConnection.set(createWebSocketConnection(url));
			}, 30000);
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
