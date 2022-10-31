import Express from "express";
import {NotionFetch} from "./apis/productivity/notion.js";

const app = Express();

app.get("/", (req, res) => {
    res.send("HELLO");
});

app.get("/notion", async (req, res) => {
    const NOTION_RESPONSE = await NotionFetch();
    // console.log(NOTION_RESPONSE);
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});