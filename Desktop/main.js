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
    require("dotenv").config();
}

let main_window;
let spotify_auth_window;
const createWindow = async () => {
    main_window = new BrowserWindow({
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

    main_window.webContents.openDevTools();
    main_window.setBounds({x: 1620, y: 1601, width: 1200, height: 600});
    main_window.center();
    main_window.loadFile("./pages/index.html");
    main_window.on("ready-to-show", () => {
        main_window.show();
    });

};

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

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    };

});


//_ EVENT HANDLERS
ipcMain.on("SpotifyAuth", async (event, page_url, session_id) => {

    spotify_auth_window = new BrowserWindow({
        width: 800,
        height: 600,
        parent: main_window,
        icon: "./public/img/favicon.ico"
    });

    spotify_auth_window.center();
    spotify_auth_window.loadURL(page_url);
    spotify_auth_window.on("ready-to-show", () => {
        spotify_auth_window.show();
    });

    await axios.get(`${process.env.EXPRESS_BACKEND_API_URL}/spotify_tokens?sessionID=${session_id}`)
    .then(async (res) => {

        console.log(res.data);
        await main_window.loadFile("./pages/data.html");
        spotify_auth_window.close();

    }).catch((err) => {

        console.error(`ERROR: ${err}`);
        
    });

    //TODO: CREATE A GENERAL AXIOS INSTANCE WITH SESSIONID INCLUDED

});

ipcMain.on("LeaveApp", (event) => app.quit());