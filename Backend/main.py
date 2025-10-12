# backend/main.py - MERGED VERSION

import asyncio
import time
import os
import tempfile
from pathlib import Path
from typing import List, Optional

import requests
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.websockets import WebSocketState

# Import your teammate's modules (make sure these files exist)
try:
    from pet_manager import PetManager
    from gemini_computer_use import GeminiComputerUse
    from security_detector import SecurityDetector
    from models import SecurityEvent
    from config import settings
    HAS_GEMINI = True
except ImportError as e:
    print(f"⚠️  Gemini modules not available: {e}")
    HAS_GEMINI = False

# ----------------- FastAPI APP -----------------
app = FastAPI(title="CyberPet Backend - Unified", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PET STATE (Simple version) -----------------
class SimplePetState:
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

# Initialize pet - use advanced PetManager if available, otherwise simple
if HAS_GEMINI:
    security_detector = SecurityDetector()
    gemini_computer_use = GeminiComputerUse()
    pet_manager = PetManager()
    print("✅ Using advanced PetManager with Gemini Computer Use")
else:
    pet_manager = SimplePetState()
    print("✅ Using simple PetState (Gemini not available)")

# ----------------- WebSocket Manager (Unified) -----------------
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        print(f"🔌 WebSocket connected (total: {len(self.active)})")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
            print(f"🔌 WebSocket disconnected (remaining: {len(self.active)})")

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

manager = ConnectionManager()

# Monitoring state (for Gemini Computer Use)
monitoring_active = False
monitoring_task: Optional[asyncio.Task] = None

# ----------------- WebSocket Endpoints -----------------
@app.websocket('/ws')
async def websocket_main(ws: WebSocket):
    """Main WebSocket endpoint for frontend"""
    await manager.connect(ws)
    try:
        # Send initial pet state
        if HAS_GEMINI:
            await ws.send_json({"type": "health_update", "pet_state": pet_manager.get_state()})
        else:
            await ws.send_json({"type": "pet_snapshot", "data": pet_manager.snapshot()})
        
        while True:
            data = await ws.receive_text()
            await ws.send_json({"echo": data})
    except WebSocketDisconnect:
        manager.disconnect(ws)

@app.websocket('/ws/demo')
async def websocket_demo(ws: WebSocket):
    """Legacy WebSocket endpoint for compatibility"""
    await manager.connect(ws)
    try:
        if HAS_GEMINI:
            await manager.broadcast({"type": "health_update", "pet_state": pet_manager.get_state()})
        else:
            await manager.broadcast({"type": "pet_snapshot", "data": pet_manager.snapshot()})
        while True:
            _ = await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)

# ----------------- Pet REST Endpoints -----------------
@app.get("/")
@app.get("/healthz")
async def root():
    """Health check and status"""
    if HAS_GEMINI:
        return {
            "status": "running",
            "message": "CyberPet - Unified Backend with Gemini",
            "pet_state": pet_manager.get_state(),
            "monitoring_active": monitoring_active,
            "gemini_enabled": True
        }
    else:
        return {
            "status": "running", 
            "message": "CyberPet - Simple Backend",
            "state": pet_manager.snapshot(),
            "gemini_enabled": False
        }

@app.get('/pet')
@app.get("/api/pet-state")
def get_pet():
    """Get current pet state"""
    if HAS_GEMINI:
        return pet_manager.get_state()
    else:
        return pet_manager.snapshot()

@app.post('/pet/event')
async def post_event(event: str = Form(...)):
    """Simple event endpoint (legacy)"""
    if HAS_GEMINI:
        severity = 50 if "detected" in event else 10
        pet_state = pet_manager.process_threat_event(severity, event)
    else:
        pet_manager.apply_event(event)
        pet_state = pet_manager.snapshot()
    
    await manager.broadcast({"type": "pet_snapshot", "data": pet_state})
    return pet_state

