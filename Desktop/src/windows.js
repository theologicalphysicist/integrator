const {BrowserWindow} = require("electron");
const path = require("path");


const createMainWindow = () => {
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


function createSpotifyAuthWindow(page_url, main_window) {
    const SPOTIFY_AUTH_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        parent: main_window,
        icon: "./public/img/favicon.ico"
    });

    SPOTIFY_AUTH_WINDOW.center();
    SPOTIFY_AUTH_WINDOW.loadURL(page_url);

    return SPOTIFY_AUTH_WINDOW;
};


module.exports = {createMainWindow, createSpotifyAuthWindow};