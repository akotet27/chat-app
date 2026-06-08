from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from cryptography.fernet import Fernet
from typing import Dict, List
import json

app = FastAPI()


@app.get("/api/users")
def get_users():
    return {
        "users": usernames,
        "total": len(usernames),
        "encrypted": list(users.values())
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ENCRYPTION ──────────────────────────────────────────
KEY = Fernet.generate_key()
cipher = Fernet(KEY)


def encrypt(text: str) -> str:
    return cipher.encrypt(text.encode()).decode()


def decrypt(text: str) -> str:
    return cipher.decrypt(text.encode()).decode()


# ── STORAGE ─────────────────────────────────────────────
users: Dict[str, str] = {}        # { username: encrypted_username }
usernames: List[str] = []          # plain array of usernames ← required
group_messages: List[dict] = []
private_messages: Dict[str, List[dict]] = {}
msg_counter = 1

# ── CONNECTION MANAGER ──────────────────────────────────


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, username: str, ws: WebSocket):
        await ws.accept()
        self.active[username] = ws

    def disconnect(self, username: str):
        if username in self.active:
            del self.active[username]

    async def send_to(self, username: str, data: dict):
        if username in self.active:
            try:
                await self.active[username].send_text(json.dumps(data))
            except:
                self.disconnect(username)

    async def broadcast(self, data: dict, exclude: str = None):
        for username, ws in list(self.active.items()):
            if username != exclude:
                try:
                    await ws.send_text(json.dumps(data))
                except:
                    self.disconnect(username)

    def get_online_users(self):
        return list(self.active.keys())


manager = ConnectionManager()

# ── WEBSOCKET ───────────────────────────────────────────


@app.websocket("/ws/{username}")
async def websocket_endpoint(ws: WebSocket, username: str):
    global msg_counter

    await manager.connect(username, ws)
    users[username] = encrypt(username)
    # add to usernames array if not already there
    if username not in usernames:
        usernames.append(username)

    await manager.broadcast({
        "type": "user_joined",
        "username": username,
        "users": manager.get_online_users()
    })

    history = []
    for msg in group_messages:
        history.append({
            "id": msg["id"],
            "from": msg["from"],
            "text": decrypt(msg["text_encrypted"]),
            "text_encrypted": msg["text_encrypted"],
            "timestamp": msg["timestamp"],
            "reactions": msg["reactions"],
        })

    await manager.send_to(username, {
        "type": "history",
        "messages": history
    })

    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "group_message":
                text = data.get("text", "")
                encrypted_text = encrypt(text)
                msg = {
                    "id": msg_counter,
                    "from": username,
                    "text_encrypted": encrypted_text,
                    "timestamp": data.get("timestamp", ""),
                    "reactions": {},
                    "room": "general"
                }
                group_messages.append(msg)
                msg_counter += 1
                await manager.broadcast({
                    "type": "group_message",
                    "id": msg["id"],
                    "from": username,
                    "text": text,
                    "text_encrypted": encrypted_text,
                    "timestamp": msg["timestamp"],
                    "reactions": {}
                })

            elif msg_type == "private_message":
                to = data.get("to")
                text = data.get("text", "")
                encrypted_text = encrypt(text)
                room_key = "_".join(sorted([username, to]))
                if room_key not in private_messages:
                    private_messages[room_key] = []
                msg = {
                    "id": msg_counter,
                    "from": username,
                    "to": to,
                    "text_encrypted": encrypted_text,
                    "timestamp": data.get("timestamp", ""),
                }
                private_messages[room_key].append(msg)
                msg_counter += 1
                payload = {
                    "type": "private_message",
                    "id": msg["id"],
                    "from": username,
                    "to": to,
                    "text": text,
                    "text_encrypted": encrypted_text,
                    "timestamp": msg["timestamp"],
                }
                await manager.send_to(to, payload)
                await manager.send_to(username, payload)

            elif msg_type == "typing":
                to = data.get("to", "general")
                if to == "general":
                    await manager.broadcast({
                        "type": "typing",
                        "from": username,
                        "room": "general"
                    }, exclude=username)
                else:
                    await manager.send_to(to, {
                        "type": "typing",
                        "from": username,
                        "room": to
                    })

            elif msg_type == "stop_typing":
                to = data.get("to", "general")
                if to == "general":
                    await manager.broadcast({
                        "type": "stop_typing",
                        "from": username,
                        "room": "general"
                    }, exclude=username)
                else:
                    await manager.send_to(to, {
                        "type": "stop_typing",
                        "from": username,
                        "room": to
                    })

            elif msg_type == "reaction":
                msg_id = data.get("message_id")
                emoji = data.get("emoji")
                for msg in group_messages:
                    if msg["id"] == msg_id:
                        if emoji not in msg["reactions"]:
                            msg["reactions"][emoji] = []
                        if username in msg["reactions"][emoji]:
                            msg["reactions"][emoji].remove(username)
                        else:
                            msg["reactions"][emoji].append(username)
                        await manager.broadcast({
                            "type": "reaction",
                            "message_id": msg_id,
                            "reactions": msg["reactions"]
                        })
                        break

            elif msg_type == "read":
                from_user = data.get("from")
                await manager.send_to(from_user, {
                    "type": "read",
                    "by": username
                })

            elif msg_type == "fetch_private":
                with_user = data.get("with")
                room_key = "_".join(sorted([username, with_user]))
                history = private_messages.get(room_key, [])
                decrypted_history = []
                for msg in history:
                    decrypted_history.append({
                        "id": msg["id"],
                        "from": msg["from"],
                        "to": msg["to"],
                        "text": decrypt(msg["text_encrypted"]),
                        "text_encrypted": msg["text_encrypted"],
                        "timestamp": msg["timestamp"],
                    })
                await manager.send_to(username, {
                    "type": "private_history",
                    "with": with_user,
                    "messages": decrypted_history
                })

    except WebSocketDisconnect:
        manager.disconnect(username)
        # keep username in array — they were here
        # remove from online users only
        await manager.broadcast({
            "type": "user_left",
            "username": username,
            "users": manager.get_online_users()
        })
