from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from cryptography.fernet import Fernet
from typing import Dict, List, Optional, Any
import json
import os
import re
import hashlib
import time
import binascii
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ENCRYPTION ──────────────────────────────────────────
KEY = os.getenv("FERNET_KEY")
if not KEY:
    KEY = Fernet.generate_key()
else:
    KEY = KEY.encode()
cipher = Fernet(KEY)


def encrypt(text: str) -> str:
    return cipher.encrypt(text.encode()).decode()


def decrypt(text: str) -> str:
    return cipher.decrypt(text.encode()).decode()


# ── AUTH HELPERS ────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), 200_000).hex()
    return f"pbkdf2_sha256${salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        _, salt, digest = password_hash.split("$", 2)
        candidate = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt), 200_000).hex()
        return candidate == digest
    except (ValueError, binascii.Error):
        return False


def validate_username(value: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9]{2,20}", value or ""))


def validate_email(value: str) -> bool:
    return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value or ""))


def validate_phone(value: str) -> bool:
    return bool(re.fullmatch(r"\+?[0-9\s()-]{7,15}", value or ""))


def validate_password(value: str) -> tuple[bool, List[str]]:
    errors: List[str] = []
    if len(value or "") < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", value or ""):
        errors.append("Password must include an uppercase letter")
    if not re.search(r"[a-z]", value or ""):
        errors.append("Password must include a lowercase letter")
    if not re.search(r"\d", value or ""):
        errors.append("Password must include a number")
    if not re.search(r"[^A-Za-z0-9]", value or ""):
        errors.append("Password must include a special character")
    return (not errors, errors)


def get_password_strength(password: str) -> str:
    if len(password or "") < 8:
        return "weak"
    score = 0
    if re.search(r"[a-z]", password):
        score += 1
    if re.search(r"[A-Z]", password):
        score += 1
    if re.search(r"\d", password):
        score += 1
    if re.search(r"[^A-Za-z0-9]", password):
        score += 1
    if len(password) >= 12:
        score += 1
    return ["weak", "fair", "strong", "very strong"][min(score, 3)]


def validate_registration_payload(data: Dict[str, Any]) -> tuple[bool, List[str]]:
    errors: List[str] = []
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()

    if not validate_username(username):
        errors.append(
            "Username must be 2-20 characters and contain letters or numbers only")
    if not validate_email(email):
        errors.append("Email must be a valid address")
    if not validate_phone(phone):
        errors.append("Phone number must be a valid format")
    password_ok, password_errors = validate_password(password)
    if not password_ok:
        errors.extend(password_errors)

    return (not errors, errors)


def validate_login_payload(data: Dict[str, Any]) -> tuple[bool, List[str]]:
    errors: List[str] = []
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not validate_email(email):
        errors.append("Email must be a valid address")
    if not password:
        errors.append("Password is required")
    return (not errors, errors)


def create_channel(name: str, created_by: str) -> dict:
    slug = re.sub(r"[^a-z0-9]+", "-",
                  (name or "").strip().lower()).strip("-") or "channel"
    existing = next((c for c in channels if c["name"] == slug), None)
    if existing:
        return existing

    channel = {
        "id": str(uuid.uuid4())[:8],
        "name": slug,
        "created_by": created_by,
        "created_at": time.strftime("%H:%M"),
    }
    channels.append(channel)
    channel_messages[slug] = []
    return channel


