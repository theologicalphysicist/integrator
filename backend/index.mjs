import Express from "express";
import {NotionFetch} from "./apis/productivity/notion.js";

const app = Express();

app.get("/", (req, res) => {
    res.send(`Integrator Backend is running on port ${process.env.PORT}`);
});

app.get("/notion_uni_db", async (req, res) => {
    console.log(req);
    const NOTION_RESPONSE = await NotionFetch();
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});