const { app, BrowserWindow } = require("electron");
try {require
    ("electron-reloader")(module)
} catch (_) {};


const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        // titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#000004",
            symbolColor: "#fff"
        }
        // frame: false,
    });
    window.loadFile("index.html");
    window.webContents.openDevTools();
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

console.log(process.platform);