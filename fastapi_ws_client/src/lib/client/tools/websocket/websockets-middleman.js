import { logger } from '$lib/server/logger'
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
		logger.debug('ping timeout:', this.pingWSTimeout)
	}

	connectToWs() {
		logger.debug('connecting to backend:', this.backendAddress)
		if (this.backendConnection !== undefined) return this.backendConnection

		const connection = new WebSocket(this.backendAddress)

		connection.on('ping', () => {
			if (!connection) throw new Error('Connection not open')
			logger.debug(this.wsSessionId, 'received ping')
			clearTimeout(this.pingTimeoutObject)
			logger.debug(this.wsSessionId, 'cleared ping timeout')
			this.pingTimeoutObject = setTimeout(() => {
				connection.terminate()
				this.frontendConnection.terminate()
			}, this.pingWSTimeout)
			logger.debug(this.wsSessionId, 'set ping timeout')
		})

		// {string|Buffer} data - The message data received from the connection, can be a string or binary data.
		connection.on('message', (data) => {
			logger.debug('data:', String(data))
			const message = JSON.parse(String(data))
			logger.debug('message:', message)
			if (message.message === 'connected') {
				this.__backendWSId = message.session_id
				logger.debug('internal sessionID:', this.__backendWSId)
			}

			this.frontendConnection.send(String(data))
		})

		connection.on('close', () => {
			if (!connection) throw new Error("Connection doesn't exist")
			clearTimeout(this.pingTimeoutObject)
			this.frontendConnection.close()
			logger.debug(this.wsSessionId, 'closed')
			logger.debug('Websocket connection closed')
		})

		connection.on('error', (err) => {
			logger.debug('error:', err)
			connection.close()
		})

		connection.on('open', () => {
			if (!connection) throw new Error("Connection doesn't exist")
			logger.debug('Websocket connection opened')
		})

		this.backendConnection = connection
	}

	terminate() {
		if (this.backendConnection !== undefined) {
			this.frontendConnection.terminate()
			this.frontendConnection.terminate()
		}
		clearTimeout(this.pingTimeoutObject)
		logger.debug(`Closed Backend WS connection ${this.wsSessionId}`)
	}
}

export default {}
