# FrostByte: Freeze Threats, Byte Back

**By Bilash Sarkar, Kate Eads, Verna Lin, and Atqiya Ahmed**

FrostByte is an AI-powered cybersecurity companion that gamifies online safety through real-time threat detection and emotional feedback. FrostByte transforms passive security training into an engaging, memorable experience by giving users a digital pet that reacts to their browsing habits—shivering at danger, celebrating safety, and teaching better practices through empathy rather than fear.

[**Watch Demo**](https://www.youtube.com/watch?v=izmi79SzYJw) | [**View on Devpost**](https://devpost.com/software/frostbyte-your-cyber-companion)

FrostByte is a desktop app with a Chrome extension that monitors your browsing in real-time and responds through an interactive, pixel-art companion. Click a suspicious link? FrostByte freezes and loses health. Practice good habits? It heals, levels up, and cheers you on. Powered by Gemini 2.5 Computer Use for intelligent threat detection and ElevenLabs Voice AI for natural speech, FrostByte doesn't just warn you—it explains what went wrong, why it matters, and how to stay safer. The goal is to create a personalized coach that builds lasting digital safety habits through emotional connection and gamification. Key features include:

- Real-time phishing and malware link detection using Gemini 2.5 Computer Use.
- Voice-based explanations and contextual security guidance with ElevenLabs AI.
- Emotional pet system that evolves based on your security habits.
- Gamified leveling and health mechanics tied to browsing behavior.
- Privacy-first design—all monitoring happens locally.

## Technologies Used

- **React** – Interactive UI for the desktop companion.
- **JavaScript & Node.js** – Core application logic and Chrome extension functionality.
- **Tailwind CSS** – Clean, responsive styling with retro-inspired design.
- **Gemini 2.5 Computer Use API** – Real-time threat detection and contextual understanding.
- **ElevenLabs Voice AI** – Natural, expressive voice responses (Jessica voice, alias "Frost").
- **FastAPI (Python)** – Backend API connecting browser events, AI models, and voice synthesis.
- **Electron** – Desktop application framework.
- **Chrome Extension API** – Browser integration for live monitoring.
- **esbuild** – Fast JavaScript/JSX bundling.
- **Babel** – JSX compilation for React components.
- **Git & GitHub** – Version control and collaboration.

## Setup & Installation

### Prerequisites
- Python 3.8+ (Python 3.11 recommended for stability)
- Node.js 16+ and npm
- Google Chrome
- API Keys: Gemini 2.5 from [Google AI Studio](https://aistudio.google.com/app/apikey) and ElevenLabs from [ElevenLabs](https://elevenlabs.io/)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/frostbyte.git
   cd frostbyte
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   playwright install  # Optional, for Gemini screenshots
   ```

3. **Create `.env` file in backend directory:**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   PORT=8000
   ```

4. **Desktop App Setup:**
   ```bash
   cd ../desktop-app
   npm install
   ```

5. **Chrome Extension Setup:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `chrome-extension` folder from the repository

### Running the Application

You'll need 4 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - CSS Build:**
```bash
cd desktop-app
npx tailwindcss -i ./src/index.css -o ./dist/components/index.css --watch
```

**Terminal 3 - JS Build:**
```bash
cd desktop-app
npx babel src --out-dir dist --extensions .jsx,.js --watch
```

**Terminal 4 - Electron App:**
```bash
cd desktop-app
npm start
```

**Control Monitoring:**
```bash
# Start threat detection
curl -X POST http://localhost:8000/api/monitoring/start

# Stop threat detection
curl -X POST http://localhost:8000/api/monitoring/stop
```

## How It Works

The user experience flows as follows: browse normally while FrostByte's Chrome extension monitors links, downloads, and authentication patterns in real time. When risky behavior is detected, FrostByte reacts emotionally—freezing, shivering, and losing health. FrostByte then uses ElevenLabs to explain the threat in natural language and offer actionable advice. Users can click "Learn More" to have a voice conversation with FrostByte powered by Gemini AI. Safe browsing heals FrostByte and levels it up, reinforcing positive security practices. The emotional connection makes security training memorable and effective.

## Contributions & Learnings

This app was built during Boston University's 24-hour BostonHacks 2025 hackathon, where we won **Best Use of Gemini 2.5 Computer Use**. 

Key accomplishments and challenges include:

- Integrated two major AI systems (Gemini 2.5 + ElevenLabs) for live, voice-based interaction in under 24 hours.
- Designed an emotion and behavior system that turns cybersecurity into something users genuinely connect with.
- Synced Gemini's threat detection with ElevenLabs voice feedback while maintaining natural, contextual responses.
- Handled browser events in real time without compromising performance or user privacy.
- Built a complete desktop app, Chrome extension, and AI backend with multiple bundlers and transpilers.
- Resolved dependency conflicts between FastAPI, Electron, React, and AI SDK versions.
- Created a gamified learning experience that makes security training enjoyable and memorable.

FrostByte represents our belief that the best way to protect people online isn't through fear or lectures—it's through connection, empathy, and making safety feel personal. This project taught us how to combine browser data, AI models, and natural speech into a cohesive user experience, why emotional design matters for learning, and how to build fast under pressure while maintaining code quality. We're excited to continue developing FrostByte with expanded threat detection, enterprise integration, and multi-platform support.

## What's Next

- Expanded threat detection for deepfakes, AI scams, and malicious code.
- Enterprise onboarding tool for new hire security training.
- Adaptive phishing simulations and smart MFA guidance.
- Multiple pet personalities and customization options.
- Desktop and mobile apps for system-wide protection.
- Community features with leaderboards and achievements.

## Troubleshooting

**Backend Issues:**
- Module not found: `pip install google-genai`
- API key not found: Verify `.env` file exists in `backend/` with correct keys
- FastAPI conflict: `pip install --upgrade fastapi uvicorn[standard]`

**Desktop App Issues:**
- Cannot find module 'react': `cd desktop-app && rm -rf node_modules package-lock.json && npm install`
- Blank screen: `npm run build && npm start`
- Import statement error: `npm install --save-dev esbuild && npm run build`

**Chrome Extension Issues:**
- Not loading: Enable Developer mode in `chrome://extensions/` and verify correct folder selected

## Contributing

We're excited to continue developing FrostByte. If you'd like to contribute, please fork the repository and submit a pull request! We're particularly interested in additional threat detection patterns, new pet personalities, performance optimizations, accessibility improvements, and multi-language support.

## License

This project is open source and available under the MIT License.

---

**Team FrostByte:** Bilash Sarkar, Kate Eads, Verna Lin, Atqiya Ahmed

Built during BostonHacks 2025 | Winner: Best Use of Gemini 2.5 Computer Use
