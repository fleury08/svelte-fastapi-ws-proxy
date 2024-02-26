import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'

export class WebSocketMiddleman {
	/** @type {import('ws').WebSocket} */
	frontendConnection

	/** @type {string} */
	wsSessionId

	/** @type {undefined | WebSocket} */
	backendConnection

	/** @type {string | number | NodeJS.Timeout | undefined}*/
	pingTimeoutObject

	/** @type {string}*/
	__backendWSId

	/** @type {string}*/
	backendAddress

	/** @type {number}*/
	pingWSTimeout = Number.parseInt(process.env.VITE_FRONTEND_WEBSOCKETS_TIMEOUT || '30000') + 1000

	/**
	 * @param {import('ws').WebSocket} frontendConnection
	 * @param {string} backendUrl
	 * @param {string} wsSessionId
	 */
	constructor(frontendConnection, backendUrl, wsSessionId) {
		this.backendAddress = backendUrl
		this.frontendConnection = frontendConnection
		this.wsSessionId = wsSessionId ?? uuidv4()
		this.__backendWSId = ''
		this.backendConnection = undefined
		console.log('ping timeout:', this.pingWSTimeout)
	}

	connectToWs() {
		console.log('connecting to backend:', this.backendAddress)
		if (this.backendConnection !== undefined) return this.backendConnection

		const connection = new WebSocket(this.backendAddress)

		connection.on('ping', () => {
			if (!connection) throw new Error('Connection not open')
			console.log(this.wsSessionId, 'received ping')
			clearTimeout(this.pingTimeoutObject)
			console.log(this.wsSessionId, 'cleared ping timeout')
			this.pingTimeoutObject = setTimeout(() => {
				connection.terminate()
				this.frontendConnection.terminate()
			}, this.pingWSTimeout)
			console.log(this.wsSessionId, 'set ping timeout')
		})

		// {string|Buffer} data - The message data received from the connection, can be a string or binary data.
		connection.on('message', (data) => {
			console.log('data:', String(data))
			const message = JSON.parse(String(data))
			console.log('message:', message)
			if (message.message === 'connected') {
				this.__backendWSId = message.session_id
				console.log('internal sessionID:', this.__backendWSId)
			}

			this.frontendConnection.send(String(data))
		})

		connection.on('close', () => {
			if (!connection) throw new Error("Connection doesn't exist")
			clearTimeout(this.pingTimeoutObject)
			this.frontendConnection.close()
			console.log(this.wsSessionId, 'closed')
			console.log('Websocket connection closed')
		})

		connection.on('error', (err) => {
			console.log('error:', err)
			connection.close()
		})

		connection.on('open', () => {
			if (!connection) throw new Error("Connection doesn't exist")
			console.log('Websocket connection opened')
		})

		this.backendConnection = connection
	}

	terminate() {
		if (this.backendConnection !== undefined) {
			this.frontendConnection.terminate()
			this.frontendConnection.terminate()
		}
		clearTimeout(this.pingTimeoutObject)
		console.log(`Closed Backend WS connection ${this.wsSessionId}`)
	}
}

export default {}
