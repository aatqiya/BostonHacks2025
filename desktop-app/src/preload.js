// desktop-app/src/preload.js - ADD THESE FUNCTIONS TO YOUR EXISTING PRELOAD

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // YOUR EXISTING FUNCTIONS STAY HERE
    // ... (keep all your existing functions)

    // ADD THESE NEW FUNCTIONS FOR CONVERSATION WINDOW:

    // Called when "Learn More" button is clicked in intervention popup
    startConversation: () => {
        console.log('🎤 User clicked Learn More - starting conversation');
        ipcRenderer.send('start-conversation');
    },

    // Listen for conversation start event (in conversation window)
    onConversationStart: (callback) => {
        ipcRenderer.on('conversation-data', (event, data) => {
            callback(data);
        });
    },

    // Close the conversation window
    closeConversation: () => {
        console.log('❌ Closing conversation window');
        ipcRenderer.send('close-conversation');
    },

    // Send chat message to backend (optional - you can use fetch instead)
    sendChatMessage: async (message, threatContext) => {
        return ipcRenderer.invoke('send-chat-message', { message, threatContext });
    }
});

// USAGE NOTES:
// 1. Keep all your existing electron API functions
// 2. Just add the 4 new functions above
// 3. These enable communication between popup and conversation windows