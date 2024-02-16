import { v4 as uuidv4 } from 'uuid';
import { WebSocketMiddleman } from './websockets.js';

const address = 'http://localhost:8000/ws';

/** @type {import('@ubermanu/sveltekit-websocket').Handle} */
export const handle = async ({ socket, request }) => {
	const authToken = true; //todo: aktivni token soucasti dotazu na server;
	if (authToken) {
		const sessionId = uuidv4();
		const backendConnection = new WebSocketMiddleman(socket, address, sessionId);
		backendConnection.connectToWs();

		socket.on('close', () => {
			console.log(`Closed Frontend WS connection ${sessionId}`);
			backendConnection.terminate();
		});

		socket.on('error', (e) => {
			backendConnection.terminate();
		});
		return;
	}
	console.log('Websockets needs token!');
	socket.close();
};
