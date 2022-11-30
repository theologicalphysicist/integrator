import Express from "express";
import {NotionFetch} from "./apis/productivity/notion.js";
import {SpotifyFetch, SPOTIFY_URL} from "./apis/media/spotify.js"
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import Request from "request";

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
    SpotifyFetch(req, res);
    console.log("HELLO");
    console.log("BYE BYE");
});
// `AQBLORiw0gFZlfhvSHpOdEw__UouVbYXgBC83hdLFfupk3T8hyPm9mDKmiuTApfCGSDL0Aop7rK-dp
// AOxfeRr9Ci_xqq0S6x0ZlaAy8dbSmzl-sZEPO4zf7SwySxara0AQcVogl4pbeRzoQQQHc6V7Ge8gslmADxFn8j2llFHgKRDHDP8p_utKhPZUjJop3cdPYkvZ7OqiWtEo-Xtt8Ysn1oxmnFqzv__QS1JdNEaObiedffJUYNfNAfkUj59P73Lq1YnCJ7X
// VLf8OIC-MCEHBrdaA0WGWWIhtYw1ZfFnntTt3RRN25zRaLL8CuAWb0dyUuawUTihOkgDCxbO1ZrCr8LXFsqDXvTmrBppg3ZuaCmdbZYeOoOEHhnxa3wQYY0DeTZgb-vH0n3arbN6uA6O7hhdpyvg3FDSfMT`

app.get("/spotify_callback", (req, res) =>{
    console.log(req.query.code);
    console.log("Basic " + new Buffer(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"));
    const authOptions = {
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
    }
    let auth_res = "";
    Request.post(authOptions, (err, res, body) => {
        console.log(res.statusCode);
        if (res.statusCode !== 200) {
            // console.error({err});
            console.error("REQUEST FAILED");
        } else {
            auth_res = body;
            console.log({body});
        }
    });
    res.redirect("http://localhost:3000/spotify_success")
    res.send(JSON.stringify(auth_res, null, 2))
});

app.get("/spotify_success", (req, res) => {
    res.send("TOKENS HERE");
});
// app.get("/microsoft_code_courses_lists", async (req, res) => {
//     const MICROSOFT_RESPONSE = await TodoFetch();
//     console.log(MICROSOFT_RESPONSE);
//     res.send(JSON.stringify(MICROSOFT_RESPONSE, null, 2));
// });

app.listen(process.env.PORT, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT}`);
});