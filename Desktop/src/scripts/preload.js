const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("renderer", {
    SpotifyAuth: (page_url, session_id) => ipcRenderer.send("SpotifyAuth", html_page, page_url, session_id),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL,
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    LeaveApp: (callback) => ipcRenderer.on("LeaveApp", callback)
});

//! ipcRenderer.send => called by renderer, defined & ran in main.
//! ipcRenderer.on => send & called in main, defined & ran in renderer.
