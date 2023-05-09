import { Router } from "express";

import queryString from "query-string";
import EventEmitter from "node:events";

//_ LOCAL
import { getAuthCode, refreshToken, getPlaylists } from "../apis/media/spotify.js";
import { SPOTIFY_ACCOUNTS_URL } from "../utils/const.js";
import { GENERIC_ERROR_MESSAGE } from "../utils/error.js";


const SPOTIFY_ROUTER = Router();

//* long-polling to handle spotify tokens
const SPOTIFY_TOKENS_AVAILABLE = new EventEmitter();


//_ MIDDLEWARE
SPOTIFY_ROUTER.use((req, res, next) => {

    if (req.path != "/callback") {
        
        if (!req.query.sessionID) { //* invalid request, no session id
            next({
                ...GENERIC_ERROR_MESSAGE,
                statusCode: 400,
                error: "BAD REQUEST",
                details: "invalid session ID provided.",
            });
        };

        req.sessionStore.get(req.query.sessionID, (err, sess) => { //* invalid request, bad session id

            console.log({sess});
            console.log({err});

            if (!sess) next({
                ...GENERIC_ERROR_MESSAGE,
                statusCode: 400,
                error: "BAD REQUEST",
                details: "invalid session ID provided.",
            });

            next();
        });

    } else {
        next();
    };


});


//_ ROUTES
SPOTIFY_ROUTER.get("/", async (req, res) => {
    // req.originalUrl
    res.json({
        url: req.path,
        cookies: req.cookies,
        session: req.session,
        genID: req.sessionID,
        myID: req.query.sessionID
    });
});


SPOTIFY_ROUTER.get("/authorization", async (req, res) => {

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

});


SPOTIFY_ROUTER.get("/callback", async (req, res, next) => {
    console.log("HERE");

    if (req.query.code && req.query.state) {

        const TOKEN_RES = await getAuthCode(
            req.query.code, 
            process.env.SPOTIFY_CLIENT_ID, 
            process.env.SPOTIFY_CLIENT_SECRET, 
            process.env.SPOTIFY_REDIRECT_URI
        );

        console.log("HERE");

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

        next(GENERIC_ERROR_MESSAGE);

    };

});


SPOTIFY_ROUTER.get("/tokens", async (req, res) => {

    const HANDLE_RES = (data) => {
        res.json({tokensAvailable: true});
        SPOTIFY_TOKENS_AVAILABLE.removeListener("tokens-available", HANDLE_RES);
    };

    SPOTIFY_TOKENS_AVAILABLE.on("tokens-available", HANDLE_RES);

});


SPOTIFY_ROUTER.get("/playlists", async (req, res) => {

    req.sessionStore.get(req.query.sessionID, async (err, sess) => {

        if (err) next(GENERIC_ERROR_MESSAGE);

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
        
        if (!PLAYLIST_RES) next(GENERIC_ERROR_MESSAGE);
        res.send(PLAYLIST_RES);
    });

});


SPOTIFY_ROUTER.post("/refresh", async (req, res) => {
    req.sessionStore.get(req.query.sessionID, async (err, sess) => {
        const NEW_TOKENS = await refreshToken(
            sess.spotify.refreshToken,
            process.env.SPOTIFY_CLIENT_ID, 
            process.env.SPOTIFY_CLIENT_SECRET
        );

        const TOKEN_TYPE = NEW_TOKENS.token_type;
        const ACCESS_TOKEN = NEW_TOKENS.access_token;

        req.sessionStore.set(req.query.sessionID, {
            ...sess,
            spotify: {
                accessToken: ACCESS_TOKEN,
                scope: NEW_TOKENS.scope,
                expiryTime: (NEW_TOKENS.expires_in * 1000) + Date.now(),
                refreshToken: sess.spotify.refreshToken,
                tokenType: TOKEN_TYPE
            }
        });

        res.status(200).json({
            result: true,
            message: "TOKENS REFRESHED",
            id: sess.id,
            cookies: {
                ...req.session.cookie,
                cookieID: sess.cookieID
            }

        })
    });
});


export default SPOTIFY_ROUTER;

//TODO: SEPARATE ALL ROUTES INTO SEPARATE FILES FOR SERVER