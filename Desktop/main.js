const {app, BrowserWindow, ipcMain, ipcRenderer, session} = require("electron");
const path = require("path");
const {loadCssPreprocessors} = require("./src/utils.js")
const axios = require("axios").default;

let queryString;
import("query-string")
    .then((module_obj) => {
        queryString = module_obj.default
    })
    .catch((err) => console.error(`ERROR: ${err}`));

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
        "debug": true,
        "path": "./.env.local"
    });
};


const INTEGRATOR_INSTANCE = axios.create({
    baseURL: process.env.EXPRESS_BACKEND_API_URL,
    responseType: "json",
});


const fetch = async (url, request_data, sessionID, cookies, verb) => {
    let fetch_response = {
        error: {
            present: false,
            code: 0,
            details: ""
        }
    };

    await INTEGRATOR_INSTANCE.request({
        method: verb,
        url: url,
        data: request_data,
        params: {
            sessionID: sessionID,
            cookies: cookies
        }
    }).then((res) => {
        fetch_response = {
            ...fetch_response,
            data: res.data
        };
    }).catch((err) => {
        console.error(`ERROR: ${err}`);

        fetch_response = {
            ...fetch_response,
            error: {
                present: true,
                code: 400, //! this should be changed later, on how axios works
                details: err
            }
        };
        throw new Error(err);
    });

    return fetch_response;
};


let MAIN_WINDOW;
let SPOTIFY_AUTH_WINDOW;


const createWindow = async () => {
    MAIN_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "/src/scripts/preload.js"),
            minimumFontSize: 10
        },
        movable: true,
        icon: "./public/img/favicon.ico",
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
    // main_window.center();
    MAIN_WINDOW.loadFile("./pages/index.html");
    MAIN_WINDOW.on("ready-to-show", () => {
        MAIN_WINDOW.show();
    });

};

//TODO: CREATE "GET SESSION DATA" METHOD FOR SENDING COOKIES & SESSIONID IN FETCH


//_ SESSION MAINTENANCE
let ELECTRON_SESSION;


app.on("ready", async ()  => {
    loadCssPreprocessors();
    await createWindow();

    app.on("activate", async () => {
        //* for mac users
        loadCssPreprocessors();
        if (BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        };
    });

    ELECTRON_SESSION = session.fromPartition("persist:test");
    console.log(ELECTRON_SESSION.getUserAgent());

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    };

});


//_ EVENT HANDLERS
ipcMain.on("SpotifyAuth", async (event, page_url, session_id) => {

    SPOTIFY_AUTH_WINDOW = new BrowserWindow({
        width: 800,
        height: 600,
        parent: MAIN_WINDOW,
        icon: "./public/img/favicon.ico"
    });

    SPOTIFY_AUTH_WINDOW.center();
    SPOTIFY_AUTH_WINDOW.loadURL(page_url);
    SPOTIFY_AUTH_WINDOW.on("ready-to-show", () => {
        SPOTIFY_AUTH_WINDOW.show();
    });

    await axios.get(`${process.env.EXPRESS_BACKEND_API_URL}/spotify/tokens?sessionID=${session_id}`)
        .then(async (res) => {

            console.log(res.data);
            await MAIN_WINDOW.loadFile("./pages/data.html");
            SPOTIFY_AUTH_WINDOW.close();

        })
        .catch((err) => {

            console.error(`ERROR: ${err}`);
            
        });

    //TODO: CREATE A GENERAL AXIOS INSTANCE WITH SESSIONID INCLUDED

});


ipcMain.handle("fetch", async (event, url, request_data, sessionID, cookies, verb) => {
    return await fetch(url, request_data, sessionID, cookies, verb);
});


ipcMain.on("LeaveApp", (event) => app.quit());