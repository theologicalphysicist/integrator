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
import APPLE_MUSIC_ROUTER from "./routers/applemusic.js";
import INTEGRATIONS_ROUTER from "./routers/integrations.js";

//_ LOCAL UTILITIES
import { MONGODB_URL } from "./utils/const.js";
import { ERROR_MESSAGE } from "./utils/error.js";
import {Verbal} from "./utils/logger.js";
import { CSVtoJSON, generateRandomString } from "./utils/func.js";
import { Framework } from "./utils/types.js";

//_ CONTROLLERS
import { MONGODB_CLIENT } from "./apis/clients.js";


const app = Express();
const INDEX_LOGGER = new Verbal("index", true, Framework.MORGAN);
const STORE = MongoStore.create({
    mongoUrl: MONGODB_URL(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD),
    dbName: "sessions",
    collectionName: "user_sessions",
    stringify: false,
});


//_ MIDDLEWARE
app.use(cors());
app.use(morgan((tokens, req, res) => INDEX_LOGGER.request(tokens, req, res), {
    skip: false,
    immediate: true
}));
app.use(morgan((tokens, req, res) => INDEX_LOGGER.response(tokens, req, res), {
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


//_ OTHER
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


app.get("/logger_test", async (req, res, next) => {
    const LOGGER = new Verbal();

    LOGGER.debug("TESTING THIS");
    LOGGER.info(JSON.stringify(process.env, null, 2));
    LOGGER.warn({data: "NOW TESTING JSON"});
    LOGGER.error(ERROR_MESSAGE(500));

    res.status(200).send({response: "DONE"})
});


app.get("/apple", async (req, res, next) => {
    const FILE_PATH = new URL("./public/My Apple Music Library.csv", import.meta.url);
    const FORMATTED_FILE_PATH = new URL("./public/apple_music.json", import.meta.url);
    // INDEX_LOGGER.debug(FORMATTED_FILE_PATH.pathname);

    await CSVtoJSON(FILE_PATH, FORMATTED_FILE_PATH.pathname)
        .then((void_value) => {

            res.send({result: true});
        })
        .catch((err) => {

            next(ERROR_MESSAGE(500));
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
app.use("/notion", NOTION_ROUTER);


//_ SPOTIFY
app.use("/spotify", SPOTIFY_ROUTER);


//_ APPLE MUSIC
app.use("/apple_music", APPLE_MUSIC_ROUTER);


//_ MICROSOFT


//_ GITHUB
app.use("/github", GITHUB_ROUTER);


//_INTEGRATIONS
app.use("/integrations", INTEGRATIONS_ROUTER);


//_ CONFIG
//_ ERROR HANDLING
app.use((err, req, res, next) => {
    INDEX_LOGGER.error({err});

    res.status(err.statusCode || 500).json({error: err});
});

//_ SERVER
app.listen(process.env.PORT || 3000, () => {
    console.log(`CORS-enabled Integrator App listening on port ${process.env.PORT || 3000}`);
});