import logging
import uuid

from fastapi import FastAPI
from starlette.routing import Route

from .routes import router_root

logging.basicConfig(level=logging.DEBUG)

# Create application
app = FastAPI(title="WebSocket Server Example")
app.include_router(router_root)


@app.get("/endpoints")
def get_all_endpoints():
    route: Route
    url_list = [{"path": route.path, "name": route.name} for route in app.routes]
    return url_list


@app.get("/random-token")
async def get_random_token():
    token = str(uuid.uuid4())
    return {"token": token}
