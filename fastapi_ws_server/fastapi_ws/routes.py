import logging
import uuid
from datetime import datetime

from fastapi import WebSocket, WebSocketException, Depends, APIRouter, HTTPException
from fastapi.requests import HTTPConnection, Request
from fastapi.security import OAuth2PasswordBearer
from starlette.status import HTTP_401_UNAUTHORIZED
from starlette.websockets import WebSocketDisconnect

from .connectionmanager import ws_conn_manager

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


async def security_check(connection: HTTPConnection):
    """Security check for websockets and http requests"""
    logging.getLogger(__name__).info(connection)
    if isinstance(connection, WebSocket):
        logging.getLogger(__name__).info("websocket")
        if connection.query_params.get("token") is None:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
        # CUSTOM LOGIC FOR WEBSOCKETS

    if isinstance(connection, Request):
        logging.getLogger(__name__).info("http")
        if connection.headers.get("Authorization", None) is None:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
        # CUSTOM LOGIC FOR HTTP

    return True


# Router for setting up security, globally can be set when initialising `FastAPI`
router_root = APIRouter(dependencies=[Depends(security_check)], tags=["root"],
                        responses={404: {"description": "Not found"}})


@router_root.websocket("/ws")
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


@router_root.get("/message")
async def send_message_to_all():
    return await ws_conn_manager.broadcast(
        {
            "message": "broadcast",
            "from": "server",
            "to": "all",
            "timestamp": datetime.now().isoformat(),
        }
    )


@router_root.get("/message/{session_id}")
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
