const {app, BrowserWindow, ipcMain, ipcRenderer} = require("electron");
const path = require("path");
const sass = require("sass");
const fs = require("fs");
const opener = require("opener");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const loadCssPreprocessors = () => {
    const home_res = sass.compile(path.join(__dirname, "/src/styles/scss/home/home.scss"));    
    fs.writeFile(
        path.join(__dirname, "/src/styles/home.css"), 
        home_res.css, 
        (err) => {
            if (err) {console.log(err)}
        }
    );

    const productivity_res = sass.compile(path.join(__dirname, "/src/styles/scss/data/data.scss"));
    fs.writeFile(
        path.join(__dirname, "/src/styles/data.css"), 
        productivity_res.css, 
        (err) => {
            if (err) {console.log(err)}
        }
    );

    const media_res = sass.compile(path.join(__dirname, "./src/styles/scss/media/media.scss"));
    fs.writeFile(
        path.join(__dirname, "/src/styles/media.css"), 
        media_res.css, 
        (err) => {
            if (err) {console.log(err)}
        }
    );
}

let main_window;
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
        frame: false,
        show: false,
        backgroundColor: "#fff",
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#3f9bef",
            symbolColor: "#fff"
        },
    });

    main_window.webContents.openDevTools();
    main_window.setBounds({x: 1620, y: 1700, width: 1200, height: 600});
    main_window.center();
    main_window.loadFile("./pages/index.html");
    main_window.on("ready-to-show", () => {
        main_window.show();
    });

};


app.whenReady().then(async ()  => {
    loadCssPreprocessors();
    await createWindow();

    ipcMain.on("SpotifyAuth", (event, filestring) => opener(filestring));

    ipcMain.on("LeaveApp", (event) => app.quit());

    app.on("activate", async () => {
        loadCssPreprocessors();
        if (BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        };
    });

});


app.on("before-quit", () => {
    localStorage.clear();
});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    };
    
});


app.on("session-created", (ses) => {
    // console.log({ses});
});