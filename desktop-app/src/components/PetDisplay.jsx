import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Define the WebSocket server URL (Match this to Person 1's backend setup)
const SOCKET_SERVER_URL = 'http://localhost:3001'; 

// Use this for a simple visual mapping (replace with actual image later)
const getPetVisual = (mood) => {
    switch (mood) {
        case 'happy': return '😊';
        case 'sad': return '😢';
        case 'alert': return '🚨';
        default: return '😐';
    }
};

// Use this for a simple HealthBar color (replace with a dedicated component later)
const getBarColor = (value) => {
    if (value > 70) return 'bg-green-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-red-500';
};


// 1. Create the main pet React component (and default export)
export default function PetDisplay() {
    
    // 4. Set up local petState
    const [petState, setPetState] = useState({
        health: 100,
        happiness: 100,
        mood: 'happy',
        stage: 'egg',
        points: 0,
    });

    // 2. Connect to the backend WebSocket & 3. Set up event listeners
    useEffect(() => {
        // Connect to the WebSocket server
        const socket = io(SOCKET_SERVER_URL);

        // 3. Set up event listeners: 'health_update' and 'threat_detected'
        
        // Listener for pet status updates
        socket.on('health_update', (data) => {
            console.log('Received health update:', data);
            
            // 4. Update the local petState
            setPetState(prevState => ({
                ...prevState,
                health: data.health,
                happiness: data.happiness,
                points: data.points,
                mood: data.mood,
                stage: data.stage
            }));
        });

        // Listener for threat detection
        socket.on('threat_detected', (threatData) => {
            console.warn('Threat Detected:', threatData);
            
            // Set pet mood to alert
            setPetState(prevState => ({
                ...prevState,
                mood: 'alert'
            }));

            // 5. Call the popup function (via Electron IPC/Preload)
            if (window.electron && window.electron.showIntervention) {
                window.electron.showIntervention(threatData);
            } else {
                console.error("Electron IPC bridge not available.");
            }
        });

        // Clean up connection when component unmounts
        return () => socket.disconnect();
    }, []); // Empty dependency array ensures this runs only once

    // 6. Integrate HealthBar and getPetImage (Basic UI structure)
    return (
        <div className="w-48 h-60 p-3 bg-gray-900/90 backdrop-blur-sm border border-green-500 rounded-lg shadow-xl flex flex-col items-center">
            
            <h2 className="text-sm text-green-500 font-semibold mb-1">CyberPet Guardian</h2>
            <p className="text-xs text-gray-400">Score: {petState.points}</p>

            {/* Pet Visual */}
            <div className={`text-6xl my-2 transition-transform duration-300 ${petState.mood === 'alert' ? 'animate-pulse' : ''}`}>
                {getPetVisual(petState.mood)}
            </div>

            {/* Status Bars */}
            <div className="w-full space-y-2 mt-2">
                
                {/* Health Bar */}
                <div className="text-xs text-gray-300">Health ({petState.health}%)</div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getBarColor(petState.health)}`}
                        style={{ width: `${petState.health}%` }}
                    ></div>
                </div>

                {/* Happiness Bar (Example) */}
                <div className="text-xs text-gray-300">Happiness ({petState.happiness}%)</div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getBarColor(petState.happiness)}`}
                        style={{ width: `${petState.happiness}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}