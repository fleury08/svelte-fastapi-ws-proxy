import { writable } from 'svelte/store'

import type { WebSocketMessage } from '$lib/client/tools/websocket/websocket.message'

export const storeConnected = writable<boolean>(false)
export const storeWsMessages = writable<WebSocketMessage[]>([])

export const storeWsConnection = writable<WebSocket | null>(null)
