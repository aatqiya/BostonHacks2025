// desktop-app/main.js - FIXED VERSION

// desktop-app/main.js - WITH DEBUG LOGGING

const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let petWindow;
let popupWindow = null;
let conversationWindow = null;
let currentThreatData = null;

function createPetWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    petWindow = new BrowserWindow({
        width: 180,
        height: 180,
        x: width - 200,
        y: height - 200,

        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    petWindow.loadFile('pet.html');

    petWindow.on('closed', () => {
        petWindow = null;
    });

    try {
        petWindow.setAlwaysOnTop(true, 'screen-saver');
        petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    } catch (e) {
        console.warn('Could not enable advanced always-on-top for petWindow:', e && e.message);
    }

    console.log('✅ Pet widget created (clickable)');
}

function createInterventionPopup(data) {
    if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.focus();
        popupWindow.webContents.send('threat-data', data);
        console.log('📤 Updated existing popup');
        return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    popupWindow = new BrowserWindow({
        width: 600,
        height: 700,
        x: Math.floor((width - 600) / 2),
        y: Math.floor((height - 700) / 2),

        frame: false,
        alwaysOnTop: true,
        resizable: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    popupWindow.loadFile('intervention.html');

    popupWindow.webContents.on('did-finish-load', () => {
        console.log('📤 Sending data to popup:', data.isThreat ? 'THREAT' : 'MANUAL');
        popupWindow.webContents.send('threat-data', data);
    });

    popupWindow.on('closed', () => {
        popupWindow = null;
        console.log('❌ Popup closed');
    });

    try {
        popupWindow.setAlwaysOnTop(true, 'screen-saver');
        popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    } catch (e) {
        console.warn('Could not enable advanced always-on-top for popupWindow:', e && e.message);
    }

    console.log('✅ Popup opened:', data.isThreat ? 'AUTO (threat)' : 'MANUAL (user click)');
}

function createConversationWindow(threatData) {
    console.log('🎯 createConversationWindow called with data:', threatData);

    if (conversationWindow && !conversationWindow.isDestroyed()) {
        conversationWindow.close();
    }

    conversationWindow = new BrowserWindow({
        width: 900,
        height: 700,
        resizable: true,
        frame: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#111827',
        title: 'FrostByte - Security Assistant'
    });

    conversationWindow.loadFile('conversation.html');

    conversationWindow.webContents.on('did-finish-load', () => {
        console.log('💬 Window loaded, sending threat data:', threatData);
        conversationWindow.webContents.send('conversation-data', threatData);
    });

    conversationWindow.on('closed', () => {
        conversationWindow = null;
        currentThreatData = null;
    });

    // TEMPORARILY OPEN DEVTOOLS TO SEE ERRORS
    conversationWindow.webContents.openDevTools();
}

// IPC HANDLERS

ipcMain.on('show-intervention', (event, data) => {
    console.log('🚨 IPC: show-intervention with data:', data);
    currentThreatData = data;
    createInterventionPopup(data);
});

ipcMain.on('close-popup', () => {
    console.log('❌ IPC: close-popup');
    if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.close();
    }
});

ipcMain.on('start-conversation', (event) => {
    console.log('🎤 IPC: start-conversation with threat data:', currentThreatData);

    if (currentThreatData) {
        createConversationWindow(currentThreatData);
    } else {
        console.warn('⚠️  No threat data available for conversation');
        createConversationWindow({
            type: 'Security Threat',
            severity: 50,
            details: 'A security issue was detected.',
            timestamp: new Date().toISOString(),
            isThreat: true
        });
    }
});

ipcMain.on('close-conversation', (event) => {
    console.log('❌ IPC: close-conversation');
    if (conversationWindow && !conversationWindow.isDestroyed()) {
        conversationWindow.close();
    }
});

ipcMain.handle('send-chat-message', async (event, { message, threatContext }) => {
    try {
        const fetch = require('node-fetch');
        const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, threat_context: threatContext })
        });
        return await response.json();
    } catch (error) {
        console.error('❌ Chat IPC error:', error);
        return { error: error.message };
    }
});

// APP LIFECYCLE

app.whenReady().then(() => {
    console.log('🚀 Creating pet widget...');
    createPetWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createPetWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log('✅ CyberPet initialized');
console.log('🔌 Backend: ws://localhost:8000/ws');
console.log('🖱️ Click the pet to view stats!');