const {app, ipcMain, session} = require("electron");

//_ LOCAL
const {INTEGRATOR_INSTANCE, formatError} = require("./src/utils.js");
const { MainWindow, AuthWindow } = require("./src/windows.js");

//_ DYNAMIC INPORTS
let queryString;
import("query-string")
    .then((module_obj) => {
        queryString = module_obj.default
    })
    .catch((err) => console.error(`ERROR LOADING MODULE QUERY STRING: ${err}`));

//_ LOAD ENVIRONMENT
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
        debug: true,
        path: "./.env.local",
    });
};


let MAIN_WINDOW;
//_ SESSION MAINTENANCE
let ELECTRON_SESSION;


//_ APP MAINTENANCE
app.on("ready", async () => {

    MAIN_WINDOW = MainWindow();
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


//_ IPC EVENT HANDLERS
ipcMain.on("SpotifyAuth", async (event, page_url, session_id) => {
    const SPOTIFY_AUTH_WINDOW = AuthWindow(page_url, MAIN_WINDOW);

    INTEGRATOR_INSTANCE().get(`${process.env.EXPRESS_BACKEND_API_URL}/spotify/tokens?sessionID=${session_id}`)
        .then(async (res) => {

            await MAIN_WINDOW.loadFile("./pages/data.html");

        })
        .catch((err) => {
            const ERROR_RES = formatError(event, err)   
            console.log(ERROR_RES.error);

            event.sender.send("fetchError", {
                ...ERROR_RES.error
            });

            throw new Error(JSON.stringify(ERROR_RES.error));
        });

});


ipcMain.handle("fetch", async (event, url, request_data, query_params, verb) => {
    let response = {
        error: {
            present: false,
            code: 0,
            details: null,
            error: null
        }
    };

    await INTEGRATOR_INSTANCE().request({
        method: verb,
        url: url,
        data: request_data,
        params: query_params
    }).then((res) => {
        response = {
            data: res.data,
            error: {
                ...response.error,
                code: res.status
            }
        };
    }).catch((err) => {
        response = formatError(event, err);

        console.log(response.error);

        event.sender.send("fetchError", {
            ...response.error
        });

        throw new Error(JSON.stringify(response.error));
    });

    return response;
});


ipcMain.on("LeaveApp", (event) => app.quit());