# gemini_computer_use.py - SIMPLE MOCK VERSION
import asyncio
import random
from typing import Dict, Any

class GeminiComputerUse:
    def __init__(self):
        print("✅ GeminiComputerUse initialized in MOCK mode")
    
    async def analyze_screenshot(self) -> Dict[str, Any]:
        """Simple mock analysis that always works"""
        # Simulate some processing time
        await asyncio.sleep(2)
        
        # For demo purposes, randomly detect threats sometimes
        if random.random() < 0.4:  # 40% chance of threat for demo
            threat_type = random.choice(["phishing_email", "suspicious_website", "fake_login"])
            return {
                "threat_detected": True,
                "threat_type": threat_type,
                "confidence": random.randint(70, 95),
                "explanation": f"Mock {threat_type} detected for demo purposes",
                "user_friendly_message": f"⚠️ Mock {threat_type.replace('_', ' ')} detected!"
            }
        else:
            return {
                "threat_detected": False,
                "threat_type": "none",
                "confidence": 0,
                "explanation": "No threats detected - running in mock mode",
                "user_friendly_message": "✅ Everything looks secure!"
            }