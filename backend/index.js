import Express from "express";

import queryString from "query-string";
import { v4 as uuidv4 } from "uuid";
import EventEmitter from "node:events";

//- MIDDLEWARE
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";

//- LOCAL
import { SPOTIFY_ACCOUNTS_URL, MONGODB_URL } from "./utils.js";
import { MONGODB_CLIENT } from "./apis/clients.js";
import {getAuthCode, getPlaylists, refreshToken} from "./apis/media/spotify.js"
import {NotionFetch, getNotionDB} from "./apis/productivity/notion.js";

//_ MIDDLEQARE


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
app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));
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

//* long-polling to handle spotify tokens
const SPOTIFY_TOKENS_AVAILABLE = new EventEmitter();

//_ SERVER
app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT} \n With sessionID ${req.sessionID}`);
});


app.get("/cookie_test", async (req, res) => {
    console.log(req.headers.cookie);
    res.send({result: true});
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

        res.send(`${SPOTIFY_ACCOUNTS_URL}/authorize?${queryString.stringify({
                response_type: "code",
                client_id: process.env.SPOTIFY_CLIENT_ID,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                scope: process.env.SPOTIFY_SCOPES,
                show_dialog: true,
                state: req.query.sessionID
            })}`
        );
        //! NOTE THAT THIS METHOD MAY CAUSE ISSUES IF ACCESSING FROM A SITE INSTEAD OF DESKTOP
    } else {
        res.status(500).send("SERVER ERROR");
    };

});


app.get("/spotify_callback", async (req, res) => {

    if (req.query.code && req.query.state) {

        const TOKEN_RES = await getAuthCode(
            req.query.code, 
            process.env.SPOTIFY_CLIENT_ID, 
            process.env.SPOTIFY_CLIENT_SECRET, 
            process.env.SPOTIFY_REDIRECT_URI
        );

        req.sessionStore.get(req.query.state, (err, sess) => {
            if (err) throw err;
            req.sessionStore.set(req.query.state, {
                ...sess,
                spotify: {
                    accessToken: TOKEN_RES.access_token,
                    scope: TOKEN_RES.scope,
                    expiryTime: (TOKEN_RES.expires_in * 1000) + Date.now(),
                    refreshToken: TOKEN_RES.refresh_token,
                    tokenType: TOKEN_RES.token_type
                }
            });
            SPOTIFY_TOKENS_AVAILABLE.emit("tokens-available", req.query.state);
        });
        res.redirect("spotify.html");
    } else {
        res.status(500).send("SERVER ERROR");
    };

});


app.get("/spotify_tokens", async (req, res) => {

    const HANDLE_RES = (data) => {
        res.json("YES!");
        SPOTIFY_TOKENS_AVAILABLE.removeListener("tokens-available", HANDLE_RES);
    };

    SPOTIFY_TOKENS_AVAILABLE.on("tokens-available", HANDLE_RES);

});


app.get("/spotify_playlists", async (req, res) => {

    if (!req.query.sessionID) {

        res.status(500).send("SERVER ERROR") //! CHANGE THIS LATER!

    } else {

        req.sessionStore.get(req.query.sessionID, async (err, sess) => {
            if (err) throw err;

            let token_type = sess.spotify.tokenType;
            let access_token = sess.spotify.accessToken;

            if (sess.spotify.expiryTime <= Date.now()) {
                //* i.e., the tokens have expired, since "now" is after the expiry date.
                const NEW_TOKENS = await refreshToken(
                    sess.spotify.refreshToken,
                    process.env.SPOTIFY_CLIENT_ID, 
                    process.env.SPOTIFY_CLIENT_SECRET
                );

                token_type = NEW_TOKENS.token_type;
                access_token = NEW_TOKENS.access_token;

                req.sessionStore.set(req.query.sessionID, {
                    ...sess,
                    spotify: {
                        accessToken: access_token,
                        scope: NEW_TOKENS.scope,
                        expiryTime: (NEW_TOKENS.expires_in * 1000) + Date.now(),
                        refreshToken: sess.spotify.refreshToken,
                        tokenType: token_type
                    }
                });
            };

            const PLAYLIST_RES = await getPlaylists(token_type, access_token);

            res.send(PLAYLIST_RES);
        });

    };

});


//_ MICROSOFT



app.listen(process.env.PORT || 3000, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT || 3000}`);
});