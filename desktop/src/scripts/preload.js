const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("renderer", {
    init: (callback) => ipcRenderer.on("init", callback),
    fetchError: (callback) => ipcRenderer.on("fetchError", callback),
    SpotifyAuth: (page_url, session_id) => ipcRenderer.send("SpotifyAuth", page_url, session_id),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL,
    LeaveApp: (callback) => ipcRenderer.on("LeaveApp", callback),
    setCookies: (cookies) => ipcRenderer.send("setCookies", cookies),
    fetch: (url, request_data, sessionID, cookies, verb) => ipcRenderer.invoke("fetch", url, request_data, sessionID, cookies, verb),
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    log: (log_data) => ipcRenderer.send("log", log_data)
});

//! ipcRenderer.send => called by renderer, defined & ran in main.
//! ipcRenderer.on => send & called in main, defined & ran in renderer.
