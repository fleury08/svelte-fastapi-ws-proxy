import logging
from datetime import datetime

from starlette.websockets import WebSocket, WebSocketState


class ConnectionManager:

    def __init__(self) -> None:
        self.connections = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id] = websocket
        await self.send_message(
            user_id,
            {
                "message": "connected",
                "session_id": user_id,
                "from": "server",
                "timestamp": datetime.now().isoformat(),
            },
        )

    async def disconnect(self, user_id):
        websocket: WebSocket = self.connections[user_id]
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()
        self.connections[user_id] = None
        del self.connections[user_id]

    async def broadcast(self, message):
        for user_id in self.connections:
            await self.send_message(user_id, message)
        return {"user_ids": list(self.connections.keys()), "message": message}

    async def send_messages(self, user_ids, message):
        for user_id in user_ids:
            await self.send_message(user_id, message)

    async def send_message(self, user_id, message):
        websocket: WebSocket = self.connections[user_id]
        if (
            websocket is not None
            and websocket.client_state != WebSocketState.DISCONNECTED
        ):
            logging.getLogger(__name__).info(
                f"sending message to {user_id} : {message}"
            )
            await websocket.send_json(message)
        else:
            logging.getLogger(__name__).error(
                f"cannot send message to {user_id} : {message}"
            )

ws_conn_manager = ConnectionManager()