export type WebSocketMessage = {
	message: string
	timestamp: string
	session_id?: string
	from?: string
	raw?: string
	[key: string]: never
}

export type WebSocketMessageData = WebSocketMessage & {
	data: unknown
}

export type WebSocketMessageText = WebSocketMessage & {
	text: string
}
