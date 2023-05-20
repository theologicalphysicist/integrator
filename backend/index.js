import Express from "express";

import { v4 as uuidv4 } from "uuid";

//_ MIDDLEWARE IMPORTS
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";

//_ ROUTERS
import NOTION_ROUTER from "./routers/notion.js";
import SPOTIFY_ROUTER from "./routers/spotify.js";
import GITHUB_ROUTER from "./routers/github.js";

//_ LOCAL
import { MONGODB_URL } from "./utils/const.js";
import { ERROR_MESSAGE } from "./utils/error.js";
import {RequestLoggerFormat, ResponseLoggerFormat} from "./utils/logger.js";
import { generateRandomString } from "./utils/func.js";

import { MONGODB_CLIENT } from "./apis/clients.js";

const app = Express();
const STORE = MongoStore.create({
    mongoUrl: MONGODB_URL(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD),
    dbName: "sessions",
    collectionName: "user_sessions",
    stringify: false,
});

//_ MIDDLEWARE
app.use(cors());
app.use(morgan((tokens, req, res) => RequestLoggerFormat(tokens, req, res), {
    skip: false,
    immediate: true
}));
app.use(morgan((tokens, req, res) => ResponseLoggerFormat(tokens, req, res), {
    skip: false,
    immediate: false
}));
app.use(Express.static("./public"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    genid: (req) => {
        return uuidv4();
    },
    name: "bing",
    resave: false,
    secret: process.env.SESSION_SECRET,
    store: STORE,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, //* 1 day in millisecs
    },
}));


//_ SERVER
app.get("/", (req, res) => {
    res.send(`CORS-enabled Integrator App listening on port ${process.env.PORT} \n With sessionID ${req.sessionID}`);
});


app.get("/init", async (req, res, next) => {
    const COOKIE_ID = generateRandomString(7);
    
    req.session.cookieID = COOKIE_ID;
    req.session.save((err) => {
        if (err) next({
            ...ERROR_MESSAGE(500),
            details: err
        });
    });

    res
        .cookie("test", JSON.stringify({
                ...req.session.cookie,
                cookieID: COOKIE_ID
            })
        )
        .json({
            result: true,
            message: "SESSION INITIALISED",
            id: req.session.id,
            cookies: {
                ...req.session.cookie,
                cookieID: COOKIE_ID
            }
        });
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


app.get("/cookie_test", async (req, res) => {
    console.log(req.headers.cookie);
    console.log(req.cookies);
    console.log(req.session);
    res.send({result: true});
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
app.use("/notion", NOTION_ROUTER);


//_ SPOTIFY
app.use("/spotify", SPOTIFY_ROUTER);


//_ MICROSOFT


//_ GITHUB
app.use("/github", GITHUB_ROUTER)


//TODO: CONSIDER WRAP-RESPONSE FUNCTION FOR ALL API FUNCS


//_ CONFIG
//_ ERROR HANDLING
app.use((err, req, res, next) => {
    console.error({err});

    res.status(err.statusCode || 500).json({error: err});
});

//_ SERVER
app.listen(process.env.PORT || 3000, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT || 3000}`);
});