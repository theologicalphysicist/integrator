import { Client } from "@notionhq/client";

export const NOTION_CLIENT = (token) => new Client({
    auth: token,
});
