const {app, BrowserWindow, ipcMain, ipcRenderer, session} = require("electron");
// const axios = require("axios").default;

//_ LOCAL
const {loadCSS, INTEGRATOR_INSTANCE} = require("./src/utils.js");
const { createMainWindow, createSpotifyAuthWindow } = require("./src/windows.js");

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


let MAIN_WINDOW;
//_ SESSION MAINTENANCE
let ELECTRON_SESSION;


//_ APP MAINTENANCE
app.on("ready", async () => {

    loadCSS();

    MAIN_WINDOW = createMainWindow();
    await MAIN_WINDOW.loadFile("./pages/index.html");

    await INTEGRATOR_INSTANCE().request({
        method: "GET",
        url: "/init",
    })
    .then((res) => {
        MAIN_WINDOW.webContents.send("init", {
            ...res.data
        });
        MAIN_WINDOW.show();
        ELECTRON_SESSION = session.fromPartition("persist:test");
        console.log(ELECTRON_SESSION.getUserAgent());
    })
    .catch((err) => {
        console.error(`ERROR: CAN'T START APPLICATION \n${err}`);
    });

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") app.quit(); //* for mac users

});


//_ EVENT HANDLERS
ipcMain.on("SpotifyAuth", async (event, page_url, session_id) => {
    const SPOTIFY_AUTH_WINDOW = createSpotifyAuthWindow(page_url);

    // axios.get(`${process.env.EXPRESS_BACKEND_API_URL}/spotify/tokens?sessionID=${session_id}`)
    //     .then(async (res) => {

    //         console.log(res.data);
    //         await MAIN_WINDOW.loadFile("./pages/data.html");
    //         SPOTIFY_AUTH_WINDOW.close();

    //     })
    //     .catch((err) => {
    //         console.error(`ERROR: ${err}`);     
    //     });

});


ipcMain.handle("fetch", async (event, url, request_data, query_params, verb) => {
    let response = {
        error: {
            present: false,
            code: 0,
            details: null
        }
    };

    await INTEGRATOR_INSTANCE().request({
        method: verb,
        url: url,
        data: request_data,
        params: query_params
    }).then((res) => {
        response = {
            ...response,
            data: res.data,
            error: {
                code: res.status
            }
        };
    }).catch((err) => {
        if (err.response) {
            response.error = {
                present: true,
                code: err.response.status,
                details: err.response.data
            };
        } else if (err.request) {
            response.error = {
                present: true,
                code: 500,
                details: err.request
            };
        } else {
            response.error = {
                present: true,
                code: 500,
                details: err.message
            };
        }

        throw new Error(JSON.stringify(response.error));
    });

    return response;
});


ipcMain.on("LeaveApp", (event) => app.quit());