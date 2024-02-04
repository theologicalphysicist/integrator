import {BrowserWindow, app, ipcMain, session} from "electron";

//_ LOCAL
import {INTEGRATOR_INSTANCE, formatError} from "./src/scripts/utils.js";
import { MainWindow, AuthWindow } from "./src/scripts/windows.js";
import queryString from "query-string";
import dotenv from "dotenv";
//_ DYNAMIC INPORTS
// let queryString;
// import("query-string")
//     .then((module_obj) => {
//         queryString = module_obj.default
//     })
//     .catch((err) => console.error(`ERROR LOADING MODULE QUERY STRING: ${err}`));

//_ LOAD ENVIRONMENT
// if (process.env.NODE_ENV !== "production") {
    // require("dotenv").config({
    //     debug: true,
    //     path: "./.env.local",
    // });
// };

dotenv.config({
    debug: true,
    path: "./.env.local",
});


let MAIN_WINDOW: BrowserWindow;
//_ SESSION MAINTENANCE
// let ELECTRON_SESSION;


//_ APP MAINTENANCE
app.on("ready", async () => {

    MAIN_WINDOW = MainWindow();
    await MAIN_WINDOW.loadFile("./src/pages/index.html");
    MAIN_WINDOW.show()

    await INTEGRATOR_INSTANCE().request({
        method: "GET",
        url: "/init",
    })
    .then((res: any) => {
        MAIN_WINDOW.webContents.send("init", {
            ...res.data
        });
        console.log("STARTING");
        MAIN_WINDOW.show();
        // ELECTRON_SESSION = session.fromPartition("persist:test");
        // console.log(ELECTRON_SESSION.getUserAgent());
    })
    .catch((err: any) => {
        console.error(`ERROR: CAN'T START APPLICATION \n${err}`);
    });

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") app.quit(); //* for mac users

});


//_ IPC EVENT HANDLERS
ipcMain.on("SpotifyAuth", async (event, page_url, session_id) => {
    const SPOTIFY_AUTH_WINDOW = AuthWindow(page_url, MAIN_WINDOW);
    SPOTIFY_AUTH_WINDOW.show();

    // INTEGRATOR_INSTANCE().get(`${process.env.EXPRESS_BACKEND_API_URL}/spotify/tokens?sessionID=${session_id}`)
    //     .then(async (res) => {

    //         await MAIN_WINDOW.loadFile("./pages/data.html");

    //     })
    //     .catch((err) => {
    //         const ERROR_RES = formatError(event, err)   
    //         console.log(ERROR_RES.error);

    //         event.sender.send("fetchError", {
    //             ...ERROR_RES.error
    //         });

    //         throw new Error(JSON.stringify(ERROR_RES.error));
    //     });

});


ipcMain.handle("fetch", async (event, url, request_data, query_params, verb) => {
    let response = {
        error: {
            present: false,
            code: 0,
            details: null,
            error: null
        },
        data: {}
    };
    console.log({event});

    await INTEGRATOR_INSTANCE().request({
        method: verb,
        url: url,
        data: request_data,
        params: query_params
    }).then((res: any) => {
        console.log({res});

        response = {
            data: res.data,
            error: {
                ...response.error,
                code: res.status
            }
        };
    }).catch((err: any) => {
        response = {
            ...formatError(event, err),
            data: {}
        }


        console.log({err});

        // event.sender.send("fetchError", {
        //     ...response.error
        // });

        // throw new Error(JSON.stringify(response.error));
    });

    return response;
});


ipcMain.on("log", async (event: any, log_data: any) => {
    console.log(JSON.stringify({log_data}, null, 4));
});


ipcMain.on("LeaveApp", (event) => app.quit());