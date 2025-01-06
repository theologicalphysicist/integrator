import Express, { Router } from "express";

import queryString from "query-string";
import EventEmitter from "node:events";

//_ LOCAL
import { getAuthCode, refreshToken, getPlaylists, createPlaylist, querySong } from "../apis/media/spotify.js";
import { getAppleMusicPlaylist } from "../apis/media/applemusic.js"; //! REMEMBER THIS IS TEMPORARY

import { SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "../apis/clients.js";

import { SPOTIFY_ACCOUNTS_URL } from "../utils/const.js";
import { ERROR_MESSAGE } from "../utils/error.js";
import { Verbal } from "../utils/logger.js";


const SPOTIFY_ROUTER = Router(); 
const SPOTIFY_TOKENS_AVAILABLE = new EventEmitter(); //* for long-polling to handle spotify tokens
const SPOTIFY_LOGGER = new Verbal("spotify");


//_ MIDDLEWARE
SPOTIFY_ROUTER.use((req, res, next) => {
    SPOTIFY_LOGGER.debug({sessionID: req.session})
    if (!["/callback", "/spotify.html"].includes(req.path)) {
        
        if (!req.query.sessionID) next({ //* invalid request, no session id
            ...ERROR_MESSAGE(400),
            details: "invalid session ID provided.",
        });

        req.sessionStore.get(req.query.sessionID, (err, sess) => {
            SPOTIFY_LOGGER.debug({err});

            if (!sess || err) {
                
                next({ //* invalid request, bad session id
                    ...ERROR_MESSAGE(400),
                    details: "invalid session ID provided.",
                });
            } else {
                SPOTIFY_LOGGER.debug({sess});

                req.currentSession = sess;
                req.currentCookies = {
                    cookie: {...sess.cookie},
                    id: sess.cookieID ?? null
                };

                next();
            }
        });

    } else {

        next();
    };

});


SPOTIFY_ROUTER.use("/resource", async (req, res, next) => {
    SPOTIFY_LOGGER.debug({currentSession: req.currentSession});
    
    if (req.currentSession.spotify.expiryTime <= Date.now()) { //* i.e., the tokens have expired, since "now" is after the expiry date.
        SPOTIFY_LOGGER.log("TOKENS EXPIRED. REFRESHING...");
        const NEW_TOKENS = await refreshToken(
            req.currentSession.spotify.refreshToken,
            SPOTIFY_ACCOUNTS_INSTANCE(
                process.env.SPOTIFY_CLIENT_ID, 
                process.env.SPOTIFY_CLIENT_SECRET
            )
        );

        if (NEW_TOKENS.error.present) next({
            ...ERROR_MESSAGE(NEW_TOKENS.error.code || 500),
            details: NEW_TOKENS.error.details ?? "unable to refresh sessionvvvvv"
        });

        req.sessionStore.set(req.query.sessionID, {
            ...req.currentSession,
            spotify: {
                accessToken: NEW_TOKENS.data.access_token,
                scope: NEW_TOKENS.data.scope,
                expiryTime: (NEW_TOKENS.data.expires_in * 1000) + Date.now(),
                refreshToken: req.currentSession.spotify.refreshToken,
                tokenType: NEW_TOKENS.data.token_type
            }
        }, (err) => {
            if (err) next({
                ...ERROR_MESSAGE(500), //TODO: look up status codes and see if there is a more appropiate code
                details: "cannot update session. please query /refresh endpoint to refresh tokens."
            });
        });

    };

    //TODO: adapt spotify session to also contain username & user_id.
    //TODO: all resource requests should require this information from session store

    next();
});


// SPOTIFY_ROUTER.use(Express.static("./public"));


//_ ROUTES
SPOTIFY_ROUTER.get("/", async (req, res) => { //* TEST ROUTE

    res.status(200).json({
        url: req.path,
        cookies: req.cookies,
        session: {
            session: req.session,
            currentSession: req.currentSession
        },
        genID: req.sessionID,
        myID: req.query.sessionID,
    });
});


//_ AUTH
SPOTIFY_ROUTER.get("/authorization", async (req, res, next) => { //TODO: turn into /resource/authoriation, so that the token refresh is already done.
    SPOTIFY_LOGGER.debug({currentSession: req.currentSession.spotify});
    SPOTIFY_LOGGER.debug({tests: {
        "stringifyTest": JSON.stringify(req.currentSession.spotify) != "{}",
        "typicalTest": req.currentSession.spotify != null,
        "dictTest": req.currentSession.spotify != {},
        "typeTest": req.currentSession.spotify != undefined,
        "toKnow": !req.currentSession.spotify,
    }});
    SPOTIFY_LOGGER.debug({currentSession: req.currentSession.spotify});
    SPOTIFY_LOGGER.debug({sessionType: typeof req.currentSession.spotify});

    if (req.currentSession.spotify) {
        //_ GET CURRENT TIME
        const NOW = Date.now();

        //_ COMPARE WITH EXPIRY IN DATABASE
        SPOTIFY_LOGGER.debug({
            "now": NOW,
            "expiryTime": req.currentSession.spotify.expiryTime,
            "expired": NOW > req.currentSession.spotify.expiryTime
        });

        //_ REFRESH TOKEN
        if (NOW >= req.currentSession.spotify.expiryTime) {
            await refreshToken(
                req.currentSession.spotify.refreshToken, 
                SPOTIFY_ACCOUNTS_INSTANCE(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET),
                SPOTIFY_LOGGER
            ).then((refresh_res) => {
                SPOTIFY_LOGGER.debug({refresh_res});

                if (refresh_res.error.present) next(refresh_res.error);

                req.sessionStore.set(
                    req.query.sessionID, 
                    {
                        ...req.currentSession,
                        spotify: {
                            accessToken: refresh_res.data.access_token,
                            scope: refresh_res.data.scope,
                            expiryTime: (refresh_res.data.expires_in * 1000) + NOW,
                            refreshToken: req.currentSession.spotify.refreshToken,
                            tokenType: refresh_res.data.token_type
                        }
                    }, 
                    (err) => {if (err) next({...ERROR_MESSAGE(500), details: err});
                });

                res.status(200).json({
                    tokenRefresh: true,
                    tokensValid: true,
                    authURL: ""
                });
            }).catch((err) => {
                SPOTIFY_LOGGER.error({err});

                next(ERROR_MESSAGE(500, err.toString()));
            }) 
        } else {

            res.status(200).send({
                tokenRefresh: false,
                tokensValid: true,
                authURL: ""
            });

        };

    } else {

        res.status(302).send({
            tokenRefresh: false,
            tokensValid: false,
            authURL: `${SPOTIFY_ACCOUNTS_URL}/authorize?${queryString.stringify({
                response_type: "code",
                client_id: process.env.SPOTIFY_CLIENT_ID,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                scope: process.env.SPOTIFY_SCOPES,
                show_dialog: true,
                state: req.query.sessionID
            })}`
        });
    }

    //! NOTE THAT THIS METHOD MAY CAUSE ISSUES IF ACCESSING FROM A SITE INSTEAD OF DESKTOP

});


SPOTIFY_ROUTER.get("/callback", async (req, res, next) => {

    SPOTIFY_LOGGER.log({
        locals: {
            req: req.locals,
            res: res.locals
        },
        sess: {
            req: req.session,
            res: res.session
        }
    });

    if (req.query.code && req.query.state) {

        await getAuthCode(
            req.query.code, 
            process.env.SPOTIFY_REDIRECT_URI,
            SPOTIFY_ACCOUNTS_INSTANCE(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET),
            SPOTIFY_LOGGER
        )
        .then((token_res) => {

            if (token_res.error.present) throw new Error(token_res.error.details);

            SPOTIFY_LOGGER.log({token_res});

            req.sessionStore.get(req.query.state, (err, sess) => {
                
                if (err) throw new Error(`no session found. invalid authentication. ${err}`);

                req.sessionStore.set(req.query.state, {
                    ...sess,
                    spotify: {
                        accessToken: token_res.data.access_token,
                        scope: token_res.data.scope,
                        expiryTime: (token_res.data.expires_in * 1000) + Date.now(),
                        refreshToken: token_res.data.refresh_token,
                        tokenType: token_res.data.token_type
                    }
                }, (err) => {
                    if (err) throw new Error("session could not be set");
                });

                SPOTIFY_TOKENS_AVAILABLE.emit("tokens-available", req.query.state);
            });

            res.redirect("spotify.html");
        })
        .catch((err) => {
            next({
                ...ERROR_MESSAGE(500),
                details: err
            });
        });

    } else {
        next(ERROR_MESSAGE(500));
    };

});


SPOTIFY_ROUTER.get("/tokens", async (req, res) => {
    const HANDLE_RES = (data) => {
        res.json({tokensAvailable: true});
        SPOTIFY_TOKENS_AVAILABLE.removeListener("tokens-available", HANDLE_RES);
    };

    SPOTIFY_TOKENS_AVAILABLE.on("tokens-available", HANDLE_RES);
});


SPOTIFY_ROUTER.post("/refresh", async (req, res, next) => {
    const NEW_TOKENS = await refreshToken(
        req.currentSession.spotify.refreshToken,
        SPOTIFY_ACCOUNTS_INSTANCE(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET),
        SPOTIFY_LOGGER
    );

    if (NEW_TOKENS.error.present) next({
        ...ERROR_MESSAGE(NEW_TOKENS.error.code || 500),
        details: NEW_TOKENS.error.details
    });

    req.sessionStore.set(
        req.query.sessionID, 
        {
            ...req.currentSession,
            spotify: {
                accessToken: NEW_TOKENS.data.access_token,
                scope: NEW_TOKENS.data.scope,
                expiryTime: (NEW_TOKENS.data.expires_in * 1000) + Date.now(),
                refreshToken: req.currentSession.spotify.refreshToken,
                tokenType: NEW_TOKENS.data.token_type
            }
        }, 
        (err) => {if (err) next({...ERROR_MESSAGE(500), details: err});
    });

    res.status(200).json({
        result: true,
        message: "TOKENS REFRESHED",
        id: req.currentSession.id,
        cookies: req.currentCookies,
    });
});


//_ RESOURCES
SPOTIFY_ROUTER.get("/resource/playlists", async (req, res, next) => {
    let token_type = req.currentSession.spotify.tokenType;
    let access_token = req.currentSession.spotify.accessToken;

    await getPlaylists(
        SPOTIFY_API_INSTANCE(token_type, access_token),
        SPOTIFY_LOGGER
    ).then((spotify_res) => {
        
        if (spotify_res.error.present) next(spotify_res.error);

        res.status(200).json(spotify_res.data)
    }).catch((err) => {
        SPOTIFY_LOGGER.error({err});

        next(ERROR_MESSAGE(500, err.toString()));
    });
    
});


SPOTIFY_ROUTER.post("/resource/playlist", async (req, res, next) => {
    let token_type = req.currentSession.spotify.tokenType;
    let access_token = req.currentSession.spotify.accessToken;

    if (!req.query.playlistName || !req.query.playlistDesc) next({
        ...ERROR_MESSAGE(400),
        details: `please provide required request parameters.`
    });

    await createPlaylist(SPOTIFY_API_INSTANCE(token_type, access_token), process.env.SPOTIFY_USER_ID, "TESTER", "TEST PLAYLIST FROM INTEGRATOR")
        .then((spotify_res) => {

            if (spotify_res.error.present) throw new Error(JSON.stringify(spotify_res.error)) ;

            res.status(200).json(spotify_res.data);
        })
        .catch((err) => {
            const ERROR = JSON.parse(err.message);
            if (process.env.NODE_ENV === "local") SPOTIFY_LOGGER.error(ERROR);

            next({
                ...ERROR_MESSAGE(ERROR.code),
                details: JSON.parse(ERROR.details),
            });
        });

});


SPOTIFY_ROUTER.post("/resource/playlists", async (req, res, next) => {



});



SPOTIFY_ROUTER.get("/resource/user", async (req, res, next) => {
    let token_type = req.currentSession.spotify.tokenType;
    let access_token = req.currentSession.spotify.accessToken;

    await createPlaylist(
        SPOTIFY_API_INSTANCE(token_type, access_token), 
        process.env.SPOTIFY_USER_ID, 
        "TESTER", 
        "TEST PLAYLIST FROM INTEGRATOR"
    )
    .then((spotify_res) => {

        if (spotify_res.error.present) throw new Error(JSON.stringify(spotify_res.error));

        res.status(200).json(spotify_res.data);
    })
    .catch((err) => {
        const ERROR = JSON.parse(err.message);
        if (process.env.NODE_ENV === "local") SPOTIFY_LOGGER.error(ERROR);

        next({
            ...ERROR_MESSAGE(ERROR.code),
            details: JSON.parse(ERROR.details),
        });
    });

});


SPOTIFY_ROUTER.get("/resource/search", async (req, res, next) => {
    let token_type = req.currentSession.spotify.tokenType;
    let access_token = req.currentSession.spotify.accessToken;
    const SONGS = getPlaylists("21");

    // SPOTIFY_LOGGER.debug({SONG});

    // res.status(200).send({result: true});
    
    await querySong(
        SPOTIFY_API_INSTANCE(token_type, access_token), 
        SPOTIFY_LOGGER,
        SONGS[0]
    )
    .then((spotify_res) => {
        
        if (spotify_res.error.present) throw new Error(JSON.stringify(spotify_res.error));

        res.status(200).json(spotify_res.data);
    })
    .catch((err) => {
        const ERROR = JSON.parse(err.message);
        if (process.env.NODE_ENV === "local") SPOTIFY_LOGGER.error(ERROR);

        next({
            ...ERROR_MESSAGE(ERROR.code),
            details: JSON.parse(ERROR.details),
        });
    });

});


export default SPOTIFY_ROUTER;