import Express from "express";
import {NotionFetch} from "./apis/productivity/notion.js";
import {AuthoriseUser, SPOTIFY_ACCOUNTS_URL, ErrorRedirect, generateRandomString, getTokens, getPlaylists} from "./apis/media/spotify.js"
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
// import {TodoFetch} from "../dist/productivity/microsoft_todo.mjs";

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);

const app = Express();

app.use(cookieParser());

app.use(cors({
    origin: ["https://accounts.spotify.com/", "http://localhost:3000", "localhost:3000", "https://api.spotify.com/"],
    methods: ["*"],
    credentials: "true",
    optionsSuccesStatus: 200
}));

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
    AuthoriseUser(req, res, STATE, req.query.redirectURI);
});

app.get("/spotify_callback", async (req, res) => {
    const STATE = req.query.state || null;
    if (STATE === null) {
        ErrorRedirect("state_mismatch", req, res);
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
    // console.log(TOKENS_RES);
});

// app.get("/spotify_user_credentials", async (req, res) => {
//     console.log("HERE");
//     const AUTH_OPTIONS = {
//         url: `${SPOTIFY_ACCOUNTS_URL}api/token`,
//         form: {
//             code: req.query.code,
//             redirect_uri: "http://localhost:3000/spotify_playlists",
//             grant_type: "authorization_code"
//         },
//         headers: {
//             "Authorization": `Basic ${new Buffer(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
//             "Content-Type": "applicaton/x-www-form-urlencoded"
//         },
//         json: true
//     };
    
//     Request.post(AUTH_OPTIONS, (err, res, body) => {
//         console.log({body});
//         if (err || res.statusCode != 200) {
//             console.log(err);
//             console.log("INVALID TOKEN");
//         } else {
//             const OPTIONS = {
//                 url: `${SPOTIFY_API_URL}me`,
//                 headers: {
//                     "Authorization": `Bearer ${body.access_token}`,
//                 },
//                 json: true
//             }
//             Request.get(OPTIONS, (err, res, credentials_body) => {
//                 console.log(res.statusCode);
//                 if (err || res.statusCode != 200) {
//                     console.error(credentials_body.error.message);
//                 } else {
//                     console.log({credentials_body});
//                     res.send({
//                         "country": credentials_body.country,
//                         "displayName": credentials_body.display_name,
//                         "email": credentials_body.email,
//                         "link": credentials_body.href,
//                         "id": credentials_body.id
//                     });
//                 }
//             });
//         }
//     });
// });

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

// app.get("/microsoft_code_courses_lists", async (req, res) => {
//     const MICROSOFT_RESPONSE = await TodoFetch();
//     console.log(MICROSOFT_RESPONSE);
//     res.send(JSON.stringify(MICROSOFT_RESPONSE, null, 2));
// });

app.listen(process.env.PORT, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});