def get_current_user(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    user = session_tokens.get(token)
    if not user:
        return None
    return user


def serialize_message(msg: dict, decrypt_text: bool = True) -> dict:
    payload = {
        "id": msg.get("id"),
        "from": msg.get("from"),
        "timestamp": msg.get("timestamp", ""),
        "reactions": msg.get("reactions", {}),
        "pinned": msg.get("pinned", False),
        "edited": msg.get("edited", False),
        "room": msg.get("room", "general"),
    }
    if "to" in msg:
        payload["to"] = msg["to"]
    if "attachment" in msg:
        payload["attachment"] = msg["attachment"]
    if "forwarded_from" in msg:
        payload["forwarded_from"] = msg["forwarded_from"]
    if "text_encrypted" in msg and decrypt_text:
        payload["text"] = decrypt(msg["text_encrypted"])
    elif "text" in msg:
        payload["text"] = msg["text"]
    payload["text_encrypted"] = msg.get("text_encrypted")
    return payload


def serialize_channel_history(room: str) -> List[dict]:
    return [serialize_message(msg) for msg in channel_messages.get(room, [])]


# ── STORAGE ─────────────────────────────────────────────
users: Dict[str, str] = {}
usernames: List[str] = []
user_accounts: Dict[str, dict] = {}
session_tokens: Dict[str, dict] = {}
channels: List[dict] = [{"id": "general", "name": "general",
                         "created_by": "system", "created_at": time.strftime("%H:%M")}]
channel_messages: Dict[str, List[dict]] = {"general": []}
private_messages: Dict[str, List[dict]] = {}
last_seen: Dict[str, str] = {}
msg_counter = 1


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}
        self.auth_by_ws: Dict[WebSocket, str] = {}

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
            except Exception:
                self.disconnect(username)

    async def broadcast(self, data: dict, exclude: Optional[str] = None):
        for username, ws in list(self.active.items()):
            if username != exclude:
                try:
                    await ws.send_text(json.dumps(data))
                except Exception:
                    self.disconnect(username)

    def get_online_users(self):
        return list(self.active.keys())


manager = ConnectionManager()


@app.get("/api/users")
def get_users():
    return {
        "users": usernames,
        "total": len(usernames),
        "encrypted": list(users.values()),
    }


@app.post("/api/register")
def register(payload: dict):
    valid, errors = validate_registration_payload(payload)
    if not valid:
        raise HTTPException(status_code=400, detail=errors)

    username = payload.get("username", "").strip()
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    phone = payload.get("phone", "").strip()

    if username in user_accounts or email in user_accounts:
        raise HTTPException(status_code=409, detail=[
                            "That username or email is already in use"])

    user = {
        "id": str(uuid.uuid4()),
        "username": username,
        "email": email,
        "phone": phone,
        "password_hash": hash_password(password),
        "created_at": time.time(),
    }
    user_accounts[username] = user
    user_accounts[email] = user
    usernames.append(username)
    users[username] = encrypt(username)

    token = str(uuid.uuid4())
    session_tokens[token] = user

    return {
        "ok": True,
        "token": token,
        "user": {
            "username": user["username"],
            "email": user["email"],
            "phone": user["phone"],
            "password_strength": get_password_strength(password),
        },
    }


@app.post("/api/login")
def login(payload: dict):
    valid, errors = validate_login_payload(payload)
    if not valid:
        raise HTTPException(status_code=400, detail=errors)

    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    user = None
    for account in user_accounts.values():
        if account.get("email") == email:
            user = account
            break

    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail=[
                            "Invalid email or password"])

    token = str(uuid.uuid4())
    session_tokens[token] = user
    return {
        "ok": True,
        "token": token,
        "user": {
            "username": user["username"],
            "email": user["email"],
            "phone": user["phone"],
        },
    }


