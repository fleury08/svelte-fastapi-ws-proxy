export type WebSocketMessage = {
	message: string
	session_id?: string
	from?: string
	timestamp?: string
	raw?: string
	[key: string]: never
}

export type WebSocketMessageData = WebSocketMessage & {
	data: unknown
}

export type WebSocketMessageText = WebSocketMessage & {
	text: string
}
