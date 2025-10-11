

const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let petWindow;
let popupWindow = null; // Tracks the single active Intervention Popup window

/**
 * Creates the small, always-on-top, click-through Pet Widget window.
 */
function createPetWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    petWindow = new BrowserWindow({
        width: 200,
        height: 250,
        // Position in the bottom-right corner, adjusted for size
        x: width - 270, 
        y: height - 320,
        frame: false,             // No native title bar
        transparent: true,        // Allows custom shapes/transparency
        alwaysOnTop: true,        // Keeps it above other apps
        skipTaskbar: true,        // Hides it from the taskbar/dock
        resizable: false,
        webPreferences: {
            // Must use a preload script for safe IPC between main and renderer
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true // Security best practice
        }
    });

    // Load the HTML file that will host the PetDisplay React component
    petWindow.loadFile('pet.html'); 

    petWindow.show();  // Forces the window to display
    petWindow.focus(); // Forces the window to grab focus
    
    // CRUCIAL: Allows mouse clicks to pass through the transparent part of the window
    petWindow.setIgnoreMouseEvents(true, { forward: true }); 
}

/**
 * Creates and shows the modal Intervention Popup when a threat is detected.
 */
function createInterventionPopup(threatData) {
    // Only allow one popup at a time
    if (popupWindow) {
        popupWindow.focus(); 
        return;
    }
    
    popupWindow = new BrowserWindow({
        width: 500,
        height: 500,
        center: true,
        frame: false, 
        alwaysOnTop: true,
        modal: true, // Appears over the main window
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });
    
    // Load the HTML file that will host the InterventionPopup React component
    popupWindow.loadFile('intervention.html');
    
    // Once the window is ready, send the threat data to the renderer process (the React code)
    popupWindow.webContents.on('did-finish-load', () => {
        // 'threat-data' is the channel the preload script will listen for
        popupWindow.webContents.send('threat-data', threatData);
    });

    // When the user closes the window, reset the tracking variable
    popupWindow.on('closed', () => {
        popupWindow = null;
    });
}


// -----------------------------------------------------------------------
// Application Lifecycle and IPC Setup
// -----------------------------------------------------------------------

app.whenReady().then(() => {
    // 1. Create the main pet window
    createPetWindow();

    // 2. Set up IPC listeners (Communication from React to Electron)
    createInterventionPopup({ type: 'Test Threat', details: 'Initial launch check.' });

    // Listener for when the PetDisplay.jsx detects a threat and wants to show the popup
    ipcMain.on('show-intervention', (event, data) => {
        createInterventionPopup(data);
    });
    
    // Listener for when the InterventionPopup.jsx is closed by the user
    ipcMain.on('close-popup', () => {
        if (popupWindow) {
            popupWindow.close();
        }
    });
    
    // Optional: Start the conversation view (Future integration with Person 4)
    ipcMain.on('start-conversation', () => {
        // You would typically open a third window or toggle content here.
        // For simplicity in the hackathon, this is currently a placeholder.
        console.log("Conversation started request received.");
    });


    app.on('activate', () => {
        // On macOS, re-create the window when the dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createPetWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Quit the application when all windows are closed, unless on macOS
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
