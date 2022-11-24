import {Client} from "@notionhq/client";

const NOTION_CLIENT = new Client({
    auth: process.env.NOTION_TOKEN,
});

export const NotionFetch = async () => {
    // console.log(process.env.NOTION_TOKEN);
    const res = await NOTION_CLIENT.databases.query({
        database_id: process.env.NOTION_UNI_DB_ID,
    });
    // console.log(res);
    return res;
}