import { Router } from "express";

//_ LOCAL
import { GITHUB_CLIENT } from "../apis/clients.js";
import {getGithubIssues, getGithubRepositories, getGithubRepositoryLanguages, getRateLimit} from "../apis/productivity/github.js";

import { ERROR_MESSAGE } from "../utils/error.js";

const GITHUB_ROUTER = Router();

//_ MIDDLEWARE
GITHUB_ROUTER.use(async (req, res, next) => {
    const LIMIT_RES = await getRateLimit(GITHUB_CLIENT);

    if (LIMIT_RES.error.present) next(ERROR_MESSAGE(500)); //* error getting rate limit. should be reported immediately
    
    if (req.query.repositories) { //* for cases where multiple requests will be made in one call
        (LIMIT_RES.data.resources.core.remaining < req.query.repositories) ? 
            next({
                ...ERROR_MESSAGE(429),
                details: `external rate limit will be exceeded by this request. please wait until ${new Date(LIMIT_RES.data.resources.core.reset)} before trying again.`
            }) : null; 
    } else if (LIMIT_RES.data.resources.core.remaining < 3) {
        next({
            ...ERROR_MESSAGE(429),
            details: `external rate limit will be exceeded by this request. please wait until ${new Date(LIMIT_RES.data.resources.core.reset * 1000)} before trying again.`
        });
    }

    if (!req.query.sessionID) { //* invalid request, no session id
        next({
            ...ERROR_MESSAGE(400),
            details: "invalid session ID provided.",
        });
    };

    if (!req.query.username) { //* invalid request, github requests require a username
        next({
            ...ERROR_MESSAGE(400),
            details: "invalid username provided.",
        });
    };


    req.sessionStore.get(req.query.sessionID, (err, sess) => { //* invalid request, bad session id

        if (!sess) next({
            ...ERROR_MESSAGE,
            statusCode: 400,
            error: "BAD REQUEST",
            details: "invalid session ID provided.",
        });

        next();
    });
});


GITHUB_ROUTER.use("/repository", (req, res, next) => {

    if (!req.query.repository && !req.query.repositories) { //* invalid request, certain github requests require a repository
        next({
            ...ERROR_MESSAGE(400),
            details: "invalid query parameters provided.",
        });
    };

    next();
});


//_ ROUTES
GITHUB_ROUTER.get("/limit", async (req, res, next) => {
    await getRateLimit(GITHUB_CLIENT)
        .then((github_res) => {

            if (github_res.error.present) throw new Error(github_res.error.details);

            res.status(200).send(github_res.data);
        })
        .catch((err) => {
            console.error(err);

            next({
                ...ERROR_MESSAGE(err.code || 500),
                details: err
            });
        });

});


GITHUB_ROUTER.get("/repositories", async (req, res, next) => {

    await getGithubRepositories(req.query.username, GITHUB_CLIENT)
        .then((github_res) => {

            if (github_res.error.present) throw new Error(github_res.error.details);

            res.status(200).json(github_res.data);
        })
        .catch((err) => {
            console.error(err);

            next({
                ...ERROR_MESSAGE(err.code || 500),
                details: err
            });
        });


});


GITHUB_ROUTER.get("/repository/issues", async (req, res, next) => {

    await getGithubIssues(req.query.username, req.query.repository, GITHUB_CLIENT)
        .then((github_res) => {

            if (github_res.error.present) throw new Error(github_res.error.details);

            res.status(200).send(github_res.data);
        })
        .catch((err) => {
            console.error(err);

            next({
                ...ERROR_MESSAGE(err.code || 500),
                details: err
            });
        });

});


GITHUB_ROUTER.get("/repository/languages", async (req, res, next) => {
    
    await getGithubRepositoryLanguages(req.query.username, req.query.repositories, GITHUB_CLIENT)
        .then((github_res) => {

            if (github_res.error.present) throw new Error(github_res.error.details);

            res.status(200).send(github_res.data);
        })
        .catch((err) => {
            console.error(err);

            next({
                ...ERROR_MESSAGE(err.code || 500),
                details: err
            });
        });


});


export default GITHUB_ROUTER;