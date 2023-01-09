import Express from "express";
import {NotionFetch, getNotionDB} from "./apis/productivity/notion.js";

const app = Express();

app.get("/", (req, res) => {
    res.send(`Integrator Backend is running on port ${process.env.PORT}`);
});

app.get("/notion_uni_db", async (req, res) => {
    console.log(req);
    const NOTION_RESPONSE = await NotionFetch();
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});

app.get("/notion_db", async (req, res) => {
    const NOTION_DB_RESPONSE = await getNotionDB();
    console.log(NOTION_DB_RESPONSE);
    res.send(NOTION_DB_RESPONSE);
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});