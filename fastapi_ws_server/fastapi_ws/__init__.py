import logging
import uuid
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketException
from starlette.routing import Route
from starlette.websockets import WebSocketDisconnect

from .connectionmanager import ws_conn_manager

# Create application
app = FastAPI(title="WebSocket Server Example")
logging.basicConfig(level=logging.DEBUG)


@app.websocket("/ws")
async def create_webservice(websocket: WebSocket):
    ws_uuid = str(uuid.uuid4())
    try:
        token_id = websocket.query_params.get("token")

        logging.getLogger(__name__).info("token_id: %s", token_id)
        logging.getLogger(__name__).info("new_uuid: %s", ws_uuid)

        # create connection between client and server
        await ws_conn_manager.connect(ws_uuid, websocket)

        # creates a loop for communication
        while True:
            data = await websocket.receive_text()
            logging.getLogger(__name__).info("data: %s", data)
    except WebSocketException as wse:
        logging.getLogger(__name__).error(f"websocket error: {ws_uuid} {wse}")
        await ws_conn_manager.disconnect(ws_uuid)
    except WebSocketDisconnect as wsd:
        logging.getLogger(__name__).error(f"websocket disconnect: {ws_uuid} {wsd}")
        await ws_conn_manager.disconnect(ws_uuid)


@app.get("/message")
async def send_message_to_all():
    return await ws_conn_manager.broadcast(
        {
            "message": "broadcast",
            "from": "server",
            "to": "all",
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.get("/message/{session_id}")
async def send_message_to_user(session_id: str):
    await ws_conn_manager.send_message(
        session_id,
        {
            "message": "only to connection " + session_id,
            "from": "server",
            "to": session_id,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.get("/random-token")
async def get_random_token():
    token = str(uuid.uuid4())
    return {"token": token}


@app.get("/endpoints")
def get_all_endpoints():
    route: Route
    url_list = [{"path": route.path, "name": route.name} for route in app.routes]
    return url_list
