import { BrowserWindow } from "electron";
import path from "path";


export const MainWindow = () => {
    const MAIN_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "./preload.js"),
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

    // MAIN_WINDOW.webContents.openDevTools();
    MAIN_WINDOW.setBounds({x: 2560 + 960 - 400, y: 1440 + 540 - 300, width: 800, height: 600});

    return MAIN_WINDOW;
};


export function AuthWindow(page_url: string, main_window: BrowserWindow) {
    const AUTH_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        parent: main_window,
        icon: "../public/img/favicon.ico"
    });

    AUTH_WINDOW.center();
    AUTH_WINDOW.loadURL(page_url);

    return AUTH_WINDOW;
};