# ----------------- Gemini Computer Use Endpoints -----------------
if HAS_GEMINI:
    @app.post("/api/security-event")
    async def log_security_event(event: SecurityEvent):
        print(f"\n📨 Event from extension: {event.type} (severity: {event.severity})")
        
        pet_state = pet_manager.process_threat_event(event.severity, event.type)
        
        await manager.broadcast({
            "type": "threat_detected",
            "threat": {
                "threat_type": event.type,
                "confidence": event.severity,
                "explanation": event.metadata.get("reason", "Threat detected"),
                "user_friendly_message": f"⚠️ {event.type.replace('_', ' ').title()}!"
            },
            "pet_state": pet_state
        })
        
        return {"pet_state": pet_state, "should_popup": event.severity > 50}

    @app.post("/api/good-behavior")
    async def log_good_behavior(data: dict):
        time_safe = data.get("time_safe", 60)
        pet_state = pet_manager.process_good_behavior(time_safe)
        await manager.broadcast({"type": "health_update", "pet_state": pet_state})
        return pet_state

    @app.get("/api/events/recent")
    async def get_recent_events():
        return {"events": pet_manager.event_history[-10:]}

    # Monitoring Control
    @app.post("/api/monitoring/start")
    async def start_monitoring_endpoint():
        global monitoring_active, monitoring_task
        
        if monitoring_active:
            return {"status": "already_running", "message": "Monitoring is already active"}
        
        monitoring_active = True
        monitoring_task = asyncio.create_task(monitor_loop())
        
        return {"status": "started", "message": f"Monitoring started - checking every {settings.SCREENSHOT_INTERVAL} seconds"}

    @app.post("/api/monitoring/stop")
    async def stop_monitoring_endpoint():
        global monitoring_active, monitoring_task
        
        if not monitoring_active:
            return {"status": "not_running", "message": "Monitoring is not active"}
        
        monitoring_active = False
        
        if monitoring_task:
            monitoring_task.cancel()
            try:
                await monitoring_task
            except asyncio.CancelledError:
                pass
        
        return {"status": "stopped", "message": "Monitoring stopped"}

    @app.get("/api/monitoring/status")
    async def get_monitoring_status():
        return {
            "monitoring_active": monitoring_active,
            "screenshot_interval": settings.SCREENSHOT_INTERVAL,
            "pet_state": pet_manager.get_state()
        }

    # Test Endpoints
    @app.post("/api/test/url")
    async def test_url(data: dict):
        url = data.get("url", "")
        result = security_detector.analyze_url(url)
        print(f"\n🧪 URL TEST: {url} → {result['threat_type']}")
        return result

    @app.post("/api/test/screenshot")
    async def test_screenshot():
        print("\n🧪 MANUAL SCREENSHOT TEST")
        result = await gemini_computer_use.analyze_and_act()
        return result

    @app.post("/api/test/trigger-threat")
    async def test_trigger_threat(data: dict):
        severity = data.get("severity", 75)
        threat_type = data.get("threat_type", "test_threat")
        
        pet_state = pet_manager.process_threat_event(severity, threat_type)
        
        await manager.broadcast({
            "type": "threat_detected",
            "threat": {
                "threat_type": threat_type,
                "confidence": severity,
                "explanation": "Test threat",
                "user_friendly_message": "Test!"
            },
            "pet_state": pet_state
        })
        
        return {"success": True, "pet_state": pet_state}

    # Demo Control
    @app.post("/api/demo/reset-pet")
    async def reset_pet():
        pet_manager.health = 100
        pet_manager.evolution_stage = 1
        pet_manager.points = 0
        pet_manager.good_behavior_streak = 0
        pet_manager.event_history = []
        pet_manager._save_state()
        
        await manager.broadcast({"type": "health_update", "pet_state": pet_manager.get_state()})
        
        print("\n🔄 Pet reset to default state")
        return {"status": "reset", "pet_state": pet_manager.get_state()}

    @app.post("/api/demo/set-health")
    async def set_health(data: dict):
        health = data.get("health", 100)
        pet_manager.health = max(0, min(100, health))
        pet_manager._save_state()
        
        await manager.broadcast({"type": "health_update", "pet_state": pet_manager.get_state()})
        
        print(f"\n💊 Pet health manually set to {health}")
        return {"status": "updated", "pet_state": pet_manager.get_state()}

    # Background Monitoring
    async def monitor_loop():
        global monitoring_active
        
        print("\n" + "="*60)
        print("🚀 GEMINI 2.5 COMPUTER USE - MONITORING STARTED")
        print(f"   Interval: {settings.SCREENSHOT_INTERVAL} seconds")
        print("="*60)
        
        check_count = 0
        
        try:
            while monitoring_active:
                check_count += 1
                print(f"\n{'='*60}")
                print(f"🔍 Check #{check_count}")
                print(f"{'='*60}")
                
                try:
                    result = await gemini_computer_use.analyze_and_act()
                    
                    if result["threat_detected"]:
                        pet_state = pet_manager.process_threat_event(
                            severity=result["confidence"],
                            threat_type=result["threat_type"]
                        )
                        
                        await manager.broadcast({
                            "type": "threat_detected",
                            "threat": result,
                            "pet_state": pet_state
                        })
                        
                        print(f"\n🚨 ALERT SENT TO FRONTEND")
                    else:
                        pet_state = pet_manager.process_good_behavior(settings.SCREENSHOT_INTERVAL)
                        
                        await manager.broadcast({
                            "type": "health_update",
                            "pet_state": pet_state
                        })
                    
                    print(f"\n⏳ Next check in {settings.SCREENSHOT_INTERVAL} seconds...")
                    await asyncio.sleep(settings.SCREENSHOT_INTERVAL)
                
                except Exception as e:
                    print(f"❌ Check error: {e}")
                    await asyncio.sleep(5)
        
        except asyncio.CancelledError:
            print("\n⏹️  Monitoring stopped by user")
            raise

