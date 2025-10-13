// desktop-app/src/components/InterventionPopup.jsx - MANUAL + AUTO OPEN
import React, { useEffect, useState } from 'react';

export default function InterventionPopup() {
    const [data, setData] = useState(null);

    useEffect(() => {
        window.electron.onThreatData((receivedData) => {
            console.log('📨 Popup received:', receivedData);
            setData(receivedData);
        });
    }, []);

    const handleClose = () => {
        window.electron.closePopup();
    };

    const handleStartConversation = () => {
        window.electron.startConversation();
        // Close this popup when opening conversation
        window.electron.closePopup();
    };

    const getSeverityColor = (severity) => {
        if (severity >= 80) return 'from-red-600 to-red-800';
        if (severity >= 60) return 'from-orange-500 to-red-600';
        if (severity >= 40) return 'from-yellow-500 to-orange-500';
        return 'from-yellow-400 to-yellow-600';
    };

    const getSeverityText = (severity) => {
        if (severity >= 80) return 'CRITICAL';
        if (severity >= 60) return 'HIGH';
        if (severity >= 40) return 'MEDIUM';
        return 'LOW';
    };

    const getBarColor = (value) => {
        if (value > 70) return 'bg-green-500';
        if (value > 50) return 'bg-yellow-500';
        if (value > 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    if (!data) {
        return (
            <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }} className="bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    const petState = data.petState || {
        health: 100,
        evolution_stage: 1,
        points: 0,
        streak: 0,
        state: 'happy'
    };

    const isThreat = data.isThreat;

    // DASHBOARD MODE (No Threat) - Full screen layout
    if (!isThreat) {
        return (
            <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom right, #1e3a8a, #1f2937, #111827)' }}>
                {/* Header */}
                <div className="text-center p-6">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', display: 'inline-block', transition: 'transform 0.3s' }}>❄️</div>
                    <h1 className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: '0.05em' }}>
                        FrostByte Dashboard
                    </h1>
                    <p className="text-sm" style={{ color: '#93c5fd' }}>
                        Your security companion is watching over you
                    </p>
                </div>

                {/* Pet Stats Panel */}
                <div className="flex-1 p-6 flex flex-col" style={{ minHeight: 0 }}>
                    <div className="flex-1 rounded-xl text-white p-6 flex flex-col" style={{
                        background: 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(75, 85, 99, 0.3)'
                    }}>
                        <h3 className="text-xl font-bold text-center mb-4" style={{
                            background: 'linear-gradient(to right, #4ade80, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            FrostByte Stats
                        </h3>

                        <div className="flex-1 flex flex-col justify-center" style={{ gap: '1.5rem' }}>
                            {/* Health Bar */}
                            <div className="p-4 rounded-lg" style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(55, 65, 81, 0.3)' }}>
                                <div className="flex justify-between mb-3">
                                    <span className="font-semibold" style={{ color: '#e5e7eb' }}>Health</span>
                                    <span className="font-bold text-xl" style={{ color: '#4ade80' }}>{Math.round(petState.health)}%</span>
                                </div>
                                <div className="w-full rounded-full overflow-hidden" style={{ height: '1.25rem', background: 'rgba(55, 65, 81, 0.5)' }}>
                                    <div
                                        className={`h-full transition-all duration-500 ${getBarColor(petState.health)}`}
                                        style={{
                                            width: `${Math.max(0, Math.min(100, petState.health))}%`,
                                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-4 rounded-lg transition-transform hover:scale-105" style={{
                                    background: 'linear-gradient(to bottom right, rgba(55, 65, 81, 0.5), rgba(31, 41, 55, 0.5))',
                                    border: '1px solid rgba(75, 85, 99, 0.3)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                }}>
                                    <div className="text-xs mb-2" style={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stage</div>
                                    <div className="font-bold" style={{ fontSize: '1.875rem', color: '#4ade80', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}>{petState.evolution_stage}</div>
                                </div>
                                <div className="p-4 rounded-lg transition-transform hover:scale-105" style={{
                                    background: 'linear-gradient(to bottom right, rgba(55, 65, 81, 0.5), rgba(31, 41, 55, 0.5))',
                                    border: '1px solid rgba(75, 85, 99, 0.3)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                }}>
                                    <div className="text-xs mb-2" style={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</div>
                                    <div className="font-bold" style={{ fontSize: '1.875rem', color: '#60a5fa', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}>{petState.points}</div>
                                </div>
                                <div className="p-4 rounded-lg transition-transform hover:scale-105" style={{
                                    background: 'linear-gradient(to bottom right, rgba(55, 65, 81, 0.5), rgba(31, 41, 55, 0.5))',
                                    border: '1px solid rgba(75, 85, 99, 0.3)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                }}>
                                    <div className="text-xs mb-2" style={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
                                    <div className="font-bold" style={{ fontSize: '1.875rem', color: '#facc15', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}>{petState.streak}</div>
                                </div>
                            </div>

                            {/* Current State */}
                            <div className="text-center">
                                <div className="inline-block px-4 py-3 rounded-full" style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                                    <span className="text-sm" style={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status: </span>
                                    <span className="font-bold text-xl capitalize text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
                                        {petState.state.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <div className="p-6">
                    <button
                        onClick={handleClose}
                        className="w-full text-white font-bold py-4 rounded-xl transition-all text-lg"
                        style={{
                            background: 'linear-gradient(to right, #374151, #4b5563)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(75, 85, 99, 0.5)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #6b7280)';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(to right, #374151, #4b5563)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        ✓ Close Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // THREAT MODE - Centered card layout
    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={`bg-gradient-to-br ${getSeverityColor(data.severity || 50)} p-6`}>
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
                {/* Threat Header */}
                <div className="text-center mb-4">
                    <div className="text-6xl mb-2">🚨</div>
                    <h1 className="text-3xl font-bold text-red-600 mb-2">
                        FREEZE!
                    </h1>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${data.severity >= 80 ? 'bg-red-600 text-white' :
                        data.severity >= 60 ? 'bg-orange-500 text-white' :
                            data.severity >= 40 ? 'bg-yellow-500 text-black' :
                                'bg-yellow-400 text-black'
                        }`}>
                        {getSeverityText(data.severity || 50)} RISK
                    </div>
                </div>

                {/* Threat Details */}
                {data.type && (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {data.type}
                        </h2>
                        <p className="text-gray-700 text-sm">
                            {data.details || 'A security threat was detected.'}
                        </p>
                        {data.timestamp && (
                            <p className="text-xs text-gray-500 mt-2">
                                Detected: {new Date(data.timestamp).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Pet Stats Panel */}
                <div className="mb-4 p-4 bg-gray-800 rounded-lg text-white">
                    <h3 className="text-lg font-bold text-green-400 mb-3 text-center">
                        FrostByte Stats
                    </h3>

                    <div className="space-y-3">
                        {/* Health Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Health</span>
                                <span className="font-bold">{Math.round(petState.health)}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${getBarColor(petState.health)}`}
                                    style={{ width: `${Math.max(0, Math.min(100, petState.health))}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="bg-gray-700 p-2 rounded">
                                <div className="text-gray-400 text-xs">Stage</div>
                                <div className="font-bold text-green-400">{petState.evolution_stage}</div>
                            </div>
                            <div className="bg-gray-700 p-2 rounded">
                                <div className="text-gray-400 text-xs">Points</div>
                                <div className="font-bold text-blue-400">{petState.points}</div>
                            </div>
                            <div className="bg-gray-700 p-2 rounded">
                                <div className="text-gray-400 text-xs">Streak</div>
                                <div className="font-bold text-yellow-400">{petState.streak}</div>
                            </div>
                        </div>

                        {/* Current State */}
                        <div className="text-center">
                            <span className="text-xs text-gray-400">Status: </span>
                            <span className="font-semibold capitalize">{petState.state.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={handleStartConversation}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                        💬 Learn More
                    </button>
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                        ✓ Dismiss
                    </button>
                </div>

                {/* Warning */}
                <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-sm text-red-800 font-semibold">
                        ⚠️ Your CyberPet's health has been affected!
                    </p>
                </div>
            </div>
        </div>
    );
}