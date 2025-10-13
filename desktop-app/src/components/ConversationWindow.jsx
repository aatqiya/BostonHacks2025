import React, { useEffect, useState, useRef } from 'react';

if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
}

// Hardcoded response mapping
const HARDCODED_RESPONSES = {
    // Greeting patterns
    'hi': "Hi there! I'm here to help you understand this security threat. What would you like to know?",
    'hello': "Hello! I'm FrostByte, your security guide. Feel free to ask me anything about this threat.",
    'hey': "Hey! Ready to learn how to stay safe? Ask me anything!",

    // Question patterns
    'why does this matter': "This matters because cybercriminals are constantly looking for ways to steal your personal information, passwords, and financial data. Even one successful attack can lead to identity theft, drained bank accounts, or compromised accounts. By understanding these threats, you're building your first line of defense against attacks that target millions of people every day.",

    'what should i do': "Here's what you should do right now: First, don't click any links or download any attachments from this suspicious source. Second, delete or report the message. Third, if you've already clicked something, immediately change your passwords and run a security scan. Prevention is always easier than recovery!",

    'how do i stay safe': "Staying safe is easier than you think! Always verify the sender before clicking links, use strong unique passwords for each account, enable two-factor authentication wherever possible, keep your software updated, and trust your instincts - if something feels off, it probably is. Think before you click!",

    'is this dangerous': "Yes, this type of threat can be very dangerous if you're not careful. Attackers use these techniques to steal sensitive information, install malware, or gain unauthorized access to your accounts. However, now that you're aware of it and talking to me, you're already doing the right thing by educating yourself!",

    'what is phishing': "Phishing is like digital fishing - attackers cast out fake emails, messages, or websites as bait, hoping you'll bite. They pretend to be legitimate companies or people you trust to trick you into giving up passwords, credit card numbers, or other sensitive information. The key is learning to spot the hooks before you bite!",

    'how did this happen': "This happened because attackers sent out thousands or even millions of these messages, hoping that even a small percentage of people will fall for it. They use psychological tricks like urgency, fear, or curiosity to make you act without thinking. You're not alone - these attacks target everyone from tech experts to everyday users.",

    'can you help me': "Absolutely! That's exactly what I'm here for. I can explain any security threat in simple terms, guide you through the steps to stay protected, and answer any questions you have. No question is too basic - cybersecurity can be confusing, and I'm here to make it clear. What would you like to know?",

    'what is malware': "Malware is short for 'malicious software' - it's any program designed to harm your computer, steal your data, or give hackers control of your device.Think of it like a digital virus that can spread, hide, and cause damage.Common types include viruses, trojans, ransomware, and spyware.The good news? With awareness and basic precautions, you can avoid most malware!",

    // Gratitude patterns
    'thank you': "You're very welcome! Remember, staying informed is your best defense against cyber threats. Feel free to come back anytime you have security questions. Stay safe out there!",
    'thanks': "My pleasure! Knowledge is power when it comes to cybersecurity. Keep asking questions and stay vigilant!",
    'thank u': "You're welcome! I'm always here to help you navigate the digital world safely. Take care!",

    // Concern patterns
    'i am scared': "I understand it can feel overwhelming, but you're already taking the right steps by learning about these threats.Most attacks are preventable with basic awareness and caution.You've got this, and I'm here to help you every step of the way!",

    'i am worried': "It's natural to feel concerned, but knowledge is your best protection.By being here and asking questions, you're already ahead of most people. Let me help you understand what to watch out for and how to protect yourself. What specific aspect worries you most?",

    // Confusion patterns
    "i don't understand": "No problem at all! Cybersecurity has a lot of jargon that can be confusing. Let me break it down in simpler terms. Which part would you like me to explain more clearly? I'm here to make this easy to understand.",

    'explain more': "Sure! Think of cybersecurity like locking your house. Just as you lock your doors, use different keys for different locks, and don't let strangers in, you need to do the same online. Use strong passwords, don't trust suspicious links, and verify who you're talking to. The basics go a long way in keeping you safe!",

    // Default fallback
    'default': "That's a great question! While I may not have a specific answer for that, the key to staying safe online is staying alert and skeptical. If something seems suspicious, it probably is. Trust your instincts, verify before you click, and never share sensitive information without being absolutely certain who you're talking to."
};

// Function to find matching response
const findResponse = (userMessage) => {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Check for exact matches first
    if (HARDCODED_RESPONSES[normalizedMessage]) {
        return HARDCODED_RESPONSES[normalizedMessage];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(HARDCODED_RESPONSES)) {
        if (key !== 'default' && normalizedMessage.includes(key)) {
            return value;
        }
    }

    // Return default response
    return HARDCODED_RESPONSES['default'];
};

