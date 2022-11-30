import Express from "express";
import {NotionFetch} from "./apis/productivity/notion.js";
import {SpotifyAuthUser, SPOTIFY_URL, SpotifyAuthError, SpotifyAuthTokens} from "./apis/media/spotify.js"
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import Request from "request";
import { generateRandomString } from "./utils/spotify_utils.js";
import QueryString from "qs";

// import {TodoFetch} from "../dist/productivity/microsoft_todo.mjs";

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const app = Express();

app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});

app.get("/notion_uni_database", async (req, res) => {
    const NOTION_RESPONSE = await NotionFetch();
    // console.log(NOTION_RESPONSE);
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});

app.get("/spotify", (req, res) => {
    const STATE = generateRandomString(16);
    SpotifyAuthUser(req, res, STATE);
});

app.get("/spotify_callback", async (req, res) =>{
    const STATE = req.query.state || null;
    if (STATE === null) {
        SpotifyAuthError("state_mismatch", req, res);
    } else {
        SpotifyAuthTokens(req, res, {
            url: `${SPOTIFY_URL}api/token`,
            form: {
                code: req.query.code,
                redirect_uri: "http://localhost:3000/spotify_callback",
                grant_type: "authorization_code"
            },
            headers: {
                "Authorization": `Basic ${new Buffer(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`
            },
            json: true
        });
    }
    // res.redirect("http://localhost:3000/spotify_success")
});

app.get("/spotify_success", (req, res) => {
    res.send(req.cookies);
});
// app.get("/microsoft_code_courses_lists", async (req, res) => {
//     const MICROSOFT_RESPONSE = await TodoFetch();
//     console.log(MICROSOFT_RESPONSE);
//     res.send(JSON.stringify(MICROSOFT_RESPONSE, null, 2));
// });

app.listen(process.env.PORT, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});