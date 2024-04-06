import {BrowserWindow, app, ipcMain, session} from "electron";

//_ LOCAL
import {INTEGRATOR_INSTANCE, formatError} from "./src/scripts/utils.js";
import { MainWindow, AuthWindow } from "./src/scripts/windows.js";
import queryString from "query-string";
import dotenv from "dotenv";
import {Verbal, LOG_LEVELS} from "./src/scripts/logger.js";
import { AxiosError, AxiosResponse } from "axios";
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
const INTEGRATOR_LOGGER = new Verbal("🔌INTEGRATOR DESKTOP🔌");
//_ SESSION MAINTENANCE
// let ELECTRON_SESSION;


//_ APP MAINTENANCE
app.on("ready", async () => {
    INTEGRATOR_LOGGER.debug({"TEST SESSION ID": process.env.TEST_SESSION_ID});
    
    const INIT_CONFIG: any = {
        url: "/init",
        method: "GET",
        params: {
            sessionID: process.env.TEST_SESSION_ID ?? null
        }
    };

    MAIN_WINDOW = MainWindow();
    await MAIN_WINDOW.loadFile("./src/pages/index.html");

    await INTEGRATOR_INSTANCE().request(
        INIT_CONFIG
    ).then((res: AxiosResponse) => {
        INTEGRATOR_LOGGER.info("INITIALIZED, STARTING");
        INTEGRATOR_LOGGER.debug({"response": res.data});

        MAIN_WINDOW.show();

        MAIN_WINDOW.webContents.send("init", {
            ...res.data
        });
    }).catch((err: AxiosError) => {
        INTEGRATOR_LOGGER.error(`${err}`);

    });

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") app.quit(); //* for mac users

});


//_ IPC EVENT HANDLERS
ipcMain.on("SpotifyAuth", async (event, page_url, session_id) => {

    await INTEGRATOR_INSTANCE().request({
        url: `${process.env.EXPRESS_BACKEND_API_URL}/spotify/tokens`,
        method: "GET",
        params: {
            sessionID: session_id
        }
    }).then(async (res: AxiosResponse) => {
        INTEGRATOR_LOGGER.info({tokenData: res.data});

        await MAIN_WINDOW.loadFile("src/pages/data.html");

    }).catch((err: AxiosError) => {
        INTEGRATOR_LOGGER.error({
            present: true,
            code: err.status ?? 500,
            error: err.code ?? "INTERNAL SERVER ERROR",
            details: {
                message: err.message,
                url: err.config?.url
            }
        });

        // event.sender.send("fetchError", {
        //     ...ERROR_RES.error
        // });

        // throw new Error(JSON.stringify(ERROR_RES.error));
    });

});


ipcMain.handle("fetch", async (event, url, request_data, query_params, verb) => {
    let response: any = {
        error: {
            present: false,
            code: 0,
            details: "",
            error: ""
        },
        data: {}
    };

    await INTEGRATOR_INSTANCE().request({
        method: verb,
        url: url,
        data: request_data,
        params: query_params
    }).then((res: AxiosResponse) => {
        INTEGRATOR_LOGGER.info({data: res.data});
        response = {
            data: res.data,
            error: {
                ...response.error,
                code: res.status,
                error: res.statusText
            }
        };

    }).catch((err: AxiosError) => {
        response = {
            error: {
                present: true,
                code: err.status ?? 500,
                error: err.code ?? "INTERNAL SERVER ERROR",
                details: {
                    message: err.message,
                    url: err.config?.url
                }
            },
            data: {}
        };
        INTEGRATOR_LOGGER.error({response});

    });

    return response;
});


ipcMain.on("log", async (event: any, log_data: any, level: string) => {

    INTEGRATOR_LOGGER.log({source: "RENDERER", data: log_data}, Object.keys(LOG_LEVELS).includes(level.toUpperCase()) ? level.toUpperCase() : undefined)
    //TODO: consider pasing source for specific renderer from parameter
});


ipcMain.on("LeaveApp", (event) => app.quit());