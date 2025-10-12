import asyncio, time, os, tempfile
from pathlib import Path
from typing import List, Optional

import requests
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.websockets import WebSocketState

# ----------------- FastAPI APP -----------------
app = FastAPI(title="CyberPet Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# ----------------- PET STATE -----------------
class PetState:
    def __init__(self):
        self.health = 100
        self.mood = "happy"
        self.last_event: Optional[str] = None

    def _recalc(self):
        if self.health <= 0:
            self.mood = "dead"
        elif self.health < 25:
            self.mood = "critical"
        elif self.health < 50:
            self.mood = "sick"
        elif self.health < 75:
            self.mood = "concerned"
        else:
            self.mood = "happy"

    def apply_event(self, et: str):
        delta = 0
        if et in ("phishing_detected", "password_weak", "http_insecure_site"):
            delta = -15
        elif et in ("password_strong", "mfa_enabled", "safe_action"):
            delta = +10
        elif et == "pet_evolve":
            delta = +5
        self.health = max(0, min(100, self.health + delta))
        self.last_event = et
        self._recalc()

    def snapshot(self):
        return {"health": self.health, "mood": self.mood, "last_event": self.last_event}

pet = PetState()

# ----------------- WebSocket manager -----------------
class Manager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        stale = []
        for ws in list(self.active):
            try:
                if ws.application_state == WebSocketState.CONNECTED:
                    await ws.send_json(data)
            except Exception:
                stale.append(ws)
        for s in stale:
            self.disconnect(s)

manager = Manager()

# ----------------- WebSocket endpoint -----------------
# NOTE: your Electron may be using '/ws/demo' – change this path to match your UI.
@app.websocket('/ws/demo')
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        await manager.broadcast({"type": "pet_snapshot", "data": pet.snapshot()})
        while True:
            _ = await ws.receive_text()  # ignore for now
    except WebSocketDisconnect:
        manager.disconnect(ws)

# ----------------- Pet REST endpoints -----------------
@app.get('/pet')
def get_pet():
    return pet.snapshot()

@app.post('/pet/event')
async def post_event(event: str = Form(...)):
    pet.apply_event(event)
    asyncio.create_task(manager.broadcast({"type": "pet_snapshot", "data": pet.snapshot()}))
    return pet.snapshot()

@app.get("/healthz")
def healthz():
    return {"ok": True, "state": pet.snapshot()}

# ----------------- ElevenLabs integration -----------------
ELEVEN_BASE = 'https://api.elevenlabs.io/v1'
VOICES_DIR = Path("voices"); VOICES_DIR.mkdir(exist_ok=True)

def _get_api_key() -> Optional[str]:
    return os.environ.get('ELEVENLABS_API_KEY')

def _save_as_latest(binary: bytes, ext: str = ".mp3") -> Path:
    # Save to voices/latest.ext for Electron to fetch /voice/latest
    latest = VOICES_DIR / f"latest{ext}"
    latest.write_bytes(binary)
    return latest

@app.get('/eleven/voices')
def list_voices():
    key = _get_api_key()
    if not key:
        return JSONResponse({"error": "ELEVENLABS_API_KEY not set"}, status_code=400)
    url = f"{ELEVEN_BASE}/voices"
    headers = {'xi-api-key': key}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        return JSONResponse(r.json())
    except requests.RequestException as e:
        return JSONResponse({"error": str(e)}, status_code=502)

@app.post('/eleven/tts')
async def eleven_tts(text: str = Form(...), voice_id: Optional[str] = Form(None), fmt: str = Form('mp3')):
    """
    Generate TTS via ElevenLabs classic TTS API.
    - returns the audio file AND updates voices/latest.<ext> so your Electron can play /voice/latest
    """
    key = _get_api_key()
    if not key:
        return JSONResponse({"error": "ELEVENLABS_API_KEY not set"}, status_code=400)
    if fmt not in ('mp3', 'wav'):
        return JSONResponse({"error": "fmt must be 'mp3' or 'wav'"}, status_code=400)

    # Choose a voice if not provided
    if not voice_id:
        try:
            vresp = requests.get(f"{ELEVEN_BASE}/voices", headers={'xi-api-key': key}, timeout=10)
            vresp.raise_for_status()
            payload = vresp.json()
            voices = payload.get('voices') if isinstance(payload, dict) else payload
            if isinstance(voices, list) and voices:
                voice_id = voices[0].get('voice_id') or voices[0].get('id')
        except requests.RequestException:
            voice_id = None
    if not voice_id:
        return JSONResponse({"error": "No voice_id available (provide one or ensure your account has voices)."}, status_code=400)

    url = f"{ELEVEN_BASE}/text-to-speech/{voice_id}"
    headers = {
        'xi-api-key': key,
        'Accept': 'audio/mpeg' if fmt == 'mp3' else 'audio/wav',
        'Content-Type': 'application/json',
    }
    payload = {"text": text}

    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=60) as r:
            r.raise_for_status()
            chunks = b''.join(r.iter_content(chunk_size=8192))
            ext = '.mp3' if fmt == 'mp3' else '.wav'
            # Save to a temp file for direct download
            tf = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            tf.write(chunks); tf.flush(); tf.close()
            # Also update latest.* for your Electron app
            _save_as_latest(chunks, ext=ext)
            media_type = 'audio/mpeg' if fmt == 'mp3' else 'audio/wav'
            return FileResponse(tf.name, media_type=media_type, filename=f"tts{ext}")
    except requests.RequestException as e:
        return JSONResponse({"error": str(e)}, status_code=502)

# Convenience endpoint: electron fetches this to play the latest audio produced
@app.get("/voice/latest")
def voice_latest():
    cands = sorted(VOICES_DIR.glob("latest.*"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not cands:
        return JSONResponse({"error":"no voice available"}, status_code=404)
    # infer media type
    ext = cands[0].suffix.lower()
    media = 'audio/mpeg' if ext == '.mp3' else 'audio/wav'
    return FileResponse(cands[0], media_type=media)

@app.get("/healthz")
def healthz():
    return {"ok": True, "state": pet.snapshot()}

