const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("renderer", {
    SpotifyAuth: (page_url, session_id) => ipcRenderer.send("SpotifyAuth", page_url, session_id),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL,
    LeaveApp: (callback) => ipcRenderer.on("LeaveApp", callback),
    setCookies: (cookies) => ipcRenderer.send("setCookies", cookies),
    fetch: async (url, request_data, sessionID, cookies, verb) => {
        return ipcRenderer.invoke("fetch", url, request_data, sessionID, cookies, verb)
            .then((result) => 
                {
                    return result;
                }
            )
    },
});

//! ipcRenderer.send => called by renderer, defined & ran in main.
//! ipcRenderer.on => send & called in main, defined & ran in renderer.