import { v4 as uuidv4 } from 'uuid';
import { WebSocketMiddleman } from './websockets.js';
//import { BACKEND_API_URL } from '$env/static/private';

/** @type {import('@ubermanu/sveltekit-websocket').Handle} */
export const handle = async ({ socket, request }) => {
	const backendWebsocketsURL = "http://localhost:8000/ws";

	const authToken = true; //todo: aktivni token soucasti dotazu na server;

	if (authToken && backendWebsocketsURL) {
		const sessionId = uuidv4();
		const backendConnection = new WebSocketMiddleman(socket, backendWebsocketsURL, sessionId);

		backendConnection.connectToWs();

		socket.on('close', () => {
			console.log(`Closed Frontend WS connection ${sessionId}`);
			backendConnection.terminate();
		});

		socket.on('error', (e) => {
			console.log(e)
			backendConnection.terminate();
		});
		return;
	}

	console.log('Websockets needs token!');
	socket.close();
};
