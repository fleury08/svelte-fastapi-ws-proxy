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
	wstimeout: number = 30000,
	protocol: string | string[] | undefined = undefined
): WebSocket | null {
	const connection = browser ? new WebSocket(url, protocol) : null
	console.log('URL:', url)
	if (connection) {
		connection.addEventListener('open', () => {
			clearInterval(reconnectionManager)
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
				message: connectionSessionId ? 'disconnected' : 'unavailable',
				timestamp: new Date().toISOString(),
				session_id: connectionSessionId
			} as WebSocketMessage
			clearInterval(reconnectionManager)
			handleMessage(message)
			storeConnected.set(false)
			storeWsConnection.set(null)
			if (event.code !== 4000) {
				reconnectionManager = setInterval(() => {
					storeWsConnection.set(createWebSocketConnection(url, wstimeout, protocol))
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
	storeWsMessages.update((messages: WebSocketMessage[]) => {
		return [message, ...messages]
	})
	if (callback) callback(message)
}
