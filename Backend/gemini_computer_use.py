# backend/gemini_computer_use.py - FIXED VERSION

from google import genai
from google.genai import types
import pyautogui
import json
from io import BytesIO
from datetime import datetime
from config import settings


class GeminiComputerUse:
    def __init__(self):
        """Initialize Gemini 2.5 Computer Use client"""
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.action_history = []
        print("✅ GeminiComputerUse initialized with real Gemini 2.5")

    async def analyze_and_act(self) -> dict:
        """
        Main monitoring loop:
        1. Take screenshot
        2. Send to Gemini 2.5 Computer Use
        3. Analyze for threats
        4. Return structured result
        """
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 📸 Capturing screen...")

        try:
            # Take screenshot
            screenshot = pyautogui.screenshot()

            # Save for debugging if needed
            if getattr(settings, 'DEBUG_MODE', False):
                screenshot.save('last_screenshot.png')
                print("   Screenshot saved to last_screenshot.png")

            # Convert to bytes for Gemini
            screenshot_bytes = self._image_to_bytes(screenshot)

            print(
                f"[{datetime.now().strftime('%H:%M:%S')}] 🤖 Analyzing with Gemini 2.5 Computer Use...")

            # Create the prompt
            prompt = """Analyze this screenshot for ACTIVE cybersecurity threats happening RIGHT NOW.

ONLY flag these ACTIVE web-based threats:
1. Phishing emails CURRENTLY OPEN in email clients (suspicious sender, urgent language, fake URLs like paypa1.com)
2. Phishing text messages/SMS (suspicious banking/financial texts, fake delivery notifications)
3. Fake login pages CURRENTLY DISPLAYED in browsers (URL doesn't match expected site, suspicious domain)
4. Active suspicious popups ON SCREEN (fake virus warnings, tech support scams, "Your computer is infected")
5. Browser download prompts for suspicious files (.exe, .scr, .zip from unknown sources)
6. HTTP password/credit card forms ACTIVELY being filled out
7. Social engineering messages (fake tech support, urgent account warnings)

EXAMPLES of threat categorization:
- Text message from "HSBC" with suspicious link → "Phishing Text"
- Email from "PayPal" with fake URL → "Phishing Email"
- Browser showing fake "Apple ID" login → "Fake Login Page"
- Popup saying "Your Mac is infected" → "Malicious Popup"
- Download dialog for random .exe file → "Suspicious Download"
- Password form on HTTP site → "Insecure Form"
- Message claiming to be from tech support → "Social Engineering"

IGNORE these safe items:
- Personal files on desktop (videos, documents, photos)
- Normal desktop icons and folders
- Legitimate software applications
- System files and folders
- Personal media files (.mp4, .jpg, .pdf, etc.)
- Apps like Terminal, Finder, VS Code, etc.

Return ONLY a valid JSON object with this EXACT structure (no markdown, no backticks, no other text):
{
    "threat_detected": true or false,
    "threat_type": "Phishing Email" or "Phishing Text" or "Fake Login Page" or "Malicious Popup" or "Suspicious Download" or "Insecure Form" or "Social Engineering" or null,
    "confidence": 0-100,
    "explanation": "Technical explanation of why this is dangerous",
    "user_friendly_message": "Simple, friendly warning message for the user"
}

If no threats detected, return:
{"threat_detected": false, "threat_type": null, "confidence": 0, "explanation": "Screen appears safe", "user_friendly_message": ""}

Be CONSERVATIVE - only flag OBVIOUS, ACTIVE web threats. Desktop files and normal apps are NOT threats."""

            # Configure Gemini for text-only analysis (no computer use tools needed)
            config = types.GenerateContentConfig(
                system_instruction="You are a cybersecurity analyst. Analyze screenshots for security threats and return structured JSON responses. Never take actions, only analyze."
            )

            # Create the content with image and text
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part(
                            inline_data=types.Blob(
                                mime_type="image/png",
                                data=screenshot_bytes
                            )
                        ),
                        types.Part(text=prompt)
                    ]
                )
            ]

            # Call Gemini - Use standard model instead of computer-use model
            response = self.client.models.generate_content(
                model='models/gemini-2.0-flash-exp',  # Changed to standard model
                contents=contents,
                config=config
            )

            # Extract response text
            response_text = ""
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            response_text += part.text

            # Clean up response text
            response_text = response_text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Parse JSON
            result = json.loads(response_text)

            # Apply confidence threshold - only report threats with >70% confidence
            if result.get("threat_detected") and result.get("confidence", 0) < 70:
                print(
                    f"🔍 Low confidence threat ignored: {result.get('threat_type')} ({result.get('confidence')}%)")
                result = {
                    "threat_detected": False,
                    "threat_type": None,
                    "confidence": 0,
                    "explanation": "Low confidence detection ignored",
                    "user_friendly_message": ""
                }

            # Log results
            if result.get("threat_detected"):
                print(f"⚠️  THREAT DETECTED: {result.get('threat_type')}")
                print(f"   Confidence: {result.get('confidence')}%")
                print(f"   Explanation: {result.get('explanation')}")
            else:
                print(f"✅ No threats detected - screen looks safe")

            return result

        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"   Raw response: {response_text[:200]}")
            return {
                "threat_detected": False,
                "threat_type": None,
                "confidence": 0,
                "explanation": f"Error parsing Gemini response: {str(e)}",
                "user_friendly_message": ""
            }
        except Exception as e:
            print(f"❌ Gemini Computer Use error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "threat_detected": False,
                "threat_type": None,
                "confidence": 0,
                "explanation": f"Error: {str(e)}",
                "user_friendly_message": ""
            }

    def _image_to_bytes(self, image) -> bytes:
        """Convert PIL Image to bytes"""
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return buffered.getvalue()
