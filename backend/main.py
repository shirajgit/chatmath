from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import json

from database import connect_db, close_db, get_db
from websocket_manager import manager
from routes.math import router as math_router
from models import Message


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="Smart Chat + Math Assistant", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(math_router, prefix="/api")


# ─── WebSocket endpoint ───────────────────────────────────────────────────────

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    db = get_db()

    # 1. Send last 20 messages to the new user
    cursor = db.messages.find().sort("timestamp", -1).limit(20)
    history = []
    async for doc in cursor:
        history.append({
            "type": "message",
            "username": doc["username"],
            "text": doc["text"],
            "timestamp": doc["timestamp"].isoformat(),
        })
    history.reverse()
    for msg in history:
        await manager.send_personal(websocket, msg)

    # 2. Broadcast join notification
    join_event = {
        "type": "system",
        "text": f"{username} joined the chat",
        "timestamp": datetime.utcnow().isoformat(),
    }
    await manager.broadcast(join_event)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            text = data.get("text", "").strip()
            if not text:
                continue

            now = datetime.utcnow()

            # Persist to MongoDB
            doc = {"username": username, "text": text, "timestamp": now}
            await db.messages.insert_one(doc)

            # Broadcast to all
            await manager.broadcast({
                "type": "message",
                "username": username,
                "text": text,
                "timestamp": now.isoformat(),
            })

    except WebSocketDisconnect:
        manager.disconnect(username)
        await manager.broadcast({
            "type": "system",
            "text": f"{username} left the chat",
            "timestamp": datetime.utcnow().isoformat(),
        })
