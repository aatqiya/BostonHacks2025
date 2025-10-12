# backend/chat_handler.py

import os
from typing import Optional, Dict, Any

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False
    print("⚠️  google-generativeai not installed. Chat will use fallback responses.")


class ChatHandler:
    def __init__(self):
        self.conversation_history = []

        if HAS_GEMINI:
            api_key = os.environ.get(
                'GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
                print("✅ Gemini AI initialized for chat")
            else:
                self.model = None
                print("⚠️  GEMINI_API_KEY not found. Using fallback responses.")
        else:
            self.model = None

    def generate_response(self, user_message: str, threat_context: Optional[Dict[str, Any]] = None) -> str:
        """Generate AI response to user's question about security threat"""

        # Build context for Gemini
        system_context = self._build_system_context(threat_context)

        if self.model:
            try:
                # Create full prompt with context
                full_prompt = f"""{system_context}

User Question: {user_message}

Respond as FrostByte, the friendly cybersecurity assistant. Be clear, helpful, and educational. Keep responses concise (2-3 sentences) since they will be spoken aloud."""

                response = self.model.generate_content(full_prompt)
                ai_response = response.text.strip()

                # Store in conversation history
                self.conversation_history.append({
                    "user": user_message,
                    "ai": ai_response
                })

                return ai_response

            except Exception as e:
                print(f"❌ Gemini error: {e}")
                return self._fallback_response(user_message, threat_context)
        else:
            return self._fallback_response(user_message, threat_context)

    def _build_system_context(self, threat_context: Optional[Dict[str, Any]]) -> str:
        """Build system context based on threat information"""

        context = "You are FrostByte, a friendly cybersecurity assistant that helps users understand security threats. "

        if threat_context:
            threat_type = threat_context.get('type', 'Unknown')
            severity = threat_context.get('severity', 50)
            details = threat_context.get('details', '')

            context += f"\n\nCurrent Security Threat Context:"
            context += f"\n- Threat Type: {threat_type}"
            context += f"\n- Severity: {severity}/100"
            if details:
                context += f"\n- Details: {details}"

            context += "\n\nThe user is asking questions about this specific security threat. "
            context += "Help them understand what happened, why it's dangerous, and how to stay safe."

        return context

    def _fallback_response(self, user_message: str, threat_context: Optional[Dict[str, Any]]) -> str:
        """Fallback responses when Gemini is not available"""

        message_lower = user_message.lower()

        # Question detection
        if any(word in message_lower for word in ['what', 'why', 'how', 'when', 'where']):
            if 'phishing' in message_lower or (threat_context and 'phishing' in str(threat_context.get('type', '')).lower()):
                return "Phishing is when attackers try to trick you into giving up passwords or personal information by pretending to be someone trustworthy. Always verify the sender before clicking links or sharing information."

            elif 'password' in message_lower or (threat_context and 'password' in str(threat_context.get('type', '')).lower()):
                return "Weak passwords are easy for hackers to guess. Use long passwords with letters, numbers, and symbols. Never reuse passwords across different sites!"

            elif 'http' in message_lower or 'insecure' in message_lower or (threat_context and 'http' in str(threat_context.get('type', '')).lower()):
                return "HTTP sites don't encrypt your data, which means hackers can see what you're doing. Always look for HTTPS and the padlock icon before entering sensitive information."

            elif 'safe' in message_lower or 'protect' in message_lower:
                return "Stay safe by using strong unique passwords, enabling two-factor authentication, keeping software updated, and being cautious with links and downloads. Trust your instincts!"

            else:
                return "That's a great question! The key to staying secure online is being aware of potential threats and taking preventive measures. Always think before you click!"

        # Acknowledgment
        elif any(word in message_lower for word in ['thanks', 'thank', 'ok', 'okay', 'got it']):
            return "You're welcome! Remember, I'm always here watching out for your security. Stay safe out there!"

        # Help request
        elif any(word in message_lower for word in ['help', 'more', 'explain']):
            threat_type = threat_context.get(
                'type', 'this threat') if threat_context else 'security threats'
            return f"I'm here to help you understand {threat_type} and how to protect yourself. Ask me anything about staying secure online!"

        # Default
        else:
            return "I'm here to help you stay secure online. Feel free to ask me any questions about this security threat or cybersecurity in general!"

    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []


# Global chat handler instance
chat_handler = ChatHandler()
