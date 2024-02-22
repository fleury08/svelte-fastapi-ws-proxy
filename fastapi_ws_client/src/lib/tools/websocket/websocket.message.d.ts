export type WebSocketMessage = {
	message: string
	session_id?: string
	from?: string
	timestamp?: string
	[key: string]: any
}

export type WebSocketMessageData = WebSocketMessage & {
	data: any
}

export type WebSocketMessageText = WebSocketMessage & {
	text: string
}
