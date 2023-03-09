import Express from "express";
import {NotionFetch, getNotionDB} from "./apis/productivity/notion.js";
import {AuthoriseUser, SPOTIFY_ACCOUNTS_URL, ErrorRedirect, generateRandomString, getTokens, getPlaylists} from "./apis/media/spotify.js"
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import {getGithubIssues, getGithubRepositories, getGithubRepositoryLanguages} from "./apis/productivity/github.js"; 

import * as ERROR_MESSAGES from "./const/error.js";

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const app = Express();

app.use(cookieParser());

app.use(cors());

app.use((err, req, res, next) => {
    console.log("ERROR");
    console.error(err);
});

app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
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

//_ GITHUB
app.get("/github_repositories", async (req, res, next) => {
    if (!req.query.username) {
        res.status(400).json(ERROR_MESSAGES.BAD_REQUEST);
    } else {
        res.send(await getGithubRepositories(req.query.username).catch(next));
    }

});


app.get("/github_repository_issues", async (req, res, next) => {
    if (!req.query.username || !req.query.repository) {
        res.status(400).json(ERROR_MESSAGES.BAD_REQUEST);
    } else {
        const RESPONSE = await getGithubIssues(req.query.username, req.query.repository).catch(next);
        res.send(RESPONSE);
    }
});


app.get("/github_repository_languages", async (req, res, next) => {
    console.log(req.query.repositories);
    if (!req.query.username || !req.query.repositories) {
        res.status(400).json(ERROR_MESSAGES.BAD_REQUEST);
    } else {

        const RESPONSE = await getGithubRepositoryLanguages(req.query.username, req.query.repositories);
        res.send(RESPONSE);
    };
});


app.listen(process.env.PORT, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});