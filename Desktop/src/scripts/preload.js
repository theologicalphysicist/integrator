const { contextBridge, ipcRenderer, BrowserView } = require("electron");
// require("dotenv").config()

// const SpotifyAuth = (event, url) => {
//     console.log(event);
//     console.log(url);
//     const SPOTIFY_AUTH_WINDOW = new BrowserView({
//         webPreferences: {
//             devTools: false,
//             preload: path.join(__dirname, "/src/scripts/preload.js"),
//             javascript: true,
//             images: true,
//         }
//     });
//     SPOTIFY_AUTH_WINDOW.webContents.loadFile(url);
// }

contextBridge.exposeInMainWorld("renderer", {
    bing: () => ipcRenderer.invoke("bing"),
    SpotifyAuth: (url, filestring) => ipcRenderer.send("SpotifyAuth", url, filestring),
    EXPRESS_BACKEND_API_URL: process.env.EXPRESS_BACKEND_API_URL,
});