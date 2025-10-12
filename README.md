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


    function createPetWindow() {
    petWindow = new BrowserWindow({
        width: 300,  // Bigger and easier to see
        height: 350, // Bigger and easier to see
        
        center: true, // Guarantees on-screen position
        
        frame: false,       // <--- CHANGE: Standard title bar and border
        transparent: true, // <--- CHANGE: Standard white background (overrides PetDisplay's color)
        
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true 
        }
    });
    
    
    petWindow.setIgnoreMouseEvents(true, { forward: true }); 

    
    petWindow.loadFile('pet.html'); 
}