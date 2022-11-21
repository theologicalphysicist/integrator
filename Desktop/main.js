const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const sass = require("sass");
const fs = require("fs");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
    // try {
    //     require("electron-reloader")(module, {
    //         debug: true,
    //         watchRenderer: true
    //     });
    // } catch (_) {console.log(_)}
}

const loadCssPreprocessors = () => {
    const home_res = sass.compile(path.join(__dirname, "/src/styles/scss/home/home.scss"));    
    fs.writeFile(
        path.join(__dirname, "/src/styles/home.css"), 
        home_res.css, 
        (err) => console.log(err)
    );

    const productivity_res = sass.compile(path.join(__dirname, "/src/styles/scss/productivity/productivity.scss"));
    fs.writeFile(
        path.join(__dirname, "/src/styles/productivity.css"), 
        productivity_res.css, 
        (err) => console.log(err)
    );

    const media_res = sass.compile(path.join(__dirname, "./src/styles/scss/media/media.scss"));
    fs.writeFile(
        path.join(__dirname, "/src/styles/media.css"), 
        media_res.css, 
        (err) => console.log(err)
    );
}

let mainWindow;
const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "/src/scripts/preload.js"),
            // devTools: true,
            // plugins: true,
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
    mainWindow.webContents.openDevTools();
    mainWindow.setBounds({x: 1620, y: 1700, width: 1200, height: 600});
    mainWindow.center();
    mainWindow.loadFile("./pages/index.html");
    mainWindow.on("ready-to-show", () => {
        // mainWindow.maximize();
        mainWindow.show();
    });
    ipcMain.handle("bing", () => "bong");
}

app.whenReady().then(()  => {
    loadCssPreprocessors();
    createWindow();

    app.on("activate", () => {
        console.log("HELLO 7");
        loadCssPreprocessors();
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
app.on("session-created", (ses) => {
    // console.log({ses});
});