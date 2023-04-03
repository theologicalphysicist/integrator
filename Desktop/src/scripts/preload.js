const { contextBridge, ipcRenderer, BrowserView } = require("electron");

const generateRandomString = (length) => {
    let text = '';
    const POSSIBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
        text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    }
    return text;
};


const createSession = () => {
    return {
        sessionID: ""
    };
};

let current_session = createSession();

contextBridge.exposeInMainWorld("renderer", {
    SpotifyAuth: (filestring) => ipcRenderer.send("SpotifyAuth", filestring),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL,
    LeaveApp: () => ipcRenderer.send("LeaveApp")
});

contextBridge.exposeInMainWorld("sessions", {
    session: () => {return current_session},
    setSession: (new_session) => {current_session = new_session}
});