# ----------------- ElevenLabs Integration -----------------
ELEVEN_BASE = 'https://api.elevenlabs.io/v1'
VOICES_DIR = Path("voices")
VOICES_DIR.mkdir(exist_ok=True)

def _get_api_key() -> Optional[str]:
    return os.environ.get('ELEVENLABS_API_KEY')

def _save_as_latest(binary: bytes, ext: str = ".mp3") -> Path:
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
    key = _get_api_key()
    if not key:
        return JSONResponse({"error": "ELEVENLABS_API_KEY not set"}, status_code=400)
    if fmt not in ('mp3', 'wav'):
        return JSONResponse({"error": "fmt must be 'mp3' or 'wav'"}, status_code=400)
    
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
        return JSONResponse({"error": "No voice_id available"}, status_code=400)
    
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
            tf = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            tf.write(chunks)
            tf.flush()
            tf.close()
            _save_as_latest(chunks, ext=ext)
            media_type = 'audio/mpeg' if fmt == 'mp3' else 'audio/wav'
            return FileResponse(tf.name, media_type=media_type, filename=f"tts{ext}")
    except requests.RequestException as e:
        return JSONResponse({"error": str(e)}, status_code=502)

@app.get("/voice/latest")
def voice_latest():
    cands = sorted(VOICES_DIR.glob("latest.*"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not cands:
        return JSONResponse({"error": "no voice available"}, status_code=404)
    ext = cands[0].suffix.lower()
    media = 'audio/mpeg' if ext == '.mp3' else 'audio/wav'
    return FileResponse(cands[0], media_type=media)

# ----------------- Startup Event -----------------
@app.on_event("startup")
async def startup_event():
    if HAS_GEMINI:
        print("\n✅ Gemini 2.5 Computer Use initialized")
        print("💡 Monitoring is OFF - Use POST /api/monitoring/start to begin")
        print(f"💡 Will check every {settings.SCREENSHOT_INTERVAL} seconds when enabled")
    else:
        print("\n✅ Simple backend initialized (Gemini modules not available)")
    print("🎤 ElevenLabs TTS endpoints available")