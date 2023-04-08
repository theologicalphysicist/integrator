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

//_ MIDDLEQARE
const LOCAL_STORAGE = new LocalStorage("./scratch");

const STORE = MongoStore.create({
    mongoUrl: MONGODB_URL(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD),
    dbName: "sessions",
    collectionName: "user_sessions",
    stringify: false,
});


const app = Express();
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
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, //* 1 day in millisecs
    }
}));
// app.use(cookieParser(process.env.SESSION_SECRET));

//_ SERVER
app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT} \n With sessionID ${req.sessionID}`);
});


app.get("/cookie_test", async (req, res) => {
    console.log(req.headers.cookie);
    res.send(new Promise((resolve) => resolve.toString()));
});


app.get("/init", async (req, res) => {

    try {

        const SESSION_RES = req.session.save((err) => {
            if (err) return err;
        });
        if (SESSION_RES) throw SESSION_RES;

        res.cookie("user_session", req.session.cookie).status(200).json({
            result: true,
            message: "SESSION INITIALISED",
            id: req.sessionID,
            cookies: req.session.cookie
        });

    } catch (err) {
        console.error(`ERROR: ${err}`);
        res.status(500).send(`ERROR: ${err}`);
    };

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
        // res.redirect(`${SPOTIFY_ACCOUNTS_URL}/authorize?${queryString.stringify({
        //         response_type: "code$",
        //         client_id: process.env.SPOTIFY_CLIENT_ID,
        //         redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        //         scope: process.env.SPOTIFY_SCOPES,
        //         show_dialog: true,
        //         state: req.query.sessionID
        //     })}`
        // );
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
            req.sessionStore.get(req.query.state, (err, sess) => {
                if (err) throw err;
                req.sessionStore.set(req.query.state, {
                    ...sess,
                    spotify: {
                        accessToken: TOKEN_RES.access_token,
                        scope: TOKEN_RES.scope,
                        expiryTime: TOKEN_RES.expires_in,
                        refreshToken: TOKEN_RES.refresh_token,
                        tokenType: TOKEN_RES.token_type
                    }
                });
            });
            res.redirect("./index.html");
        };
    } else {
        res.status(500).send("SERVER ERROR");
    };

});


app.get("/spotify_tokens_available", async (req, res) => {
    if (req.query.sessionID) {
        res.send(LOCAL_STORAGE[req.query.sessionID]);
        LOCAL_STORAGE.removeItem(req.query.sessionID);
    } else {
        res.status(500).send("SERVER ERROR");
    };
});


app.get("/spotify_playlists", async (req, res) => {

    if (!req.query.sessionID) {
        res.status(500).send("SERVER ERROR") //! CHANGE THIS LATER!
    } else {

        let auth_string = "";

        const GETTING_TOKENS = setInterval(() => {
            req.sessionStore.get(req.query.sessionID, (err, sess) => {
                if (err) throw err;
                auth_string = `${sess.spotify.tokenType} ${sess.spotify.accessToken}`;
            });
            if (auth_string !== "") clearInterval(GETTING_TOKENS);
            console.log("here");
        }, 1000);

        const PLAYLIST_RES = await getPlaylists(
            process.env.SPOTIFY_CLIENT_ID, 
            process.env.SESSION_SECRET, 
            auth_string
        );

        res.send(PLAYLIST_RES);


        // while (!flag) {
        //     req.sessionStore.get(req.query.sessionID, (err, sess) => {
        //         if (err) throw err;
        //         if (sess.spotify) flag = true;
        //         auth_string = `${sess.spotify.tokenType} ${sess.spotify.accessToken}`;
        //     });
        //     console.log({flag});
        //     console.log("here");
        // };
        // req.sessionStore.


    };

});


//_ MICROSOFT



app.listen(process.env.PORT || 3000, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT || 3000}`);
});