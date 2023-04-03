import Express from "express";

import path from "path";
import { fileURLToPath } from "url";
import queryString from "query-string";
import { LocalStorage } from "node-localstorage";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

//- MIDDLEWARE
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";

//- LOCAL
import {getTokens, getPlaylists} from "./apis/media/spotify.js"
import {NotionFetch, getNotionDB} from "./apis/productivity/notion.js";

import { generateRandomString, MONGODB_URL, SPOTIFY_ACCOUNTS_URL } from "./utils.js";
import { MONGODB_CLIENT } from "./apis/clients.js";

// const FILENAME = fileURLToPath(import.meta.url);
// const DIRNAME = path.dirname(FILENAME);

const LOCAL_STORAGE = new LocalStorage("./scratch");

const STORE = MongoStore.create({
    mongoUrl: MONGODB_URL(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD),
    dbName: "sessions",
    collectionName: "user_sessions",
    stringify: false
});


const app = Express();
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(Express.static("./public"));
app.use(session({
    genid: (req) => uuidv4(),
    name: "user_session",
    resave: false,
    secret: process.env.SESSION_SECRET,
    store: STORE,
    saveUninitialized: false,
}));


app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT} \n With sessionID ${req.sessionID}`);
});


app.get("/init", async (req, res) => {
    try {
        const SESSION_RES = req.session.save((err) => {
            if (err) return err;
        });
        if (SESSION_RES) throw SESSION_RES;
        console.log(req.sessionID);
        res.json({
            res: {
                status: 200,
                result: "SUCCESS",
                message: "SESSION INITIALIZED",
                data: req.sessionID
            }
        });
    } catch (err) {
        console.error(`ERROR: ${err}`);
        res.status(500).send(`ERROR: ${err}`);
    }
});


app.get("/exit", async (req, res) => {
    console.log(req.session.id);
    req.sessionStore.destroy(req.query.sessionID, (err) => {
        if (err) {
            console.log(`ERROR: ${err}`);
            res.send("ERROR");
        } else {
            res.send("SUCCESS");
        };
    });

});


//_ MONGODB
app.get("/mongo_test", async (req, res) => {
    const CLIENT = await MONGODB_CLIENT(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD);

    try {
        const LOCAL_DB = CLIENT.db("test");
        // const ADMIN = LOCAL_DB.admin();
        // console.log(await ADMIN.ping());
        const LOCAL_TEST_COLL = await LOCAL_DB.createCollection("TEST");
        console.log({LOCAL_TEST_COLL});
    } catch (err) {
        console.error(`ERROR: ${err}`);
    } finally {
        CLIENT.close();
    };

    res.send("DONE");
});


//_ NOTION
app.get("/notion_db", async (req, res) => {
    const NOTION_DB_RESPONSE = await getNotionDB();
    console.log(NOTION_DB_RESPONSE);
    res.send(NOTION_DB_RESPONSE);
});


app.get("/notion_uni_db", async (req, res) => {
    console.log(req);
    const NOTION_RESPONSE = await NotionFetch();
    res.send(JSON.stringify(NOTION_RESPONSE, null, 4));
});


//_ SPOTIFY
app.get("/spotify_authorization", async (req, res) => {

    if (process.env.SPOTIFY_CLIENT_ID && req.query.sessionID) {
        res.status(302).send(`${SPOTIFY_ACCOUNTS_URL}/authorize?${queryString.stringify({
                response_type: "code",
                client_id: process.env.SPOTIFY_CLIENT_ID,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                scope: process.env.SPOTIFY_SCOPES,
                show_dialog: true,
                state: req.query.sessionID
            })}`
        );
        //! NOTE THAT THIS METHOD WILL CAUSE ISSUES IF ACCESSING FROM A SITE INSTEAD OF DESKTOP
    } else {
        res.status(500).send("SERVER ERROR");
    };

});


app.get("/spotify_callback", async (req, res) => {

    if (req.query.code) {
        const TOKEN_RES = await getTokens(
                req.query.code, 
                process.env.SPOTIFY_CLIENT_ID, 
                process.env.SPOTIFY_CLIENT_SECRET, 
                process.env.SPOTIFY_REDIRECT_URI
        );

        //TODO: ADD STATE CHECK

        if (TOKEN_RES === "ERROR") {
            res.status(500).send("SERVER ERROR");
        } else {
            req.session.spotify = {
                accessToken: TOKEN_RES.access_token,
                scope: TOKEN_RES.scope,
                expiryTime: TOKEN_RES.expires_in,
                refreshToken: TOKEN_RES.refresh_token
            };
            // req.sessionStore.get(req.query.state, (err, session) => {
            //     if (err) {
            //         console.log(`ERROR: ${err}`);
            //     } else if (session == null || session == undefined) {
            //         console.error("ERROR!");
            //     } else {
            //         console.log(session)
            //         session.spotify = {
            //             accessToken: TOKEN_RES.access_token,
            //             scope: TOKEN_RES.scope,
            //             expiryTime: TOKEN_RES.expires_in,
            //             refreshToken: TOKEN_RES.refresh_token
            //         };
            //         // session.save((err) => {
            //         //     if (err) console.error(`ERROR: ${err}`);
            //         // });
            //     }
            // });
            // res.redirect("index.html");
            res.send("./index.html");
        };

    } else {
        res.status(500).send("SERVER ERROR");
    };

});


app.get("/spotify_tokens", async (req, res) => {
    if (req.query.sessionID) {
        res.send(LOCAL_STORAGE[req.query.sessionID]);
        LOCAL_STORAGE.removeItem(req.query.sessionID);
    } else {
        res.status(500).send("SERVER ERROR");
    };
});


app.get("/spotify_playlists", async (req, res) => {
    const AUTH_OPTIONS = {
        url: `${SPOTIFY_ACCOUNTS_URL}/api/token`,
        form: {
            code: req.query.code,
            redirect_uri: "http://localhost:3000/spotify_playlists",
            grant_type: "authorization_code"
        },
        headers: {
            "Authorization": `Basic ${new Buffer(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
            "Content-Type": "applicaton/x-www-form-urlencoded"
        },
        json: true
    };
    await getPlaylists(AUTH_OPTIONS, res);
});


//_ MICROSOFT



app.listen(process.env.PORT || 3000, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT || 3000}`);
});