export default function ConversationWindow() {
    const [threatData, setThreatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [textInput, setTextInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        console.log('🎯 ConversationWindow mounted, waiting for threat data...');

        // Receive threat data from main process
        window.electron.onConversationStart((data) => {
            console.log('💬 Conversation started with threat:', data);
            setThreatData(data);

            // Initial AI greeting about the threat
            const initialMessage = generateInitialMessage(data);
            addMessage('ai', initialMessage);

            // Speak the initial message
            speakText(initialMessage);
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateInitialMessage = (data) => {
        const threatType = data.type || 'Unknown Threat';
        const severity = data.severity || 50;

        let message = `Hi! I'm FrostByte, your security assistant. `;

        if (severity >= 80) {
            message += `I detected a critical security threat: ${threatType}. This is very dangerous and could seriously compromise your security. `;
        } else if (severity >= 60) {
            message += `I found a high-risk security issue: ${threatType}. This could put your data at risk. `;
        } else if (severity >= 40) {
            message += `I noticed a medium-level security concern: ${threatType}. You should be careful here. `;
        } else {
            message += `I spotted a potential security issue: ${threatType}. It's worth being aware of. `;
        }

        message += `${data.details || 'Let me explain what happened and how to stay safe.'} What questions do you have?`;

        return message;
    };

    const addMessage = (sender, text) => {
        setMessages(prev => [...prev, { sender, text, timestamp: new Date() }]);
    };

    const speakText = async (text) => {
        setIsAISpeaking(true);
        try {
            const formData = new FormData();
            formData.append('text', text);
            formData.append('fmt', 'mp3');

            const response = await fetch('http://localhost:8000/eleven/tts', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    setIsAISpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                };

                await audio.play();
            } else {
                console.error('❌ TTS failed:', await response.text());
                setIsAISpeaking(false);
            }
        } catch (error) {
            console.error('❌ TTS error:', error);
            setIsAISpeaking(false);
        }
    };

    const handleUserMessage = async (text) => {
        if (!text.trim()) return;

        addMessage('user', text);
        setTextInput('');

        // Get hardcoded response
        const aiResponse = findResponse(text);

        // Add AI message and speak it
        addMessage('ai', aiResponse);
        await speakText(aiResponse);
    };

    const handleClose = () => {
        window.electron.closeConversation();
    };

    if (!threatData) {
        return (
            <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(to bottom right, #1e3a8a, #111827)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>❄️</div>
                <div className="text-white text-xl mb-2">Loading FrostByte...</div>
                <div className="text-sm" style={{ color: '#93c5fd' }}>Preparing your security assistant</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom right, #1e3a8a, #1f2937, #111827)' }}>
            {/* Header */}
            <div className="p-6 text-center" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.3)', background: 'rgba(17, 24, 39, 0.5)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❄️</div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    Talk to FrostByte
                </h1>
                <p className="text-sm" style={{ color: '#93c5fd' }}>
                    Your AI security assistant with voice responses
                </p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-auto p-6" style={{ minHeight: 0 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                animation: 'slideIn 0.3s ease-out'
                            }}
                        >
                            <div className="flex items-start gap-2" style={{ flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    flexShrink: 0,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}>
                                    {msg.sender === 'user' ? '👤' : '❄️'}
                                </div>
                                <div>
                                    <div
                                        className="p-4 rounded-xl"
                                        style={{
                                            background: msg.sender === 'user'
                                                ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                                                : 'linear-gradient(to right, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
                                            color: 'white',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                            border: '1px solid rgba(75, 85, 99, 0.3)'
                                        }}
                                    >
                                        <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>{msg.text}</p>
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: '#9ca3af', textAlign: msg.sender === 'user' ? 'right' : 'left', paddingLeft: msg.sender === 'user' ? 0 : '0.5rem', paddingRight: msg.sender === 'user' ? '0.5rem' : 0 }}>
                                        {msg.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Section */}
            <div className="p-6" style={{ borderTop: '1px solid rgba(75, 85, 99, 0.3)', background: 'rgba(17, 24, 39, 0.5)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Speaking Status */}
                    {isAISpeaking && (
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                {/* Animated Audio Bars */}
                                <div className="flex gap-1 items-end" style={{ height: '24px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: '3px',
                                                background: '#4ade80',
                                                borderRadius: '2px',
                                                animation: `audioBar 0.8s ease-in-out infinite`,
                                                animationDelay: `${i * 0.1}s`,
                                                height: '40%'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>
                                    🔊 FrostByte is speaking...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Text Input + Buttons */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && textInput.trim() && !isAISpeaking) {
                                    handleUserMessage(textInput.trim());
                                }
                            }}
                            placeholder="Type your question..."
                            disabled={isAISpeaking}
                            className="flex-1 text-white py-4 px-6 rounded-xl text-lg"
                            style={{
                                background: 'rgba(31, 41, 55, 0.9)',
                                border: '2px solid rgba(59, 130, 246, 0.5)',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                        />
                        <button
                            onClick={() => handleUserMessage(textInput.trim())}
                            disabled={isAISpeaking || !textInput.trim()}
                            className="text-white font-bold py-4 px-8 rounded-xl transition-all text-lg"
                            style={{
                                background: (isAISpeaking || !textInput.trim())
                                    ? 'linear-gradient(to right, #6b7280, #4b5563)'
                                    : 'linear-gradient(to right, #3b82f6, #2563eb)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                cursor: (!textInput.trim() || isAISpeaking) ? 'not-allowed' : 'pointer',
                                opacity: (!textInput.trim() || isAISpeaking) ? 0.6 : 1
                            }}
                        >
                            Send
                        </button>
                        <button
                            onClick={handleClose}
                            className="text-white font-bold py-4 px-6 rounded-xl transition-all text-lg"
                            style={{
                                background: 'linear-gradient(to right, #374151, #4b5563)',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                border: '1px solid rgba(75, 85, 99, 0.5)'
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes audioBar {
                    0%, 100% { height: 40%; }
                    50% { height: 100%; }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}