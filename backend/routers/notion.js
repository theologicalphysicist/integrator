import { Router } from "express";

//_ LOCAL
import { NOTION_CLIENT } from "../apis/clients.js";
import { getNotionDatabaseDetails, getAllNotionDatabases } from "../apis/productivity/notion.js";

import { ERROR_MESSAGE } from "../utils/error.js";


const NOTION_ROUTER = Router();


//_ MIDDLEWARE
NOTION_ROUTER.use((req, res, next) => {

    if (!req.query.sessionID) { //* invalid request, no session id
        next({
            ...ERROR_MESSAGE(400),
            details: "invalid session ID provided.",
        });
    };

    req.sessionStore.get(req.query.sessionID, (err, sess) => { //* invalid request, bad session id

        if (!sess || err) next({
            ...ERROR_MESSAGE(400),
            details: "invalid session ID provided.",
        });

        next();
    });

});


//_ ROUTES
NOTION_ROUTER.get("/", async (req, res, next) => {

    getAllNotionDatabases(NOTION_CLIENT(process.env.NOTION_TOKEN))
        .then((notion_res) => {

            if (notion_res.error.present) throw new Error(notion_res.error.details);

            res.status(200).json(notion_res.data);
        })
        .catch((err) => {
            console.log({err});

            next({
                ...ERROR_MESSAGE(err.code || 500),
                details: err
            });
        });
    
});


NOTION_ROUTER.get("/db", async (req, res, next) => {
    
    await getNotionDatabaseDetails(NOTION_CLIENT(process.env.NOTION_TOKEN), process.env.NOTION_DATABASE_ID)
        .then((notion_res) => {

            if (notion_res.error.present) throw new Error(notion_res.error.details);

            res.status(200).json(notion_res.data);
        })
        .catch((err) => {
            console.log({err});

            next({
                ...ERROR_MESSAGE(err.code || 500),
                details: err
            });
        });

});


export default NOTION_ROUTER;