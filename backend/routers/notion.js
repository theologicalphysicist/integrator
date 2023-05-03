import { Router } from "express";

//_ LOCAL
import { NOTION_CLIENT } from "../apis/clients.js";
import { getNotionDatabaseDetails, getAllNotionDatabases } from "../apis/productivity/notion.js";

const NOTION_ROUTER = Router();

//_ MIDDLEWARE
NOTION_ROUTER.use((req, res, next) => {
    if (!req.query.sessionID) { //* invalid request, no session id
        next(new Error("No session id given!"));
    };
    
    req.sessionStore.get(req.query.sessionID, (err, sess) => { //* invalid request, bad session id
        if (!sess) next(new Error("Invalid session id!"));
    });
});

//_ ROUTES
NOTION_ROUTER.get("/", async (req, res) => {
    console.log(req);
    const NOTION_RESPONSE = await getAllNotionDatabases(NOTION_CLIENT, process.env.NOTION_TOKEN);
    res.send(JSON.stringify(NOTION_RESPONSE, null, 4));
});

NOTION_ROUTER.get("/db", async (req, res) => {
    const NOTION_DB_RESPONSE = await getNotionDatabaseDetails(NOTION_CLIENT, process.env.NOTION_TOKEN, process.env.NOTION_DATABASE_ID);
    console.log(NOTION_DB_RESPONSE);
    res.send(NOTION_DB_RESPONSE);
});


export default NOTION_ROUTER;