// desktop-app/preload.js

// desktop-app/preload.js - COMPLETE VERSION

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // 1. Send threat data from PetDisplay.jsx to main.js to open the popup
    showIntervention: (threatData) => {
        console.log('🔧 preload: showIntervention called with:', threatData);
        ipcRenderer.send('show-intervention', threatData);
    },

    // 2. Send close request from InterventionPopup.jsx to main.js
    closePopup: () => {
        console.log('🔧 preload: closePopup called');
        ipcRenderer.send('close-popup');
    },

    // 3. Listen for incoming threat data (used inside InterventionPopup.jsx)
    onThreatData: (callback) => {
        console.log('🔧 preload: onThreatData listener registered');
        ipcRenderer.removeAllListeners('threat-data');
        ipcRenderer.on('threat-data', (event, data) => {
            console.log('🔧 preload: threat-data received:', data);
            callback(data);
        });
    },

    // 4. Start conversation (used inside InterventionPopup.jsx)
    startConversation: () => {
        console.log('🔧 preload: startConversation called');
        ipcRenderer.send('start-conversation');
    },

    // 5. Listen for conversation start (used inside ConversationWindow.jsx)
    onConversationStart: (callback) => {
        console.log('🔧 preload: onConversationStart listener registered');
        ipcRenderer.removeAllListeners('conversation-data');
        ipcRenderer.on('conversation-data', (event, data) => {
            console.log('🔧 preload: conversation-data received:', data);
            callback(data);
        });
    },

    // 6. Close the conversation window
    closeConversation: () => {
        console.log('🔧 preload: closeConversation called');
        ipcRenderer.send('close-conversation');
    },

    // 7. Optional: Send chat message via IPC
    sendChatMessage: async (message, threatContext) => {
        console.log('🔧 preload: sendChatMessage called');
        return ipcRenderer.invoke('send-chat-message', { message, threatContext });
    }
});