const {BrowserWindow} = require("electron");
const path = require("path");


const MainWindow = () => {
    const MAIN_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "/scripts/preload.js"),
            minimumFontSize: 10
        },
        movable: true,
        icon: "../public/img/favicon.ico",
        frame: true,
        show: false,
        backgroundColor: "#fff",
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#3f9bef",
            symbolColor: "#fff"
        },
    });

    MAIN_WINDOW.webContents.openDevTools();
    MAIN_WINDOW.setBounds({x: 640, y: 1600, width: 1270, height: 1080});

    return MAIN_WINDOW;
};


function AuthWindow(page_url, main_window) {
    const AUTH_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        parent: main_window,
        icon: "./public/img/favicon.ico"
    });

    AUTH_WINDOW.center();
    AUTH_WINDOW.loadURL(page_url);

    return AUTH_WINDOW;
};


module.exports = {MainWindow, AuthWindow};