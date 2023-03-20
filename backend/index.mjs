import Express from "express";
import path from "path";
import { fileURLToPath } from "url";

//- MIDDLEWARE
import cors from "cors";
import cookieParser from "cookie-parser";

import * as dotenv from "dotenv";

//- API IMPORTS
import {NOTION_CLIENT} from "./apis/productivity/clients.js"
import { SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "./apis/media/clients.js";
import {getNotionDatabaseDetails, getAllNotionDatabases} from "./apis/productivity/notion.js";
import {AuthoriseUser, SPOTIFY_ACCOUNTS_URL, ErrorRedirect, generateRandomString, getTokens, getPlaylists} from "./apis/media/spotify.js"

// dotenv.config({
//     "path": ""
// })

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const app = Express();

app.use(cookieParser());

app.use(cors());

app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});

//_ NOTION
app.get("/notion_db", async (req, res) => {
    const NOTION_DB_RESPONSE = await getAllNotionDatabases(NOTION_CLIENT(req.query.token));
    console.log(NOTION_DB_RESPONSE);
    res.send(NOTION_DB_RESPONSE);
});

app.get("/notion_uni_db", async (req, res) => {
    console.log(req);
    const NOTION_RESPONSE = await getNotionDatabaseDetails(NOTION_CLIENT(req.query.token));
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});

//_ SPOTIFY
app.get("/spotify", (req, res) => {
    const STATE = generateRandomString(16);
    console.debug(req.query.redirectURI);
    AuthoriseUser(res, STATE, req.query.redirectURI);
});

app.get("/spotify_callback", (req, res) => {
    const STATE = req.query.state || null;
    console.log(STATE);
    if (STATE === null) {
        ErrorRedirect("state mismatch", req, res);
    } else {
        res.send({
            authStatus: true,
            queryCode: req.query.code
        });
    }
});

app.get("/spotify_tokens", async (req, res) => {
    const AUTH_OPTIONS = {
        url: `${SPOTIFY_ACCOUNTS_URL}/api/token`,
        form: {
            code: req.query.queryCode,
            redirect_uri: 'http://localhost:3000/spotify_callback',
            grant_type: 'authorization_code'
        },
        headers: {
            "Authorization": `Basic ${new Buffer(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
            "Content-Type": "applicaton/x-www-form-urlencoded;charset=UTF-8"
        },
        json: true
    }
    await getTokens(AUTH_OPTIONS, res);
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
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});