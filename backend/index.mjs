import Express from "express";
import {NotionFetch} from "./apis/productivity/notion.js";
// import {TodoFetch} from "../dist/productivity/microsoft_todo.mjs";

const app = Express();

app.get("/", (req, res) => {
    res.send("HELLO");
});

app.get("/notion_uni_database", async (req, res) => {
    const NOTION_RESPONSE = await NotionFetch();
    // console.log(NOTION_RESPONSE);
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});

// app.get("/microsoft_code_courses_lists", async (req, res) => {
//     const MICROSOFT_RESPONSE = await TodoFetch();
//     console.log(MICROSOFT_RESPONSE);
//     res.send(JSON.stringify(MICROSOFT_RESPONSE, null, 2));
// });

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});