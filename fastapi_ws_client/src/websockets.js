import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

//import { FRONTEND_WEBSOCKETS_TIMEOUT } from '$env/static/private';

export class WebSocketMiddleman {
	/** @type {import('ws').WebSocket} */
	frontendConnection;

	/** @type {string} */
	wsSessionId;

	/** @type {undefined | WebSocket} */
	backendConnection;

	/** @type {string | number | NodeJS.Timeout | undefined}*/
	pingTimeoutObject;

	/** @type {string}*/
	__backendWSId;

	/** @type {string}*/
	backendAddress;

	pingWSTimeout = Number(30000) + 1000;

	/**
	 * @param {import('ws').WebSocket} frontendConnection
	 * @param {string} backendUrl
	 * @param {string} wsSessionId
	 */
	constructor(frontendConnection, backendUrl, wsSessionId) {
		this.backendAddress = backendUrl;
		this.frontendConnection = frontendConnection;
		this.wsSessionId = wsSessionId ? wsSessionId : uuidv4();
		this.__backendWSId = '';
		this.backendConnection = undefined;
	}

	connectToWs() {
		console.log('connecting to backend:', this.backendAddress);
		if (this.backendConnection !== undefined) return this.backendConnection;

		const connection = new WebSocket(this.backendAddress);

		connection.on('ping', () => {
			if (!connection) throw new Error('Connection not open');
			console.log(this.wsSessionId, 'received ping');
			clearTimeout(this.pingTimeoutObject);
			this.pingTimeoutObject = setTimeout(() => {
				connection.terminate();
				this.frontendConnection.terminate();
			}, this.pingWSTimeout);
		});

		connection.on('message', (data) => {
			console.log('data:', data.toString());
			const message = JSON.parse(data.toString());
			console.log('message:', message);
			if (message.message === 'connected') {
				this.__backendWSId = message.session_id;
				console.log('internal sessionID:', this.__backendWSId);
			}

			this.frontendConnection.send(data.toString());
		});
		connection.on('pong', () => {
			console.log('pong');
		});

		connection.on('close', () => {
			if (!connection) throw new Error("Connection doesn't exist");
			this.frontendConnection.close();
			clearTimeout(this.pingTimeoutObject);
			console.log(this.wsSessionId, 'closed');
			console.log('Websocket connection closed');
		});

		connection.on('error', (err) => {
			console.log('error:', err);
			connection.close();
		});

		connection.on('open', () => {
			if (!connection) throw new Error("Connection doesn't exist");
			console.log('Websocket connection opened');
		});

		this.backendConnection = connection;
	}

	terminate() {
		if (this.backendConnection !== undefined) {
			this.frontendConnection.close();
			this.backendConnection.close();
		}
		clearTimeout(this.pingTimeoutObject);
		console.log(`Closed Backend WS connection ${this.wsSessionId}`);
	}
}

export default {};
