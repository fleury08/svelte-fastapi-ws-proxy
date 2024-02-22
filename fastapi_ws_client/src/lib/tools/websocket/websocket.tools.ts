import { storeConnected, storeWsConnection, storeWsMessages } from '$lib/stores/websocket.store'
import { browser } from '$app/environment'
import { get } from 'svelte/store'
import type { WebSocketMessage } from '$lib/tools/websocket/websocket.message'

export function closeWebSocketConnection() {
	const conn = get(storeWsConnection)
	conn?.close(4000, 'Connection closed by user')
	storeConnected.set(false)
	storeWsConnection.set(null)
}

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
			handleMessage(JSON.parse(event.data))
		})

		connection.addEventListener('close', (event) => {
			console.log('Connection with tools has been closed.')
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

export function handleMessage(message: WebSocketMessage) {
	storeWsMessages.update((messages) => {
		return [...messages, message]
	})
	console.log(message)
}
