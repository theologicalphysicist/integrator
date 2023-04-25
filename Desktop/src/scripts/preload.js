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

let current_session = {};

contextBridge.exposeInMainWorld("renderer", {
    SpotifyAuth: (html_page, page_url, session_id) => ipcRenderer.send("SpotifyAuth", html_page, page_url, session_id),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL,
    LeaveApp: () => ipcRenderer.send("LeaveApp")
});

//! ipcRenderer.send => called by renderer, defined & ran in main.
//! ipcRenderer.on => send & called in main, defined & ran in renderer.