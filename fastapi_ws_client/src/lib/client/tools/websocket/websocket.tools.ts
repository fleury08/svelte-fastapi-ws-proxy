import {
	storeConnected,
	storeWsConnection,
	storeWsMessages
} from '$lib/client/stores/websocket.store'
import { browser } from '$app/environment'
import { get } from 'svelte/store'
import type { WebSocketMessage } from '$lib/client/tools/websocket/websocket.message'

export function closeWebSocketConnection() {
	const conn = get(storeWsConnection)
	conn?.close(4000, 'Connection closed by user')
	storeConnected.set(false)
	storeWsConnection.set(null)
}
let connectionSessionId: string
let reconnectionManager: ReturnType<typeof setInterval>

export function createWebSocketConnection(
	url: string,
	wstimeout: number = 30000
): WebSocket | null {
	const connection = browser ? new WebSocket(url) : null

	if (connection) {
		connection.addEventListener('open', () => {
			clearInterval(reconnectionManager)
			console.log('Connecting to the tools')
			storeConnected.set(true)
		})

		connection.addEventListener('message', (event: MessageEvent) => {
			const message = JSON.parse(event.data) as WebSocketMessage
			message.raw = event.data
			handleMessage(message, (message) => {
				if (message.message === 'connected' && message.session_id)
					connectionSessionId = message.session_id
			})
		})

		connection.addEventListener('close', (event) => {
			const message = {
				message: 'disconnected',
				session_id: connectionSessionId
			} as WebSocketMessage
			handleMessage(message)
			storeConnected.set(false)
			storeWsConnection.set(null)
			if (event.code !== 4000) {
				reconnectionManager = setInterval(() => {
					console.log('Trying reconnection to the websockets')
					storeWsConnection.set(createWebSocketConnection(url))
				}, wstimeout + 1000)
			}
		})
	}
	return connection
}

export function handleMessage(
	message: WebSocketMessage,
	callback?: (message: WebSocketMessage) => void
) {
	storeWsMessages.update((messages) => {
		return [message, ...messages]
	})
	if (callback) callback(message)
	console.log(message)
}
