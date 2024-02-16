import logging
import uuid
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketException
from icecream import ic
from starlette.websockets import WebSocketDisconnect, WebSocketState

# Create application
app = FastAPI(title="WebSocket Example")
logging.basicConfig(level=logging.DEBUG)


class ConnectionManager:

    def __init__(self) -> None:
        self.connections = {}

    # async def parseData(self, user_id, data):
    #
    #     data = await data.json()
    #     logging.getLogger(__name__).info("data: %s", data)
    #     return data

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


manager = ConnectionManager()


@app.websocket("/ws")
async def ws(websocket: WebSocket):
    ws_uuid = str(uuid.uuid4())
    try:
        token_id = websocket.query_params.get("token")

        logging.getLogger(__name__).info("token_id: %s", token_id)
        logging.getLogger(__name__).info("new_uuid: %s", ws_uuid)

        # create connection between client and server
        await manager.connect(ws_uuid, websocket)

        # creates a loop for communication
        while True:
            data = await websocket.receive_text()
            logging.getLogger(__name__).info("data: %s", data)
    except WebSocketException as wse:
        logging.getLogger(__name__).error(f"websocket error: {ws_uuid} {wse}")
        await manager.disconnect(ws_uuid)
    except WebSocketDisconnect as wsd:
        logging.getLogger(__name__).error(f"websocket disconnect: {ws_uuid} {wsd}")
        await manager.disconnect(ws_uuid)


@app.get("/test")
async def test_server_send():
    return await manager.broadcast(
        {
            "message": "broadcast",
            "from": "server",
            "to": "all",
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.get("/test/{user_id}")
async def test_server_send(connection_id: str):
    await manager.send_message(
        connection_id,
        {
            "message": "only to connection " + connection_id,
            "from": "server",
            "to": connection_id,
            "timestamp": datetime.now().isoformat(),
        },
    )
