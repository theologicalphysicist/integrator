const { contextBridge, ipcRenderer } = require("electron");
// require("dotenv").config()

contextBridge.exposeInMainWorld("renderer", {
    bing: () => ipcRenderer.invoke("bing"),
    SpotifyAuth: () => ipcRenderer.invoke("SpotifyAuth"),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL
});