from fastapi import WebSocket
from typing import Dict
import json


class ConnectionManager:
    def __init__(self):
        # Maps username -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        self.active_connections.pop(username, None)

    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        data = json.dumps(message)
        dead = []
        for username, ws in self.active_connections.items():
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(username)
        for u in dead:
            self.disconnect(u)

    async def send_personal(self, websocket: WebSocket, message: dict):
        """Send a message to a single client."""
        await websocket.send_text(json.dumps(message))


manager = ConnectionManager()
