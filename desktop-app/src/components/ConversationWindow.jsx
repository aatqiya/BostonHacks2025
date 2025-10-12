import React, { useEffect, useState, useRef } from 'react';


if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
}

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

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    threat_context: threatData
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse = data.response || "I'm not sure how to answer that.";

                addMessage('ai', aiResponse);
                await speakText(aiResponse);
            } else {
                const errorData = await response.json();
                console.error('❌ Chat API error:', errorData);
                const errorMessage = `Sorry, I had trouble processing that. The server said: ${errorData.detail || response.statusText}`;
                addMessage('ai', errorMessage);
            }
        } catch (error) {
            console.error('❌ Chat error:', error);
            addMessage('ai', "Sorry, something went wrong. Please try again.");
        }
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