@app.get("/api/me")
def get_me(authorization: Optional[str] = Header(default=None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail=["Unauthenticated"])
    return {"ok": True, "user": {"username": user["username"], "email": user["email"], "phone": user["phone"]}}


@app.get("/api/channels")
def get_channels():
    return {"channels": channels}


@app.post("/api/channels")
def create_channel_endpoint(payload: dict):
    name = (payload.get("name") or "").strip()
    created_by = (payload.get("created_by") or "system").strip()
    if not name:
        raise HTTPException(status_code=400, detail=[
                            "Channel name is required"])
    channel = create_channel(name, created_by)
    return {"ok": True, "channel": channel}


@app.websocket("/ws/{username}")
async def websocket_endpoint(ws: WebSocket, username: str):
    global msg_counter

    await manager.connect(username, ws)
    users[username] = encrypt(username)
    if username not in usernames:
        usernames.append(username)

    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "auth":
                token = data.get("token")
                current_user = get_current_user(token)
                if current_user:
                    effective_name = current_user["username"]
                    manager.active.pop(username, None)
                    manager.active[effective_name] = ws
                    manager.auth_by_ws[ws] = effective_name
                    users[effective_name] = encrypt(effective_name)
                    if effective_name not in usernames:
                        usernames.append(effective_name)
                    last_seen[effective_name] = time.strftime("%H:%M")
                    await manager.send_to(effective_name, {"type": "auth_ok", "user": current_user})
                    await manager.send_to(effective_name, {"type": "channels_list", "channels": channels})
                    await manager.send_to(effective_name, {"type": "history", "messages": serialize_channel_history("general")})
                    await manager.broadcast({"type": "user_joined", "username": effective_name, "users": manager.get_online_users()}, exclude=effective_name)
                    await manager.send_to(effective_name, {"type": "user_joined", "username": effective_name, "users": manager.get_online_users()})
                    continue

            if msg_type == "group_message" or msg_type == "channel_message":
                room = data.get("room", "general")
                text = data.get("text", "")
                encrypted_text = encrypt(text)
                sender = manager.auth_by_ws.get(ws, username)
                msg = {
                    "id": msg_counter,
                    "from": sender,
                    "text_encrypted": encrypted_text,
                    "timestamp": data.get("timestamp", time.strftime("%H:%M")),
                    "reactions": {},
                    "room": room,
                    "pinned": False,
                    "edited": False,
                }
                channel_messages.setdefault(room, []).append(msg)
                msg_counter += 1
                payload = serialize_message(msg)
                payload["type"] = "group_message"
                payload["room"] = room
                await manager.broadcast(payload)

            elif msg_type == "private_message":
                sender = manager.auth_by_ws.get(ws, username)
                to = data.get("to")
                text = data.get("text", "")
                encrypted_text = encrypt(text)
                room_key = "_".join(sorted([sender, to]))
                if room_key not in private_messages:
                    private_messages[room_key] = []
                msg = {
                    "id": msg_counter,
                    "from": sender,
                    "to": to,
                    "text_encrypted": encrypted_text,
                    "timestamp": data.get("timestamp", time.strftime("%H:%M")),
                }
                private_messages[room_key].append(msg)
                msg_counter += 1
                payload = serialize_message(msg)
                payload["type"] = "private_message"
                await manager.send_to(to, payload)
                await manager.send_to(sender, payload)

            elif msg_type == "typing":
                sender = manager.auth_by_ws.get(ws, username)
                to = data.get("to", "general")
                if to == "general":
                    await manager.broadcast({"type": "typing", "from": sender, "room": "general"}, exclude=sender)
                else:
                    await manager.send_to(to, {"type": "typing", "from": sender, "room": to})

            elif msg_type == "stop_typing":
                sender = manager.auth_by_ws.get(ws, username)
                to = data.get("to", "general")
                if to == "general":
                    await manager.broadcast({"type": "stop_typing", "from": sender, "room": "general"}, exclude=sender)
                else:
                    await manager.send_to(to, {"type": "stop_typing", "from": sender, "room": to})

            elif msg_type == "reaction":
                sender = manager.auth_by_ws.get(ws, username)
                room = data.get("room", "general")
                msg_id = data.get("message_id")
                emoji = data.get("emoji")
                for msg in channel_messages.setdefault(room, []):
                    if msg["id"] == msg_id:
                        if emoji not in msg["reactions"]:
                            msg["reactions"][emoji] = []
                        if sender in msg["reactions"][emoji]:
                            msg["reactions"][emoji].remove(sender)
                        else:
                            msg["reactions"][emoji].append(sender)
                        await manager.broadcast({"type": "reaction", "message_id": msg_id, "room": room, "reactions": msg["reactions"]})
                        break

            elif msg_type == "voice_note":
                sender = manager.auth_by_ws.get(ws, username)
                to = data.get("to")
                payload = {
                    "type": "voice_note",
                    "id": msg_counter,
                    "from": sender,
                    "to": to,
                    "audio": data.get("audio"),
                    "duration": data.get("duration", "0:00"),
                    "timestamp": data.get("timestamp", time.strftime("%H:%M")),
                }
                msg_counter += 1
                await manager.send_to(to, payload)
                await manager.send_to(sender, payload)

            elif msg_type == "fetch_private":
                sender = manager.auth_by_ws.get(ws, username)
                with_user = data.get("with")
                room_key = "_".join(sorted([sender, with_user]))
                history = private_messages.get(room_key, [])
                decrypted_history = []
                for msg in history:
                    decrypted_history.append(serialize_message(msg))
                await manager.send_to(sender, {"type": "private_history", "with": with_user, "messages": decrypted_history})

            elif msg_type == "create_channel":
                sender = manager.auth_by_ws.get(ws, username)
                channel = create_channel(data.get("name", ""), sender)
                await manager.broadcast({"type": "channel_created", "channel": channel})
                await manager.send_to(sender, {"type": "channel_created", "channel": channel})

            elif msg_type == "fetch_channel_history":
                sender = manager.auth_by_ws.get(ws, username)
                room = data.get("room", "general")
                await manager.send_to(sender, {"type": "channel_history", "room": room, "messages": serialize_channel_history(room)})

            elif msg_type == "edit_message":
                sender = manager.auth_by_ws.get(ws, username)
                room = data.get("room", "general")
                message_id = data.get("message_id")
                new_text = data.get("text", "")
                for msg in channel_messages.setdefault(room, []):
                    if msg["id"] == message_id and msg.get("from") == sender:
                        msg["text_encrypted"] = encrypt(new_text)
                        msg["edited"] = True
                        await manager.broadcast({"type": "message_edited", "room": room, "message": serialize_message(msg)})
                        break

            elif msg_type == "delete_message":
                sender = manager.auth_by_ws.get(ws, username)
                room = data.get("room", "general")
                message_id = data.get("message_id")
                updated = []
                for msg in channel_messages.setdefault(room, []):
                    if msg["id"] == message_id and msg.get("from") == sender:
                        continue
                    updated.append(msg)
                channel_messages[room] = updated
                await manager.broadcast({"type": "message_deleted", "room": room, "message_id": message_id})

            elif msg_type == "pin_message":
                room = data.get("room", "general")
                message_id = data.get("message_id")
                for msg in channel_messages.setdefault(room, []):
                    if msg["id"] == message_id:
                        msg["pinned"] = not msg.get("pinned", False)
                        await manager.broadcast({"type": "message_pinned", "room": room, "message": serialize_message(msg)})
                        break

            elif msg_type == "forward_message":
                sender = manager.auth_by_ws.get(ws, username)
                room = data.get("room", "general")
                target_room = data.get("target_room")
                message_id = data.get("message_id")
                for msg in channel_messages.setdefault(room, []):
                    if msg["id"] == message_id:
                        forwarded = dict(msg)
                        forwarded["id"] = msg_counter
                        forwarded["from"] = sender
                        forwarded["room"] = target_room
                        forwarded["forwarded_from"] = msg.get("id")
                        forwarded["text_encrypted"] = encrypt(
                            decrypt(msg.get("text_encrypted", "")))
                        channel_messages.setdefault(
                            target_room, []).append(forwarded)
                        msg_counter += 1
                        await manager.broadcast({"type": "message_forwarded", "room": target_room, "message": serialize_message(forwarded)})
                        break

            elif msg_type == "file_message":
                sender = manager.auth_by_ws.get(ws, username)
                room = data.get("room", "general")
                attachment = data.get("attachment")
                text = data.get("text", "")
                encrypted_text = encrypt(text)
                msg = {
                    "id": msg_counter,
                    "from": sender,
                    "text_encrypted": encrypted_text,
                    "timestamp": data.get("timestamp", time.strftime("%H:%M")),
                    "reactions": {},
                    "room": room,
                    "pinned": False,
                    "edited": False,
                    "attachment": attachment,
                }
                channel_messages.setdefault(room, []).append(msg)
                msg_counter += 1
                payload = serialize_message(msg)
                payload["type"] = "group_message"
                payload["room"] = room
                await manager.broadcast(payload)

            elif msg_type == "read":
                sender = manager.auth_by_ws.get(ws, username)
                last_seen[sender] = time.strftime("%H:%M")
                await manager.send_to(sender, {"type": "last_seen", "username": sender, "at": last_seen[sender]})

    except WebSocketDisconnect:
        username_key = manager.auth_by_ws.get(ws, username)
        if username_key:
            manager.disconnect(username_key)
            await manager.broadcast({"type": "user_left", "username": username_key, "users": manager.get_online_users()})
        else:
            manager.disconnect(username)
            await manager.broadcast({"type": "user_left", "username": username, "users": manager.get_online_users()})
